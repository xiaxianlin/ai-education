package ability

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"ai-education/server-go/internal/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateAbilityRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		response.Error(w, 400, err.Error())
		return
	}

	id, err := h.service.Create(r.Context(), req)
	if err != nil {
		writeAbilityError(w, err)
		return
	}

	response.OK(w, id)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id, ok := parsePathID(w, r)
	if !ok {
		return
	}

	var req UpdateAbilityRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		response.Error(w, 400, err.Error())
		return
	}

	if err := h.service.Update(r.Context(), id, req); err != nil {
		writeAbilityError(w, err)
		return
	}

	response.OK(w, nil)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id, ok := parsePathID(w, r)
	if !ok {
		return
	}

	if err := h.service.Delete(r.Context(), id); err != nil {
		writeAbilityError(w, err)
		return
	}

	response.OK(w, nil)
}

func (h *Handler) BatchDelete(w http.ResponseWriter, r *http.Request) {
	var req BatchDeleteAbilityRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		response.Error(w, 400, err.Error())
		return
	}

	deletedCount, err := h.service.BatchDelete(r.Context(), req.IDs)
	if err != nil {
		writeAbilityError(w, err)
		return
	}

	response.OK(w, map[string]any{
		"message":       "批量删除成功",
		"deleted_count": deletedCount,
	})
}

func (h *Handler) Search(w http.ResponseWriter, r *http.Request) {
	params, err := parseSearchParams(r)
	if err != nil {
		response.Error(w, 400, err.Error())
		return
	}

	result, err := h.service.Search(r.Context(), params)
	if err != nil {
		writeAbilityError(w, err)
		return
	}

	response.OK(w, result)
}

func (h *Handler) BySubject(w http.ResponseWriter, r *http.Request) {
	subject := strings.TrimSpace(r.PathValue("subject"))
	if subject == "" {
		response.Error(w, 400, "subject 不能为空")
		return
	}

	result, err := h.service.Search(r.Context(), SearchAbilityParams{Subject: &subject, Unpaged: true})
	if err != nil {
		writeAbilityError(w, err)
		return
	}

	grouped := make(map[string][]Ability)
	for _, item := range result.Data {
		key := fmt.Sprintf("grade_%d", item.Grade)
		grouped[key] = append(grouped[key], item)
	}
	response.OK(w, grouped)
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, ok := parsePathID(w, r)
	if !ok {
		return
	}

	item, err := h.service.Get(r.Context(), id)
	if err != nil {
		writeAbilityError(w, err)
		return
	}

	response.OK(w, item)
}

func (h *Handler) StudentAtomics(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	subject := query.Get("subject")
	grade, err := parseRequiredIntQuery(query.Get("grade"), "grade")
	if err != nil {
		response.Error(w, 400, err.Error())
		return
	}

	abilities, err := h.service.StudentAtomics(r.Context(), subject, grade)
	if err != nil {
		writeAbilityError(w, err)
		return
	}

	response.OK(w, abilities)
}

func (h *Handler) Export(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	subject := query.Get("subject")
	grade, err := parseRequiredIntQuery(query.Get("grade"), "grade")
	if err != nil {
		response.Error(w, 400, err.Error())
		return
	}

	items, err := h.service.ExportBySubjectGrade(r.Context(), subject, grade)
	if err != nil {
		writeAbilityError(w, err)
		return
	}

	content, err := json.MarshalIndent(items, "", "  ")
	if err != nil {
		writeAbilityError(w, err)
		return
	}

	filename := fmt.Sprintf("ability-%s-grade%d-%s.json", subject, grade, time.Now().Format("20060102_150405"))
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(content)
}

func (h *Handler) Import(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	subject := query.Get("subject")
	grade, err := parseRequiredIntQuery(query.Get("grade"), "grade")
	if err != nil {
		response.Error(w, 400, err.Error())
		return
	}

	file, header, err := openMultipartFile(r, "file")
	if err != nil {
		response.Error(w, 400, err.Error())
		return
	}
	defer file.Close()

	if !strings.EqualFold(filepath.Ext(header.Filename), ".json") {
		response.Error(w, 400, "只支持 JSON 格式文件")
		return
	}

	var reqs []CreateAbilityRequest
	if err := json.NewDecoder(file).Decode(&reqs); err != nil {
		response.Error(w, 400, fmt.Sprintf("JSON 解析失败：%s", err.Error()))
		return
	}

	result, err := h.service.ImportBySubjectGrade(r.Context(), subject, grade, reqs)
	if err != nil {
		writeAbilityError(w, err)
		return
	}

	response.OK(w, map[string]any{
		"message":       "导入成功",
		"deleted_count": result.DeletedCount,
		"created_count": result.CreatedCount,
	})
}

func decodeJSON(body io.Reader, dst any) error {
	decoder := json.NewDecoder(body)
	if err := decoder.Decode(dst); err != nil {
		return fmt.Errorf("请求 JSON 解析失败：%w", err)
	}
	return nil
}

func parsePathID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	rawID := r.PathValue("id")
	id, err := strconv.ParseInt(rawID, 10, 64)
	if err != nil || id <= 0 {
		response.Error(w, 400, "能力 ID 不合法")
		return 0, false
	}
	return id, true
}

func parseSearchParams(r *http.Request) (SearchAbilityParams, error) {
	query := r.URL.Query()
	params := SearchAbilityParams{
		Page: queryInt(query.Get("page"), 1),
		Size: queryInt(firstNonEmpty(query.Get("size"), query.Get("page_size")), 20),
	}

	if rawSubject := query.Get("subject"); rawSubject != "" {
		subject := rawSubject
		params.Subject = &subject
	}

	if rawGrade := query.Get("grade"); rawGrade != "" {
		grade, err := strconv.Atoi(rawGrade)
		if err != nil {
			return SearchAbilityParams{}, newValidationError("grade 必须是数字")
		}
		params.Grade = &grade
	}

	return params, nil
}

func queryInt(raw string, fallback int) int {
	if raw == "" {
		return fallback
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return value
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}

func parseRequiredIntQuery(rawValue string, name string) (int, error) {
	if rawValue == "" {
		return 0, newValidationError(name + " 不能为空")
	}

	value, err := strconv.Atoi(rawValue)
	if err != nil {
		return 0, newValidationError(name + " 必须是数字")
	}
	return value, nil
}

func openMultipartFile(r *http.Request, name string) (multipart.File, *multipart.FileHeader, error) {
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		return nil, nil, fmt.Errorf("上传文件解析失败：%w", err)
	}

	file, header, err := r.FormFile(name)
	if err != nil {
		return nil, nil, errors.New("缺少上传文件")
	}
	return file, header, nil
}

func writeAbilityError(w http.ResponseWriter, err error) {
	switch {
	case IsValidationError(err):
		response.Error(w, 400, err.Error())
	case IsDuplicateError(err):
		response.Error(w, 400, err.Error())
	case IsNotFoundError(err):
		response.Error(w, 404, err.Error())
	default:
		response.Error(w, 500, err.Error())
	}
}
