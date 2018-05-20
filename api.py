# -*- coding: utf-8 -*-

import base64
import alsa_mixer
import player
import db
from publisher import Publisher
from flask import Flask, jsonify, redirect
from flask_restful import Api, Resource, abort, reqparse
from flask_cors import CORS
from flask_mqtt import Mqtt
from flask_socketio import SocketIO
from flask_login import LoginManager, UserMixin, login_required


app = Flask(__name__)
app.config["ERROR_404_HELP"] = False
app.config["MQTT_BROKER_URL"] = "127.0.0.1"
app.secret_key = "super secret key"
api = Api(app)
mqtt = Mqtt(app)
CORS(app)
socketio = SocketIO(app)
publisher = Publisher(mqtt, socketio)
login_manager = LoginManager()

with open("api-key.txt", "rb") as api_key_file:
    api_key = api_key_file.read()


class User(UserMixin):
    def __init__(self, user_id, password):
        super(User, self).__init__()
        self.id = user_id
        self.password = password

    def check(self, key):
        return key == self.password


user = User(1, api_key)


@login_manager.request_loader
def load_user_from_request(request):
    api_key_b64 = request.headers.get("Api-Key")
    if api_key_b64:
        try:
            key = base64.b64decode(api_key_b64)
        except TypeError:
            return None
        if user.check(key):
            return user
    return None


@app.teardown_appcontext
def close_db_connection(exception):
    db.close()


def get_station_parser():
    station_parser = reqparse.RequestParser()
    station_parser.add_argument("name", type=str, required=True)
    station_parser.add_argument("url", type=str, required=True)
    return station_parser


class StationList(Resource):
    method_decorators = [login_required]

    def __init__(self):
        super(StationList, self).__init__()
        self.station_parser = get_station_parser()

    def get(self):
        return db.query("select _rowid_ as _id, name, url from stations")

    def post(self):
        station = self.station_parser.parse_args()
        db.query("insert into stations values (?, ?)", [station["name"], station["url"]])
        db.get().commit()
        station["_id"] = db.query("select last_insert_rowid() as _id", one=True)["_id"]
        publisher.publishStations(StationList().get())
        return station


class Station(Resource):
    method_decorators = [login_required]

    def __init__(self):
        super(Station, self).__init__()
        self.station_parser = get_station_parser()

    def get(self, id):
        station = db.query("select _rowid_ as _id, name, url from stations where _id = ?", [id], one=True)
        if not station:
            abort(404, message="station {} not found".format(id))
        return station

    def delete(self, id):
        db.query("delete from stations where _rowid_ = ?", [id])
        db.get().commit()
        publisher.publishStations(StationList().get())
        return db.query("select changes() as n", one=True)

    def put(self, id):
        args = self.station_parser.parse_args()
        db.query("update stations set name = ?, url = ? where _rowid_ = ?", [args["name"], args["url"], id])
        db.get().commit()
        publisher.publishStations(StationList().get())
        return self.get(id)


class Volume(Resource):
    method_decorators = [login_required]

    def __init__(self):
        super(Resource, self).__init__()
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("volume", type=int, required=True)

    def get(self):
        return alsa_mixer.get_volume()

    def put(self):
        args = self.parser.parse_args()
        volume = args["volume"]
        alsa_mixer.set_volume(volume)
        publisher.publishVolume(volume)

    def post(self):
        self.put()


@app.route("/status")
@login_required
def status():
    return jsonify(player.selected_station)


def stop_impl():
    player.stop()
    publisher.publishStatus(None)
    return jsonify({})


@app.route("/stop")
@login_required
def stop():
    return stop_impl()


@app.route("/play/<int:id>")
@login_required
def play(id):
    resource = Station()
    station = resource.get(id)
    player.play(station)
    publisher.publishStatus(station)
    return jsonify(station)


@mqtt.on_connect()
def on_mqtt_connect(client, userdata, flags, rc):
    mqtt.subscribe("radio/play")
    mqtt.subscribe("radio/stop")
    with app.app_context():
        publisher.publishStations(StationList().get())
        stop_impl()
        publisher.publishVolume(alsa_mixer.get_volume())


@mqtt.on_message()
def on_mqtt_message(client, userdata, msg):
    with app.app_context():
        if msg.topic == "radio/play":
            play(int(msg.payload.decode()))
        elif msg.topic == "radio/stop":
            stop_impl()


@socketio.on("connect")
@login_required
def socketio_connect_handler():
    pass


api.add_resource(StationList, "/stations")
api.add_resource(Station, "/stations/<int:id>")
api.add_resource(Volume, "/volume")

@app.route('/')
def index():
    return redirect('static/index.html')

if __name__ == "__main__":
    db.init(app)
    login_manager.init_app(app)
    socketio.run(app, host="0.0.0.0", port=3000)
