import { request } from '@umijs/max';
import type { Question, QuestionCreateSchema, QuestionUpdateSchema, QuestionSearchSchema } from '../types/question';

const API_PREFIX = '/api/admin/questions';

export async function searchQuestions(params: QuestionSearchSchema): Promise<ApiData<{
  list: Question[];
  total: number;
  current_page: number;
  page_size: number;
}>> {
  return request(`${API_PREFIX}/search`, {
    method: 'GET',
    params,
  });
}

export async function createQuestion(data: QuestionCreateSchema): Promise<ApiData<string>> {
  return request(API_PREFIX, {
    method: 'POST',
    data,
  });
}

export async function getQuestion(id: string): Promise<ApiData<Question>> {
  return request(`${API_PREFIX}/${id}`, {
    method: 'GET',
  });
}

export async function updateQuestion(id: string, data: QuestionUpdateSchema): Promise<ApiData<null>> {
  return request(`${API_PREFIX}/${id}`, {
    method: 'PATCH',
    data,
  });
}

export async function deleteQuestion(id: string): Promise<ApiData<null>> {
  return request(`${API_PREFIX}/${id}`, {
    method: 'DELETE',
  });
}

export async function getQuestionsByKnowledge(
  knowledgeId: number,
  currentPage: number = 1,
  pageSize: number = 10
): Promise<ApiData<{
  list: Question[];
  total: number;
  current_page: number;
  page_size: number;
}>> {
  return request(`${API_PREFIX}/knowledge/${knowledgeId}`, {
    method: 'GET',
    params: {
      current_page: currentPage,
      page_size: pageSize,
    },
  });
}

export async function getQuestionsByCourseUnit(
  courseUnitId: number,
  currentPage: number = 1,
  pageSize: number = 10
): Promise<ApiData<{
  list: Question[];
  total: number;
  current_page: number;
  page_size: number;
}>> {
  return request(`${API_PREFIX}/course_unit/${courseUnitId}`, {
    method: 'GET',
    params: {
      current_page: currentPage,
      page_size: pageSize,
    },
  });
}

export async function getQuestionsByTextbook(
  textbookId: number,
  currentPage: number = 1,
  pageSize: number = 10
): Promise<ApiData<{
  list: Question[];
  total: number;
  current_page: number;
  page_size: number;
}>> {
  return request(`${API_PREFIX}/textbook/${textbookId}`, {
    method: 'GET',
    params: {
      current_page: currentPage,
      page_size: pageSize,
    },
  });
}