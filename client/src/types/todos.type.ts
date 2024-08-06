export interface Todo {
  total: number;
  skip: number;
  limit: number;
  todos: DataType[];
}

export interface DataType {
  id: string;
  todo: string;
  completed: boolean;
  userId?: string;
}
