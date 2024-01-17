import { useState } from "react";
import { Form, Input, Modal, Button } from "antd";

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
              message: { message },
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
          <Input
            type="textarea"
            defaultValue={descriptionValue}
            placeholder={placeholderDescription}
            onChange={(e) => setDescriptionValue(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export { CollectionModal };
