from button_reader import ButtonReader, PRESSED
import Adafruit_CharLCD as LCD
from threading import Lock


class MenuController(object):
    def __init__(self, button_reader: ButtonReader, lcd, initial_content):
        super(MenuController, self).__init__()
        self.button_reader = button_reader
        self.lcd = lcd
        self.contents = [initial_content]
        self.lock = Lock()
        self.display()
        self.button_reader.clear_all_actions()
        self.button_reader.add_action(LCD.DOWN, PRESSED, lambda b, a: self._on_select(+1))
        self.button_reader.add_action(LCD.UP, PRESSED, lambda b, a: self._on_select(-1))
        self.button_reader.add_action(LCD.SELECT, PRESSED, lambda b, a: self._on_confirm())
        self.button_reader.add_action(LCD.RIGHT, PRESSED, lambda b, a: self._on_confirm())
        self.button_reader.add_action(LCD.LEFT, PRESSED, lambda b, a: self._on_back())

    def push_content(self, content):
        self.contents.append(content)
        self.display()

    def display(self):
        with self.lock:
            self.lcd.clear()
            if len(self.contents) == 0:
                self.lcd.message("<no content>")
            elif self.contents[-1].selected_index > len(self.contents[-1].items) - 1:
                self.lcd.message(self.contents[-1].title + "\n<no item>")
            else:
                c = self.contents[-1]
                self.lcd.message(c.title + "\n" + c.items[c.selected_index]["name"])

    def _on_select(self, shift):
        if len(self.contents) == 0:
            return
        content = self.contents[-1]
        count = len(content.items)
        if count > 0:
            new_index = content.selected_index + shift
            if new_index < 0 and content.begin_reached_action is not None:
                content.begin_reached_action()
                return
            elif new_index >= count and content.end_reached_action is not None:
                content.end_reached_action()
                return
            content.selected_index = (new_index) % count
            self.display()

    def _on_back(self):
        if len(self.contents) <= 1:
            return
        self.contents = self.contents[:-1]
        self.display()

    def _on_confirm(self):
        if len(self.contents) == 0:
            return
        content = self.contents[-1]
        if content.selected_index > len(content.items) - 1:
            return
        fun = content.items[content.selected_index]["action"]
        if fun:
            fun()


class MenuContent(object):
    def __init__(self, title: str, items: list):
        super(MenuContent, self).__init__()
        self.title = title
        self.selected_index = 0
        self.items = items
        self.begin_reached_action = None
        self.end_reached_action = None
        self.lock = Lock()

    def update_items(self, items):
        with self.lock:
            self.items = items
            if self.selected_index > len(self.items) - 1:
                self.selected_index = 0
