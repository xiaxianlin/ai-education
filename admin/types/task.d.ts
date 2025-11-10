declare global {
  interface Task {
    id: number;
    task_type: string;
    task_name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    handler_module: string;
    handler_function: string;
    params: string;
    result: string;
    error_message?: string;
    start_time?: number;
    end_time?: number;
    create_time: number;
    update_time: number;
  }

  interface TaskSearchParams extends SearchParams {
    task_type?: string;
    status?: string;
  }
}

export {};

