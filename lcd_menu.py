from button_reader import ButtonReader, PRESSED
import Adafruit_CharLCD as LCD


class MenuController(object):
    def __init__(self, button_reader, lcd, initial_content):
        super(MenuController, self).__init__()
        self.button_reader = button_reader
        self.lcd = lcd
        self.contents = [initial_content]
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
        self.lcd.clear()
        if len(self.contents) == 0:
            self.lcd.message("<no content>")
        elif self.contents[-1].selected_index > len(self.contents[-1].items) - 1:
            self.lcd.message("<no item>")
        else:
            self.lcd.message(self.contents[-1].items[self.contents[-1].selected_index]["name"])

    def _on_select(self, shift):
        if len(self.contents) == 0:
            return
        content = self.contents[-1]
        count = len(content.items)
        if count > 0:
            content.selected_index = (content.selected_index + shift) % count
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
    def __init__(self, items):
        super(MenuContent, self).__init__()
        self.selected_index = 0
        self.items = items

    def update_items(self, items):
        self.items = items
        if self.selected_index > len(self.items) - 1:
            self.selected_index = 0
