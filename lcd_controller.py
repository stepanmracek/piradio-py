from button_reader import ButtonReader, DOWN
import Adafruit_CharLCD as LCD


lcd = LCD.Adafruit_CharLCDPlate()
lcd.set_backlight(False)


def on_button(button, action):
    print("Select down")


reader = ButtonReader(lcd)
reader.add_action(LCD.SELECT, DOWN, on_button)
reader.start()
# reader.join()
