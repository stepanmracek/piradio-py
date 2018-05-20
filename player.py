import subprocess


process = None
selected_station = None


def stop():
    global process
    global selected_station
    if process:
        process.terminate()
        process.wait()
    process = None
    selected_station = None


def play(station):
    global process
    global selected_station
    stop()
    process = subprocess.Popen(
        ["mplayer", station["url"]], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    selected_station = station
