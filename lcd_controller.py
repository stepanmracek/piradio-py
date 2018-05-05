from button_reader import ButtonReader, PRESSED
import Adafruit_CharLCD as LCD
import paho.mqtt.client as mqtt
import json
import requests
from functools import partial
import socket

stations = []
status = None


def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip


ip = get_ip()


def play(id):
    try:
        requests.get('http://127.0.0.1:3000/play/{}'.format(id))
    except BaseException:
        pass


def get_menu_items():
    selected_id = None
    if status and "_id" in status:
        selected_id = status["_id"]
    items = [{
        "name": "> " + station["name"] if selected_id == station["_id"] else station["name"],
        "action": partial(play, station["_id"])
    } for station in stations]
    items.insert(0, {
        "name": ip,
        "action": None
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

    print(msg.topic, payload)
    if payload is None:
        return

    if msg.topic == "radio/stations":
        global stations
        stations = payload
    elif msg.topic == "radio/status":
        global status
        status = payload
    menu.update_items(get_menu_items())


class Menu(object):
    def __init__(self, button_reader, lcd, items):
        super(Menu, self).__init__()
        self.button_reader = button_reader
        self.lcd = lcd
        self.button_reader.clear_all_actions()
        self.selected_index = 0
        self.items = items
        self._display()
        self.button_reader.add_action(LCD.DOWN, PRESSED, lambda b, a: self._on_select(+1))
        self.button_reader.add_action(LCD.UP, PRESSED, lambda b, a: self._on_select(-1))
        self.button_reader.add_action(LCD.SELECT, PRESSED, lambda b, a: self._on_confirm())
        self.button_reader.add_action(LCD.RIGHT, PRESSED, lambda b, a: self._on_confirm())

    def update_items(self, items):
        self.items = items
        if self.selected_index > len(self.items) - 1:
            self.selected_index = 0
        self._display()

    def _display(self):
        lcd.clear()
        if self.selected_index > len(self.items) - 1:
            lcd.message("<no item>")
        else:
            lcd.message(self.items[self.selected_index]["name"])

    def _on_select(self, shift):
        count = len(self.items)
        if count > 0:
            self.selected_index = (self.selected_index + shift) % count
            self._display()

    def _on_confirm(self):
        if self.selected_index > len(self.items) - 1:
            return
        fun = self.items[self.selected_index]["action"]
        if fun:
            fun()


lcd = LCD.Adafruit_CharLCDPlate()
lcd.set_backlight(False)
lcd.clear()

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect("127.0.0.1")

reader = ButtonReader(lcd)
reader.start()

menu = Menu(reader, lcd, get_menu_items())
# reader.join()

client.loop_forever()
