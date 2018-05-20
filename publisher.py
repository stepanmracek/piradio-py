from json import dumps


class Publisher(object):
    def __init__(self, mqtt, socketio):
        self.mqtt = mqtt
        self.socketio = socketio

    def publishStations(self, stations):
        self.mqtt.publish("radio/stations", dumps(stations), retain=True)
        self.socketio.emit("stations", data=stations,)

    def publishStatus(self, status):
        self.mqtt.publish("radio/status", dumps(status), retain=True)
        self.socketio.emit("status", data=status)

    def publishVolume(self, volume):
        self.mqtt.publish("radio/volume", volume, retain=True)
        self.socketio.emit("volume", data=volume)
