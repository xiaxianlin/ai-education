declare global {
  interface Subject {
    id: string;
    name: string;
    status: number;
    create_time: number;
  }

  interface CreateSubject {
    name: string;
  }
}

export {};
