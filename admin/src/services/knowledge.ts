import { request } from '@umijs/max';

export const KnowledgeApi = {
  list: async () => {
    const res = await request<ApiData<Knowledge[]>>('/knowledge/all');
    return res.data;
  },

  create: async (data: CreateKnowledge) => {
    const res = await request<ApiData<Knowledge>>('/knowledge', {
      method: 'POST',
      data,
    });
    return res.data;
  },

  update: async (id: string, data: UpdateKnowledge) => {
    const res = await request<ApiData<Knowledge>>(`/knowledge/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.data;
  },

  delete: async (id: string) => {
    await request<ApiData<void>>(`/knowledge/${id}`, {
      method: 'DELETE',
    });
  },

  toggleStatus: async (id: string, status: number) => {
    const res = await request<ApiData<Knowledge>>(`/knowledge/${id}/status`, {
      method: 'PUT',
      data: { status },
    });
    return res.data;
  },

  getCourseUnits: async () => {
    const res = await request<ApiData<CourseUnit[]>>('/course_unit/all');
    return res.data;
  },

  uploadAudio: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await request<ApiData<{ analysis_audio: string }>>(`/knowledge/${id}/audio`, {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  uploadVideo: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await request<ApiData<{ analysis_video: string }>>(`/knowledge/${id}/video`, {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
