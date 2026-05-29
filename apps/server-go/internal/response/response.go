package response

import (
	"encoding/json"
	"net/http"
)

type Envelope struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

func OK(w http.ResponseWriter, data any) {
	Write(w, Envelope{
		Status:  0,
		Message: "success",
		Data:    data,
	})
}

func Error(w http.ResponseWriter, status int, message string) {
	Write(w, Envelope{
		Status:  status,
		Message: message,
	})
}

func Write(w http.ResponseWriter, envelope Envelope) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(envelope); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
