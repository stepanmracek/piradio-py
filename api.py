# -*- coding: utf-8 -*-

import sqlite3
import json
import base64
import alsa_mixer
import player
from publisher import Publisher
from flask import Flask, g, jsonify
from flask_restful import Api, Resource, abort, reqparse
from flask_cors import CORS
from flask_mqtt import Mqtt
from flask_socketio import SocketIO
from flask_login import LoginManager, UserMixin, login_required


DATABASE = "database.sqlite"
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


def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource("schema.sql", mode="r") as f:
            db.cursor().executescript(f.read())
        db.commit()


def make_dicts(cursor, row):
    return dict((cursor.description[idx][0], value)
                for idx, value in enumerate(row))


def get_db():
    db = getattr(g, "database", None)
    if db is None:
        db = g.database = sqlite3.connect(DATABASE)
        db.row_factory = make_dicts
    return db


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


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
    db = getattr(g, "database", None)
    if db is not None:
        db.close()


parser = reqparse.RequestParser()
parser.add_argument("name", type=str, required=True)
parser.add_argument("url", type=str, required=True)


class StationList(Resource):
    method_decorators = [login_required]

    def get(self):
        return query_db("select _rowid_ as _id, name, url from stations")

    def post(self):
        station = parser.parse_args()
        query_db("insert into stations values (?, ?)", [station["name"], station["url"]])
        get_db().commit()
        station["_id"] = query_db("select last_insert_rowid() as _id", one=True)["_id"]
        publisher.publishStations(StationList().get())
        return station


class Station(Resource):
    method_decorators = [login_required]

    def get(self, id):
        station = query_db("select _rowid_ as _id, name, url from stations where _id = ?", [id], one=True)
        if not station:
            abort(404, message="station {} not found".format(id))
        return station

    def delete(self, id):
        query_db("delete from stations where _rowid_ = ?", [id])
        get_db().commit()
        publisher.publishStations(StationList().get())
        return query_db("select changes() as n", one=True)

    def put(self, id):
        args = parser.parse_args()
        query_db("update stations set name = ?, url = ? where _rowid_ = ?", [args["name"], args["url"], id])
        get_db().commit()
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

if __name__ == "__main__":
    init_db()
    login_manager.init_app(app)
    socketio.run(app, host="0.0.0.0", port=3000)
