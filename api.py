# -*- coding: utf-8 -*-

import subprocess
import sqlite3
from flask import Flask, g, jsonify
from flask_restful import Api, Resource, abort, reqparse
from flask_cors import CORS

DATABASE = "database.sqlite"
app = Flask(__name__)
app.config["ERROR_404_HELP"] = False
api = Api(app)
CORS(app)


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
        # init_db()
    return db


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "database", None)
    if db is not None:
        db.close()


parser = reqparse.RequestParser()
parser.add_argument("name", type=str, required=True)
parser.add_argument("url", type=str, required=True)


class StationList(Resource):
    def get(self):
        return query_db("select _rowid_ as _id, name, url from stations")

    def post(self):
        station = parser.parse_args(strict=True)
        query_db("insert into stations values (?, ?)", [station["name"], station["url"]])
        get_db().commit()
        station["_id"] = query_db("SELECT last_insert_rowid() as _id", one=True)["_id"]
        return station


class Station(Resource):
    def get(self, id):
        station = query_db("select _rowid_ as _id, name, url from stations where _id = ?", [id], one=True)
        if not station:
            abort(404, message="station {} not found".format(id))
        return station

    def delete(self, id):
        query_db("delete from stations where _rowid_ = ?", [id])
        get_db().commit()
        return query_db("select changes() as n", one=True)

    def put(self, id):
        args = parser.parse_args(strict=True)
        query_db("update stations set name = ?, url = ? where _rowid_ = ?", [args["name"], args["url"], id])
        get_db().commit()
        return self.get(id)


process = None
selectedStation = None


@app.route('/status')
def status():
    global process
    global selectedStation
    return jsonify({"isPlaying": process is not None, "selectedStation": selectedStation})


@app.route('/stop')
def stop():
    global process
    global selectedStation
    if process:
        process.terminate()
        process.wait()
        process = None
        selectedStation = None
    return jsonify({})


@app.route('/play/<int:id>')
def play(id):
    global process
    global selectedStation
    resource = Station()
    station = resource.get(id)
    stop()
    process = subprocess.Popen(
        ["mplayer", station["url"]], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    selectedStation = station
    return jsonify(station)


api.add_resource(StationList, "/stations")
api.add_resource(Station, "/stations/<int:id>")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=3000)
