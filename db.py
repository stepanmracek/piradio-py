import sqlite3
from flask import g


DATABASE = "database.sqlite"


def init(app):
    with app.app_context():
        db = get()
        with app.open_resource("schema.sql", mode="r") as f:
            db.cursor().executescript(f.read())
        db.commit()


def _make_dicts(cursor, row):
    return dict((cursor.description[idx][0], value)
                for idx, value in enumerate(row))


def get():
    db = getattr(g, "database", None)
    if db is None:
        db = g.database = sqlite3.connect(DATABASE)
        db.row_factory = _make_dicts
    return db


def query(query, args=(), one=False):
    cur = get().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


def close():
    db = getattr(g, "database", None)
    if db is not None:
        db.close()
