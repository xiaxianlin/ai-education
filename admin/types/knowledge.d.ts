declare global {
  interface Knowledge {
    id: string;
    course_unit: CourseUnit;
    name: string;
    content: string;
    analysis_text?: string;
    analysis_audio?: string;
    analysis_video?: string;
    status: number;
    create_time: number;
    update_time?: number;
  }

  interface CreateKnowledge {
    course_unit_id: number;
    content: string;
  }

  interface UpdateKnowledge {
    content: string;
  }
}

export {};
