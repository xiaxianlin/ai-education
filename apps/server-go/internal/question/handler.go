package question

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"ai-education/server-go/internal/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) SearchQuestions(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.SearchQuestions(r.Context(), parseQuestionSearch(r))
	writeResult(w, result, err)
}

func (h *Handler) GetQuestion(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.GetQuestion(r.Context(), r.PathValue("id"))
	writeResult(w, result, err)
}

func (h *Handler) UpdateQuestion(w http.ResponseWriter, r *http.Request) {
	var params QuestionUpdate
	if !decodeJSON(w, r, &params) {
		return
	}

	result, err := h.service.UpdateQuestion(r.Context(), r.PathValue("id"), params)
	writeResult(w, result, err)
}

func (h *Handler) DeleteQuestion(w http.ResponseWriter, r *http.Request) {
	err := h.service.DeleteQuestion(r.Context(), r.PathValue("id"))
	writeResult(w, map[string]string{"message": "题目删除成功"}, err)
}

func (h *Handler) SaveQuestionType(w http.ResponseWriter, r *http.Request) {
	var params QuestionTypeSave
	if !decodeJSON(w, r, &params) {
		return
	}

	result, err := h.service.SaveQuestionType(r.Context(), params)
	writeResult(w, result, err)
}

func (h *Handler) DeleteQuestionType(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Error(w, 400, "无效的题型 ID")
		return
	}

	err = h.service.DeleteQuestionType(r.Context(), id)
	writeResult(w, map[string]string{"message": "题型删除成功"}, err)
}

func (h *Handler) SearchUnitPracticeTypes(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.SearchUnitPracticeTypes(r.Context())
	writeResult(w, result, err)
}

func (h *Handler) SearchAbilityPracticeTypes(w http.ResponseWriter, r *http.Request) {
	grade, err := strconv.Atoi(r.URL.Query().Get("grade"))
	if err != nil {
		response.Error(w, 400, "无效的年级")
		return
	}

	result, err := h.service.SearchAbilityPracticeTypes(r.Context(), AbilityPracticeSearch{
		Subject: r.URL.Query().Get("subject"),
		Grade:   grade,
	})
	writeResult(w, result, err)
}

func (h *Handler) GetQuestionTypeByCode(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.GetQuestionTypeByCode(r.Context(), r.PathValue("code"))
	writeResult(w, result, err)
}

func (h *Handler) GetQuestionTypePrompt(w http.ResponseWriter, r *http.Request) {
	prompt, err := h.service.ReadPrompt(r.Context(), r.PathValue("code"))
	writeResult(w, map[string]string{"prompt": prompt}, err)
}

func (h *Handler) UpdateQuestionTypePrompt(w http.ResponseWriter, r *http.Request) {
	var params QuestionTypePromptUpdate
	if !decodeJSON(w, r, &params) {
		return
	}

	err := h.service.WritePrompt(r.Context(), r.PathValue("code"), params.Prompt)
	writeResult(w, map[string]string{"message": "prompt 更新成功"}, err)
}

func (h *Handler) UpdateQuestionTypeConfigs(w http.ResponseWriter, r *http.Request) {
	var params QuestionTypeConfigsUpdate
	if !decodeJSON(w, r, &params) {
		return
	}

	result, err := h.service.UpdateQuestionTypeConfigs(r.Context(), r.PathValue("code"), params.Configs)
	writeResult(w, result, err)
}

func parseQuestionSearch(r *http.Request) QuestionSearch {
	query := r.URL.Query()
	grade, _ := strconv.Atoi(query.Get("grade"))
	page, _ := strconv.Atoi(query.Get("page"))
	size, _ := strconv.Atoi(query.Get("size"))

	return QuestionSearch{
		ID:               query.Get("id"),
		QuestionTypeCode: query.Get("question_type_code"),
		Subject:          query.Get("subject"),
		Grade:            grade,
		Page:             page,
		Size:             size,
	}
}

func decodeJSON(w http.ResponseWriter, r *http.Request, target any) bool {
	defer r.Body.Close()
	if err := json.NewDecoder(r.Body).Decode(target); err != nil {
		response.Error(w, 400, "请求参数格式错误")
		return false
	}
	return true
}

func writeResult(w http.ResponseWriter, data any, err error) {
	if err == nil {
		response.OK(w, data)
		return
	}

	switch {
	case errors.Is(err, ErrNotFound):
		response.Error(w, 404, "资源不存在")
	case errors.Is(err, ErrInvalidArgument), errors.Is(err, ErrInvalidPromptCode):
		response.Error(w, 400, "请求参数错误")
	case errors.Is(err, ErrPromptStoreNotConfigured):
		response.Error(w, 501, "prompt 存储尚未配置")
	default:
		response.Error(w, 500, err.Error())
	}
}
