package question

import "net/http"

type Middleware func(http.Handler) http.Handler

func RegisterRoutes(mux *http.ServeMux, service *Service, middlewares ...Middleware) {
	handler := NewHandler(service)

	handle(mux, "POST /api/admin/question/type", http.HandlerFunc(handler.SaveQuestionType), middlewares...)
	handle(mux, "DELETE /api/admin/question/type/{id}", http.HandlerFunc(handler.DeleteQuestionType), middlewares...)
	handle(mux, "GET /api/admin/question/type/units", http.HandlerFunc(handler.SearchUnitPracticeTypes), middlewares...)
	handle(mux, "GET /api/admin/question/type/abilities", http.HandlerFunc(handler.SearchAbilityPracticeTypes), middlewares...)
	handle(mux, "GET /api/admin/question/type/{code}", http.HandlerFunc(handler.GetQuestionTypeByCode), middlewares...)
	handle(mux, "GET /api/admin/question/type/{code}/prompt", http.HandlerFunc(handler.GetQuestionTypePrompt), middlewares...)
	handle(mux, "PATCH /api/admin/question/type/{code}/prompt", http.HandlerFunc(handler.UpdateQuestionTypePrompt), middlewares...)
	handle(mux, "PATCH /api/admin/question/type/{code}/configs", http.HandlerFunc(handler.UpdateQuestionTypeConfigs), middlewares...)

	handle(mux, "GET /api/admin/question/search", http.HandlerFunc(handler.SearchQuestions), middlewares...)
	handle(mux, "GET /api/admin/question/{id}", http.HandlerFunc(handler.GetQuestion), middlewares...)
	handle(mux, "PATCH /api/admin/question/{id}", http.HandlerFunc(handler.UpdateQuestion), middlewares...)
	handle(mux, "DELETE /api/admin/question/{id}", http.HandlerFunc(handler.DeleteQuestion), middlewares...)
}

func handle(mux *http.ServeMux, pattern string, handler http.Handler, middlewares ...Middleware) {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}
	mux.Handle(pattern, handler)
}
