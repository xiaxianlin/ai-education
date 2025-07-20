import { request } from '@umijs/max';
import type { User, UserCreateSchema, UserUpdateSchema, UserSearchSchema } from '../types/user';

const API_PREFIX = '/api/admin/user';

export async function searchUsers(params: UserSearchSchema): Promise<ApiData<{
  list: User[];
  total: number;
  current_page: number;
  page_size: number;
}>> {
  return request(`${API_PREFIX}/search`, {
    method: 'GET',
    params,
  });
}

export async function createUser(data: UserCreateSchema): Promise<ApiData<string>> {
  return request(API_PREFIX, {
    method: 'POST',
    data,
  });
}

export async function updateUser(id: string, data: UserUpdateSchema): Promise<ApiData<null>> {
  return request(`${API_PREFIX}/${id}`, {
    method: 'PATCH',
    data,
  });
}

export async function updateUserStatus(id: string, status: number): Promise<ApiData<null>> {
  return request(`${API_PREFIX}/${id}/status`, {
    method: 'PUT',
    data: { status },
  });
}

export async function deleteUser(id: string): Promise<ApiData<null>> {
  return request(`${API_PREFIX}/${id}`, {
    method: 'DELETE',
  });
}