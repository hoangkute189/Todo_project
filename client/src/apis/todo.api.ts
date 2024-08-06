import { DataType, Todo } from "../types/todos.type"
import http from "../utils/http"

export const getAllTodos = async (page: number, limit: number) => {
   return await http.get<Todo>('/', {
      params: {
         limit: limit,
         skip: page > 0 ? (page-1)*limit - 1 : 0,
      }
   })
}

export const getTodoById = async (id: string) => {
   return await http.get<DataType>(`/${id}`)
}

export const addNewTodo = async (todo: Omit<DataType, "id">) => {
   return await http.post<DataType>('/add', todo)
}

export const updateTodo = async (id: string, todo: Omit<DataType, "id">) => {
   return await http.put<DataType>(`/${id}`, todo)
}

export const deleteTodo = async (id: string) => {
   return await http.delete<DataType>(`/${id}`)
}