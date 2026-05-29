package main

import (
	"log"
	"net/http"

	"ai-education/server-go/internal/config"
	"ai-education/server-go/internal/router"
)

func main() {
	cfg := config.Load()
	handler := router.New()

	log.Printf("server-go listening on %s", cfg.ServerAddr)
	if err := http.ListenAndServe(cfg.ServerAddr, handler); err != nil {
		log.Fatalf("server-go stopped: %v", err)
	}
}
