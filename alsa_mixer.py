import re
import os


simple_controls_match = re.search(".*'(.*)',.*", os.popen("amixer scontrols").read()).groups()
if len(simple_controls_match) > 0:
    control = simple_controls_match[0]
else:
    control = None

get_volume_re = re.compile(r".*: Playback \d+ \[(\d+)%\]")


def set_volume(new_value: int):
    if new_value >= 0 and new_value <= 100:
        if control is not None:
            os.system("amixer sset '{}' {}%".format(control, new_value))
        else:
            raise Exception("Control is not set")
    else:
        raise ValueError("invalid value")


def get_volume():
    if control is None:
        raise Exception("Control is not set")

    amixer_output = os.popen("amixer sget {}".format(control)).read().splitlines()
    for line in amixer_output:
        match = get_volume_re.search(line)
        if match:
            return int(match.groups()[0])

    return 0


if __name__ == "__main__":
    set_volume(33)
    print(get_volume())
