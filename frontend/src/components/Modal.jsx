import { useState, useEffect } from "react";
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
  const [initialValues, setInitialValues] = useState({
    name: valueName,
    description: valueDescription,
  });

  useEffect(() => {
    setInitialValues({
      name: valueName,
      description: valueDescription,
    });
    if (open) {
      form.setFieldsValue({
        name: valueName,
        description: valueDescription,
      });
    }
  }, [valueName, valueDescription, form, open]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onCreate(values);
        form.resetFields();
        onCancel();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleCancel = () => {
    form.setFieldsValue(initialValues);
    onCancel();
  };

  return (
    <Modal
      open={open}
      title={title}
      className="new-collection-modal"
      onCancel={handleCancel}
      onOk={handleOk}
      footer={[
        <Button key="submit" className="create-button" onClick={handleOk}>
          {buttonText}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="form_in_modal">
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
          <Input placeholder={placeholderName} />
        </Form.Item>
        <Form.Item
          name="description"
          label={description}
          rules={[
            {
              required: true,
              message: "Please input the description",
            },
          ]}
        >
          <TextArea autoSize placeholder={placeholderDescription} />
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
  valuePrice = "",
  valuePlatform = "",
  valueLink = "",
  valueStatus = "",
}) => {
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState({
    name: valueName,
    price: valuePrice,
    platform: valuePlatform,
    link: valueLink,
    status: valueStatus,
  });

  useEffect(() => {
    setInitialValues({
      name: valueName,
      price: valuePrice,
      platform: valuePlatform,
      link: valueLink,
      status: valueStatus,
    });
    if (open) {
      form.setFieldsValue({
        name: valueName,
        price: valuePrice,
        platform: valuePlatform,
        link: valueLink,
        status: valueStatus,
      });
    }
  }, [
    valueName,
    valuePrice,
    valuePlatform,
    valueLink,
    valueStatus,
    form,
    open,
  ]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onCreate(values);
        form.resetFields();
        onCancel();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleCancel = () => {
    form.setFieldsValue(initialValues);
    onCancel();
  };

  return (
    <Modal
      open={open}
      title={title}
      className="new-collection-modal"
      onCancel={handleCancel}
      onOk={handleOk}
      footer={[
        <Button key="submit" className="create-button" onClick={handleOk}>
          {buttonText}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="form_in_modal">
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
          <Input placeholder="Item name" />
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
          <Input placeholder="Input your wish price" />
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
          <Input placeholder="Your wish platform located" />
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
          <Input placeholder="Link to your wish" />
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
