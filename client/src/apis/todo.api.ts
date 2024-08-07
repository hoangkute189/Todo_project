import { DataType, GetItem, Todo, TodoItem } from "../types/todos.type"
import http from "../utils/http"

type ParamType = {
   currentPage: number, 
   limit?: number, 
   searchTask?: string, 
   progressFilter?: boolean
}

export const getAllTodos = async ({currentPage, limit = 5, searchTask = "", progressFilter} : ParamType) => {
   return await http.get<Todo>('/', {
      params: {
         limit: limit,
         page: currentPage,
         todo: searchTask,
         completed: progressFilter,
      }
   })
}

export const getTodoById = async (id: string) => {
   return await http.get<TodoItem>(`/${id}`)
}

export const addNewTodo = async (todo: Omit<DataType, "_id">) => {
   return await http.post<GetItem>('/', todo)
}

export const updateTodo = async (id: string, todo: Omit<DataType, "_id">) => {
   return await http.put<GetItem>(`/${id}`, todo)
}

export const deleteTodo = async (id: string) => {
   return await http.delete<GetItem>(`/${id}`)
}