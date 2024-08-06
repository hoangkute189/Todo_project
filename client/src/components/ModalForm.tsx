import { Form, Input, Modal, Select } from "antd";
import { ChangeEvent } from "react";

type PropsType = {
  titleModal: string;
  open: boolean;
  taskName: string;
  progress: boolean;
  handleModal: () => void;
  setOpen: (a: boolean) => void;
  handleChangeName: (e: ChangeEvent<HTMLInputElement>) => void;
  handleChangeProgress: (a: boolean) => void;
  loading: boolean;
};

const ModalForm = ({
  titleModal,
  open,
  taskName,
  progress,
  handleModal,
  setOpen,
  handleChangeName,
  handleChangeProgress,
  loading
}: PropsType) => {
  const [form] = Form.useForm();
  const formItemLayout = {
    wrapperCol: { span: 14 },
  };

  return (
    <Modal
      title={titleModal}
      centered
      open={open}
      onOk={handleModal}
      okButtonProps={{ disabled: taskName === "" ? true : false }}
      onCancel={() => setOpen(false)}
      width={500}
      loading={loading}
    >
      <Form {...formItemLayout} layout={"horizontal"} form={form}>
        <Form.Item label="Task Name">
          <Input
            placeholder="Enter name task..."
            onChange={handleChangeName}
            value={taskName}
          />
        </Form.Item>
        <Form.Item label="Completed">
          <Select
            value={progress}
            style={{ width: 120 }}
            onChange={handleChangeProgress}
            options={[
              {
                value: true,
                label: "Done",
              },
              {
                value: false,
                label: "In Progress",
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalForm;
