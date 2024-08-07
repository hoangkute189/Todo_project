export interface Todo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  data: DataType[];
}

export interface TodoItem {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  data: DataType;
}

export interface GetItem {
  msg: string;
  data: DataType;
}

export interface DataType {
  _id: string;
  todo: string;
  completed: boolean;
  userId?: string;
}
