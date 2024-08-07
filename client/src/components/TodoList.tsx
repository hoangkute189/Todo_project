import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DataType } from "../types/todos.type";

type PropsType = {
  columns: ColumnsType<DataType>;
  data?: DataType[];
};

const TodoList = ({ columns, data }: PropsType) => {
  
  return (
    <div className="list-todo mt-5">
      <Table rowKey={item => item._id} columns={columns} dataSource={data} pagination={false} bordered/>
    </div>
  );
};

export default TodoList;
