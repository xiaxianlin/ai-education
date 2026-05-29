package textbook

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"ai-education/server-go/internal/response"
)

type Handler struct {
	repo Repository
}

func NewHandler(repo Repository) *Handler {
	if repo == nil {
		repo = NotImplementedRepository{}
	}
	return &Handler{repo: repo}
}

func (h *Handler) GetStudentUnits(w http.ResponseWriter, r *http.Request) {
	textbookID, err := pathInt64(r, "textbook_id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	units, err := h.repo.ListUnitsByTextbook(r.Context(), textbookID)
	if err != nil {
		h.handleRepoError(w, err, "获取教材单元列表失败")
		return
	}

	response.OK(w, units)
}

func (h *Handler) CreateTextbook(w http.ResponseWriter, r *http.Request) {
	var req SaveTextbookRequest
	if err := decodeJSON(r, &req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	id, err := h.repo.CreateTextbook(r.Context(), req)
	if err != nil {
		h.handleRepoError(w, err, "创建教材失败")
		return
	}

	response.OK(w, id)
}

func (h *Handler) UpdateTextbook(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	var req SaveTextbookRequest
	if err := decodeJSON(r, &req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.repo.UpdateTextbook(r.Context(), id, req); err != nil {
		h.handleRepoError(w, err, "更新教材失败")
		return
	}

	response.OK(w, nil)
}

func (h *Handler) DeleteTextbook(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.repo.DeleteTextbook(r.Context(), id); err != nil {
		h.handleRepoError(w, err, "删除教材失败")
		return
	}

	response.OK(w, nil)
}

func (h *Handler) GetTextbook(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	textbook, err := h.repo.GetTextbook(r.Context(), id)
	if err != nil {
		h.handleRepoError(w, err, "获取教材详情失败")
		return
	}

	response.OK(w, textbook)
}

func (h *Handler) SearchTextbooks(w http.ResponseWriter, r *http.Request) {
	filter := SearchTextbookRequest{
		Subject:  r.URL.Query().Get("subject"),
		Version:  r.URL.Query().Get("version"),
		Semester: r.URL.Query().Get("semester"),
	}

	if gradeValue := r.URL.Query().Get("grade"); gradeValue != "" {
		grade, err := strconv.Atoi(gradeValue)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "grade 参数格式错误")
			return
		}
		filter.Grade = &grade
	}

	textbooks, err := h.repo.SearchTextbooks(r.Context(), filter)
	if err != nil {
		h.handleRepoError(w, err, "搜索教材失败")
		return
	}

	response.OK(w, textbooks)
}

func (h *Handler) ListTextbookUnits(w http.ResponseWriter, r *http.Request) {
	textbookID, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	units, err := h.repo.ListTextbookUnits(r.Context(), textbookID)
	if err != nil {
		h.handleRepoError(w, err, "获取教材单元列表失败")
		return
	}

	response.OK(w, units)
}

func (h *Handler) CreateUnit(w http.ResponseWriter, r *http.Request) {
	var req SaveUnitRequest
	if err := decodeJSON(r, &req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	id, err := h.repo.CreateUnit(r.Context(), req)
	if err != nil {
		h.handleRepoError(w, err, "创建单元失败")
		return
	}

	response.OK(w, id)
}

func (h *Handler) UpdateUnit(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	var req UpdateUnitRequest
	if err := decodeJSON(r, &req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.repo.UpdateUnit(r.Context(), id, req); err != nil {
		h.handleRepoError(w, err, "更新单元失败")
		return
	}

	response.OK(w, nil)
}

func (h *Handler) DeleteUnit(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.repo.DeleteUnit(r.Context(), id); err != nil {
		h.handleRepoError(w, err, "删除单元失败")
		return
	}

	response.OK(w, nil)
}

func (h *Handler) CreateTextbookVersion(w http.ResponseWriter, r *http.Request) {
	var req SaveTextbookVersionRequest
	if err := decodeJSON(r, &req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	id, err := h.repo.CreateTextbookVersion(r.Context(), req)
	if err != nil {
		h.handleRepoError(w, err, "创建教材版本失败")
		return
	}

	response.OK(w, id)
}

func (h *Handler) UpdateTextbookVersion(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	var req SaveTextbookVersionRequest
	if err := decodeJSON(r, &req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.repo.UpdateTextbookVersion(r.Context(), id, req); err != nil {
		h.handleRepoError(w, err, "更新教材版本失败")
		return
	}

	response.OK(w, nil)
}

func (h *Handler) DeleteTextbookVersion(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.repo.DeleteTextbookVersion(r.Context(), id); err != nil {
		h.handleRepoError(w, err, "删除教材版本失败")
		return
	}

	response.OK(w, nil)
}

func (h *Handler) EnableTextbookVersion(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.repo.SetTextbookVersionEnabled(r.Context(), id, true); err != nil {
		h.handleRepoError(w, err, "启用教材版本失败")
		return
	}

	response.OK(w, nil)
}

func (h *Handler) DisableTextbookVersion(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.repo.SetTextbookVersionEnabled(r.Context(), id, false); err != nil {
		h.handleRepoError(w, err, "停用教材版本失败")
		return
	}

	response.OK(w, nil)
}

func (h *Handler) SearchTextbookVersions(w http.ResponseWriter, r *http.Request) {
	filter := SearchTextbookVersionRequest{
		Subject: r.URL.Query().Get("subject"),
	}

	versions, err := h.repo.SearchTextbookVersions(r.Context(), filter)
	if err != nil {
		h.handleRepoError(w, err, "搜索教材版本失败")
		return
	}

	response.OK(w, versions)
}

func (h *Handler) GetTextbookVersion(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	version, err := h.repo.GetTextbookVersion(r.Context(), id)
	if err != nil {
		h.handleRepoError(w, err, "获取教材版本详情失败")
		return
	}

	response.OK(w, version)
}

func (h *Handler) CreateTeacherBook(w http.ResponseWriter, r *http.Request) {
	var req SaveTeacherBookRequest
	if err := decodeJSON(r, &req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	id, err := h.repo.CreateTeacherBook(r.Context(), req)
	if err != nil {
		h.handleRepoError(w, err, "创建教师用书失败")
		return
	}

	response.OK(w, id)
}

func (h *Handler) UpdateTeacherBook(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	var req SaveTeacherBookRequest
	if err := decodeJSON(r, &req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.repo.UpdateTeacherBook(r.Context(), id, req); err != nil {
		h.handleRepoError(w, err, "更新教师用书失败")
		return
	}

	response.OK(w, nil)
}

func (h *Handler) DeleteTeacherBook(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.repo.DeleteTeacherBook(r.Context(), id); err != nil {
		h.handleRepoError(w, err, "删除教师用书失败")
		return
	}

	response.OK(w, nil)
}

func (h *Handler) SearchTeacherBooks(w http.ResponseWriter, r *http.Request) {
	subject := r.URL.Query().Get("subject")
	gradeValue := r.URL.Query().Get("grade")
	if subject == "" || gradeValue == "" {
		response.Error(w, http.StatusBadRequest, "subject 和 grade 为必填参数")
		return
	}

	grade, err := strconv.Atoi(gradeValue)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "grade 参数格式错误")
		return
	}

	books, err := h.repo.SearchTeacherBooks(r.Context(), SearchTeacherBookRequest{
		Subject: subject,
		Grade:   grade,
	})
	if err != nil {
		h.handleRepoError(w, err, "搜索教师用书失败")
		return
	}

	response.OK(w, books)
}

func (h *Handler) GetTeacherBook(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	book, err := h.repo.GetTeacherBook(r.Context(), id)
	if err != nil {
		h.handleRepoError(w, err, "获取教师用书详情失败")
		return
	}

	response.OK(w, book)
}

func (h *Handler) UploadTextbook(w http.ResponseWriter, r *http.Request) {
	response.Error(w, http.StatusNotImplemented, "教材文件上传暂由 Python 服务处理")
}

func (h *Handler) ParseTextbook(w http.ResponseWriter, r *http.Request) {
	response.Error(w, http.StatusNotImplemented, "教材解析暂由 Python 服务处理")
}

func (h *Handler) UploadTeacherBook(w http.ResponseWriter, r *http.Request) {
	response.Error(w, http.StatusNotImplemented, "教师用书上传暂由 Python 服务处理")
}

func (h *Handler) handleRepoError(w http.ResponseWriter, err error, message string) {
	if errors.Is(err, ErrNotImplemented) {
		response.Error(w, http.StatusNotImplemented, message)
		return
	}

	response.Error(w, http.StatusInternalServerError, message)
}

func decodeJSON(r *http.Request, dst any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(dst); err != nil {
		return err
	}
	return nil
}

func pathInt64(r *http.Request, key string) (int64, error) {
	raw := r.PathValue(key)
	if raw == "" {
		return 0, errors.New("缺少路径参数 " + key)
	}

	value, err := strconv.ParseInt(raw, 10, 64)
	if err != nil {
		return 0, errors.New("路径参数 " + key + " 格式错误")
	}

	return value, nil
}
