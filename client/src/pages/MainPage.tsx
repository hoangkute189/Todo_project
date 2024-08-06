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
import { ChangeEvent, Key, useEffect, useState } from "react";
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

type ModalType = "edit" | "add";

function App() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [open, setOpen] = useState(false);
  const [typeModal, setTypeModal] = useState<ModalType>("add");
  const [taskName, setTaskName] = useState<string>("");
  const [progress, setProgress] = useState<boolean>(false);
  const [editID, setEditID] = useState<string | undefined>(undefined);
  const [titleModal, setTitleModal] = useState<string>("");
  const [taskList, setTaskList] = useState<DataType[]>([]);
  const queryClient = useQueryClient();

  const todosQuery = useQuery({
    queryKey: ["todos", currentPage],
    queryFn: () => getAllTodos(currentPage, 6),
  });

  const todoQuery = useQuery({
    queryKey: ["todo", editID],
    queryFn: () => getTodoById(editID as string),
    enabled: editID !== undefined,
  });

  const addTodomutation = useMutation({
    mutationFn: ({ todo, completed, userId }: Omit<DataType, "id">) => {
      return addNewTodo({ todo, completed, userId });
    },
    onSuccess: (data) => {
      message.success(`Add Success todoid`);
      console.log(data.data);
      queryClient.invalidateQueries({ queryKey: ["todos", currentPage] });
    },
  });

  const updateTodomutation = useMutation({
    mutationFn: ({ id, todo, completed, userId }: DataType) => {
      return updateTodo(id, { todo, completed, userId });
    },
    onSuccess: (data) => {
      message.success(`Update Success todoid ${data.data.id}`);
      console.log(data.data);
      queryClient.invalidateQueries({ queryKey: ["todos", currentPage] });
    },
  });

  const deleteTodomutation = useMutation({
    mutationFn: (id: string) => {
      return deleteTodo(id);
    },
    onSuccess: (_, id) => {
      message.success(`Delete Success todoid ${id}`);
      queryClient.invalidateQueries({ queryKey: ["todos", currentPage] });
    },
  });

  useEffect(() => {
    if (typeModal === "edit") {
      setTaskName(todoQuery.data?.data.todo || "");
      setProgress(todoQuery.data?.data.completed || false);
    }
  }, [todoQuery.data, typeModal]);

  useEffect(() => {
    setTaskList(todosQuery.data?.data.todos || []);
  }, [todosQuery.data]);

  const columns: ColumnsType<DataType> = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Task name",
      dataIndex: "todo",
      key: "todo",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Completed",
      key: "completed",
      dataIndex: "completed",
      filters: [
        {
          text: "Done",
          value: true,
        },
        {
          text: "In Progress",
          value: false,
        },
      ],
      onFilter: (value: boolean | Key, record) =>
        record.completed === (value as boolean),
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
        todosQuery.data && todosQuery.data.data.todos.length >= 1 ? (
          <Space key={record.id}>
            <Tooltip placement="top" title={"Chỉnh sửa"}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => updateModal(record.id)}
              ></Button>
            </Tooltip>
            <Tooltip placement="top" title={"Xóa task"}>
              <Popconfirm
                title="Sure to delete this task?"
                onConfirm={() => handleDelete(record.id)}
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

  const handleChangeSearchTask = (e: ChangeEvent<HTMLInputElement>) => {
    const currentData = todosQuery.data?.data.todos;
    const filterData = currentData && currentData.filter((task) =>
      task.todo.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setTaskList(filterData || taskList);
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

    // const data = todoQuery.data;
    // console.log(data)
    // setTaskName(data?.data.todo || "");
    // setProgress(data?.data.completed || false);
  };

  const handleDelete = async (key: string) => {
    await deleteTodomutation.mutateAsync(key);
  };

  const handleChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    setTaskName(event.target.value);
  };

  const handleChangeProgress = (value: boolean) => {
    setProgress(value);
  };

  const handleModal = async () => {
    const taskForm: Omit<DataType, "id"> = {
      todo: taskName,
      completed: progress,
      userId: "1",
    };

    if (typeModal === "add") {
      try {
        await addTodomutation.mutateAsync(taskForm);
      } catch (error) {
        console.log(error);
        message.error(error as string);
      }
    } else {
      const editRow = todoQuery.data?.data;
      try {
        if (editRow) {
          const updateForm: DataType = {
            ...editRow,
            todo: taskName,
            completed: progress,
          };

          await updateTodomutation.mutateAsync(updateForm);
          // console.log("update response: ", updateResponse.data);
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
            <TodoList columns={columns} data={taskList} />
            <div className="self-end mt-5">
              <Pagination
                current={currentPage}
                total={todosQuery.data?.data.total}
                pageSize={6}
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
