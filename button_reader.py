import threading
import time
import Adafruit_CharLCD as LCD

DOWN = 0
PRESSED = 1
RELASED = 2


class ButtonReader(threading.Thread):
    def __init__(self, lcd, sleep_time=0.2):
        threading.Thread.__init__(self)
        self.lcd = lcd
        self.sleep_time = sleep_time
        self.states = {
            LCD.SELECT: False,
            LCD.UP: False,
            LCD.DOWN: False,
            LCD.LEFT: False,
            LCD.RIGHT: False
        }
        self.actions = {
            LCD.SELECT: {DOWN: [], PRESSED: [], RELASED: []},
            LCD.UP: {DOWN: [], PRESSED: [], RELASED: []},
            LCD.DOWN: {DOWN: [], PRESSED: [], RELASED: []},
            LCD.LEFT: {DOWN: [], PRESSED: [], RELASED: []},
            LCD.RIGHT: {DOWN: [], PRESSED: [], RELASED: []}
        }

    def add_action(self, button, action, fun):
        self.actions[button][action].append(fun)

    def run(self):
        while True:
            time.sleep(self.sleep_time)
            for button in self.states:
                pressed = self.lcd.is_pressed(button)
                if pressed:
                    if not self.states[button]:
                        for fun in self.actions[button][DOWN]:
                            fun(button, DOWN)
                    for fun in self.actions[button][PRESSED]:
                        fun(button, PRESSED)
                elif self.states[button]:
                    for fun in self.actions[button][RELASED]:
                        fun(button, RELASED)
                self.states[button] = pressed
