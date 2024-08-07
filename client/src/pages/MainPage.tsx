import {
  Button,
  Input,
  message,
  Pagination,
  PaginationProps,
  Popconfirm,
  Space,
  Spin,
  Tooltip,
} from "antd";
import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import TodoList from "../components/TodoList";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import ModalForm from "../components/ModalForm";
import Heading from "../components/Heading";
import {
  addNewTodo,
  deleteTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
} from "../apis/todo.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataType } from "../types/todos.type";
import FilterProgress from "../components/FilterProgress";
import { debounce } from "lodash";
import { useSearchParams } from "react-router-dom";

type ModalType = "edit" | "add";

function App() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [open, setOpen] = useState(false);
  const [typeModal, setTypeModal] = useState<ModalType>("add");
  const [taskName, setTaskName] = useState<string>("");
  const [progress, setProgress] = useState<boolean>(false);
  const [editID, setEditID] = useState<string | undefined>(undefined);
  const [titleModal, setTitleModal] = useState<string>("");
  const [searchTask, setSearchTask] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [progressFilter, setProgressFilter] = useState<boolean | undefined>(
    undefined
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const todosQuery = useQuery({
    queryKey: ["todos", currentPage, searchTask, progressFilter],
    queryFn: () => getAllTodos({ currentPage, searchTask, progressFilter }),
  });

  const todoQuery = useQuery({
    queryKey: ["todo", editID],
    queryFn: () => getTodoById(editID as string),
    enabled: editID !== undefined,
  });

  const addTodoMutation = useMutation({
    mutationFn: ({ todo, completed, userId }: Omit<DataType, "_id">) => {
      return addNewTodo({ todo, completed, userId });
    },
    onSuccess: (data) => {
      message.success(`Add Success`);
      console.log("data after add:", data.data.data);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["todos", currentPage] });
      }, 1000);
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ _id, todo, completed, userId }: DataType) => {
      return updateTodo(_id, { todo, completed, userId });
    },
    onSuccess: (data) => {
      message.success(`Update Success todo id ${data.data.data._id}`);
      console.log("Data after update: ", data.data.data);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["todos", currentPage] });
        queryClient.invalidateQueries({ queryKey: ["todo", editID] });
      }, 1000);
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => {
      return deleteTodo(id);
    },
    onSuccess: (_, id) => {
      message.success(`Delete Success todo id ${id}`);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["todos", currentPage] });
      }, 1000);
    },
  });

  // fix this
  useEffect(() => {
    setCurrentPage(Number(searchParams.get("page")) || 1)
  }, [searchParams])

  useEffect(() => {
    if (typeModal === "edit") {
      console.log(todoQuery.data?.data.data);
      setTaskName(todoQuery.data?.data.data.todo || "");
      setProgress(todoQuery.data?.data.data.completed || false);
    }
  }, [todoQuery.data, typeModal, open]);

  const columns: ColumnsType<DataType> = [
    {
      title: "id",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Task name",
      dataIndex: "todo",
      key: "todo",
      render: (text) => <a>{text}</a>,
    },
    {
      title: <FilterProgress setProgressFilter={setProgressFilter} />,
      key: "completed",
      dataIndex: "completed",
      render: (text) => {
        const color = text ? "green" : "geekblue";

        return (
          <>
            <Tag color={color} key={text}>
              {text ? "Done" : "In progress"}
            </Tag>
          </>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record: DataType) =>
        todosQuery.data && todosQuery.data.data.totalItems >= 1 ? (
          <Space key={record._id}>
            <Tooltip placement="top" title={"Update"}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => updateModal(record._id)}
              ></Button>
            </Tooltip>
            <Tooltip placement="top" title={"Delete"}>
              <Popconfirm
                title="Sure to delete this task?"
                onConfirm={() => handleDelete(record._id)}
              >
                <Button
                  type="primary"
                  icon={<DeleteOutlined />}
                  danger
                ></Button>
              </Popconfirm>
            </Tooltip>
          </Space>
        ) : null,
    },
  ];

  const debounceSearch = useRef(
    debounce((nextValue: string) => setSearchTask(nextValue), 500)
  ).current;

  const handleChangeSearchTask = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
    debounceSearch(e.target.value);
  };

  const handleClickAddTask = () => {
    setOpen(true);
    setTypeModal("add");
    setTitleModal("ADD TASK");
    setTaskName("");
    setProgress(false);
  };

  const updateModal = (id: string) => {
    setEditID(id);
    setTypeModal("edit");
    setTitleModal("EDIT TASK");
    setOpen(true);
  };

  const handleDelete = async (key: string) => {
    await deleteTodoMutation.mutateAsync(key);
  };

  const handleChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    setTaskName(event.target.value);
  };

  const handleChangeProgress = (value: boolean) => {
    setProgress(value);
  };

  const handleModal = async () => {
    const taskForm: Omit<DataType, "_id"> = {
      todo: taskName,
      completed: progress,
      userId: "1",
    };

    if (typeModal === "add") {
      try {
        await addTodoMutation.mutateAsync(taskForm);
      } catch (error) {
        console.log(error);
        message.error(error as string);
      }
    } else {
      const editRow = todoQuery.data?.data.data;
      console.log(editRow);
      try {
        if (editRow) {
          const updateForm: DataType = {
            ...editRow,
            todo: taskName,
            completed: progress,
          };

          await updateTodoMutation.mutateAsync(updateForm);
        }
      } catch (error) {
        console.log(error);
        message.error(error as string);
      }
    }
    setTaskName("");
    setProgress(false);
    setOpen(false);
  };

  const onChangePagination: PaginationProps["onChange"] = (page) => {
    setCurrentPage(page);

    setSearchParams((prev) => ({
      ...prev,
      page: String(page)
    }))
  };

  return (
    <>
      <div className="w-[100vw] p-10 flex flex-col">
        <Heading />
        <div className="flex items-center justify-between">
          <Button icon={<PlusCircleOutlined />} onClick={handleClickAddTask}>
            Add new task
          </Button>
          <span className="w-[40%]">
            <Input
              placeholder="Search task name"
              value={searchInput}
              prefix={<SearchOutlined />}
              onChange={handleChangeSearchTask}
            />
          </span>
        </div>
        <ModalForm
          titleModal={titleModal}
          open={open}
          taskName={taskName}
          progress={progress}
          handleModal={handleModal}
          setOpen={setOpen}
          handleChangeName={handleChangeName}
          handleChangeProgress={handleChangeProgress}
          loading={todoQuery.isLoading}
        />
        <Spin tip="Loading..." spinning={todosQuery.isLoading}>
          <div className="flex flex-col">
            <TodoList columns={columns} data={todosQuery.data?.data.data} />
            <div className="self-end mt-5">
              <Pagination
                current={currentPage}
                total={todosQuery.data?.data.totalItems}
                pageSize={5}
                showSizeChanger={false}
                onChange={onChangePagination}
              />
            </div>
          </div>
        </Spin>
      </div>
    </>
  );
}

export default App;
