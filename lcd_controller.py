from button_reader import ButtonReader
from lcd_menu import MenuController, MenuContent
import Adafruit_CharLCD as LCD
import paho.mqtt.client as mqtt
import json
import requests
import socket
import base64
from functools import partial
from os import system


stations = []
status = None
with open("api-key.txt", "rb") as api_key_file:
    api_key = api_key_file.read()
headers = {"Api-Key": base64.b64encode(api_key)}


def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        ip = s.getsockname()[0]
    except Exception as e:
        print(e)
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


def play(id):
    try:
        requests.get("http://127.0.0.1:3000/play/{}".format(id), headers=headers)
    except BaseException as e:
        print(e)
        pass


def stop():
    try:
        requests.get("http://127.0.0.1:3000/stop", headers=headers)
    except BaseException as e:
        print(e)


def volume_set(shift):
    try:
        r = requests.get("http://127.0.0.1:3000/volume", headers=headers)
        if r.status_code == 200:
            v = r.json() + shift
            if v < 0:
                v = 0
            if v > 100:
                v = 100
            requests.post("http://127.0.0.1:3000/volume", json={"volume": v}, headers=headers)
    except BaseException as e:
        print(e)


def get_menu_items():
    selected_id = None
    if status and "_id" in status:
        selected_id = status["_id"]
    items = []
    for station in stations:
        if selected_id == station["_id"]:
            items.append({
                "name": "> " + station["name"],
                "action": stop
            })
        else:
            items.append({
                "name": station["name"],
                "action": partial(play, station["_id"])
            })
    return items


def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe("radio/stations")
    client.subscribe("radio/status")


def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
    except Exception:
        return

    if msg.topic == "radio/stations":
        global stations
        stations = payload
    elif msg.topic == "radio/status":
        global status
        status = payload
    stationsContent.update_items(get_menu_items())
    menuController.display()


lcd = LCD.Adafruit_CharLCDPlate()
lcd.set_backlight(False)
lcd.clear()

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect("127.0.0.1")

reader = ButtonReader(lcd)
reader.start()

stationsContent = MenuContent([])

systemContent = MenuContent([
    {"name": "Volume +", "action": partial(volume_set, 10)},
    {"name": "Volume -", "action": partial(volume_set, -10)},
    {"name": get_ip(), "action": None},
    {"name": "Power off", "action": partial(system, "sudo poweroff")},
])

rootContent = MenuContent([
    {"name": "Stations", "action": lambda: menuController.push_content(stationsContent)},
    {"name": "System", "action": lambda: menuController.push_content(systemContent)}
])
menuController = MenuController(reader, lcd, rootContent)

client.loop_forever()
