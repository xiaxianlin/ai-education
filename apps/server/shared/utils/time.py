import pendulum

# 设置默认时区为 Asia/Shanghai


def now():
    """获取当前时间，格式为 Unix 时间戳"""
    now = pendulum.now()
    return now.int_timestamp


def today():
    """获取今天的日期，格式为 YYYYMMDD"""
    now = pendulum.now()
    return now.format("YYYYMMDD")
