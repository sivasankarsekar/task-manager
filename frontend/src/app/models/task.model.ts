export interface Task {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
}

export interface TaskRequest {
  title: string;
  description?: string;
}
