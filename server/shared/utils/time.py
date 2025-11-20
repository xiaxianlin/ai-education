from datetime import datetime
import time


def now():
    return int(time.time())


def today():
    return int(datetime.now().strftime("%Y%m%d"))
