from button_reader import ButtonReader, PRESSED
from lcd_menu import MenuController, MenuContent
import Adafruit_CharLCD as LCD
import paho.mqtt.client as mqtt
import json
import requests
import socket
from functools import partial
from os import system


stations = []
status = None


def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


def play(id):
    try:
        requests.get("http://127.0.0.1:3000/play/{}".format(id))
    except BaseException as e:
        print(e)
        pass


def stop():
    try:
        requests.get("http://127.0.0.1:3000/stop")
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
    {"name": get_ip(), "action": None},
    {"name": "Power off", "action": partial(system, "sudo poweroff")}
])

rootContent = MenuContent([
    {"name": "Stations", "action": lambda: menuController.push_content(stationsContent)},
    {"name": "System", "action": lambda: menuController.push_content(systemContent)}
])
menuController = MenuController(reader, lcd, rootContent)

client.loop_forever()
