import threading
import time
import Adafruit_CharLCD as LCD

HOLD = 0
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
        self.clear_all_actions()

    def add_action(self, button, action, fun):
        self.actions[button][action] = (fun)

    def clear_all_actions(self):
        self.actions = {
            LCD.SELECT: {HOLD: None, PRESSED: None, RELASED: None},
            LCD.UP: {HOLD: None, PRESSED: None, RELASED: None},
            LCD.DOWN: {HOLD: None, PRESSED: None, RELASED: None},
            LCD.LEFT: {HOLD: None, PRESSED: None, RELASED: None},
            LCD.RIGHT: {HOLD: None, PRESSED: None, RELASED: None}
        }

    def run(self):
        while True:
            time.sleep(self.sleep_time)
            for button in self.states:
                pressed = self.lcd.is_pressed(button)
                if pressed:
                    if not self.states[button]:
                        fun = self.actions[button][PRESSED]
                        if fun:
                            fun(button, PRESSED)
                    fun = self.actions[button][HOLD]
                    if fun:
                        fun(button, HOLD)
                elif self.states[button]:
                    fun = self.actions[button][RELASED]
                    if fun:
                        fun(button, RELASED)
                self.states[button] = pressed
