package queue

import "time"

func timeNowUnixNano() int64 {
	return time.Now().UTC().UnixNano()
}
