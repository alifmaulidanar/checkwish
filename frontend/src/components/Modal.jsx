import { useState } from "react";
import { Form, Input, Modal, Button, Select } from "antd";
const { Option } = Select;
import TextArea from "antd/es/input/TextArea";

const CollectionModal = ({
  title,
  name,
  message,
  description,
  buttonText,
  open,
  onCreate,
  onCancel,
  valueName = "",
  valueDescription = "",
  placeholderName = "",
  placeholderDescription = "",
}) => {
  const [form] = Form.useForm();
  const [nameValue, setNameValue] = useState(valueName);
  const [descriptionValue, setDescriptionValue] = useState(valueDescription);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        setNameValue("");
        setDescriptionValue("");
        onCreate(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      open={open}
      title={title}
      className="new-collection-modal"
      onCancel={onCancel}
      onOk={handleOk}
      footer={[
        // <Button danger key="back" onClick={onCancel}>
        //   Cancel
        // </Button>,
        <Button key="submit" className="create-button" onClick={handleOk}>
          {buttonText}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          modifier: "public",
        }}
      >
        <Form.Item
          name="name"
          label={name}
          rules={[
            {
              required: true,
              message: message,
            },
          ]}
        >
          <Input
            defaultValue={nameValue}
            placeholder={placeholderName}
            onChange={(e) => setNameValue(e.target.value)}
          />
        </Form.Item>
        <Form.Item name="description" label={description}>
          <TextArea
            autoSize
            defaultValue={descriptionValue}
            placeholder={placeholderDescription}
            onChange={(e) => setDescriptionValue(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const WishModal = ({
  title,
  buttonText,
  open,
  onCreate,
  onCancel,
  valueName = "",
}) => {
  const [form] = Form.useForm();
  const [nameValue, setNameValue] = useState(valueName);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        setNameValue("");
        onCreate(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      open={open}
      title={title}
      className="new-collection-modal"
      onCancel={onCancel}
      onOk={handleOk}
      footer={[
        // <Button danger key="back" onClick={onCancel}>
        //   Cancel
        // </Button>,
        <Button key="submit" className="create-button" onClick={handleOk}>
          {buttonText}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          modifier: "public",
        }}
      >
        {/* Name */}
        <Form.Item
          name="name"
          label="Item Name"
          rules={[
            {
              required: true,
              message: "Add item name",
            },
          ]}
        >
          <Input
            defaultValue={nameValue}
            placeholder="Item name"
            onChange={(e) => setNameValue(e.target.value)}
          />
        </Form.Item>
        {/* Price */}
        <Form.Item
          name="price"
          label="Price"
          rules={[
            {
              required: true,
              message: "Please input the price",
            },
          ]}
        >
          <Input
            placeholder="Input your wish price"
            onChange={(e) => setNameValue(e.target.value)}
          />
        </Form.Item>
        {/* Platform */}
        <Form.Item
          name="platform"
          label="Platform"
          rules={[
            {
              required: true,
              message: "Please input the platform",
            },
          ]}
        >
          <Input
            placeholder="Your wish platform located"
            onChange={(e) => setNameValue(e.target.value)}
          />
        </Form.Item>
        {/* Link */}
        <Form.Item
          name="link"
          label="Link"
          rules={[
            {
              required: true,
              message: "Please input the link",
            },
          ]}
        >
          <Input
            placeholder="Link to your wish"
            onChange={(e) => setNameValue(e.target.value)}
          />
        </Form.Item>
        {/* Status */}
        <Form.Item
          name="status"
          label="Status"
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please choose the status",
            },
          ]}
        >
          <Select placeholder="Choose status">
            <Option value="on going">On going</Option>
            <Option value="completed">Completed</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export { CollectionModal, WishModal };
