import { useState } from "react";
import { Menu, Dropdown, Button, Modal } from "antd";
import {
  EllipsisOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { CollectionModal } from "./Modal";

function OpenCollection({ onClick }) {
  return (
    <>
      <Button onClick={onClick}>Open</Button>
    </>
  );
}

function AddNewCollection({ onClick, text }) {
  return (
    <>
      <Button className="bg-white w-fit" onClick={onClick}>
        {text}
      </Button>
    </>
  );
}

function DropdownAction({
  id,
  onActionComplete,
  onCreateProps,
  valueName = "",
  valueDescription = "",
  placholderName = "",
  placeholderDescription = "",
}) {
  const [editModalVisible, setEditModalVisible] = useState(false);

  const showConfirm = () => {
    Modal.confirm({
      title: "Do you want to delete this collection?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okButtonProps: {
        className: "ok-button",
      },
      onOk() {
        return new Promise(async (resolve, reject) => {
          try {
            const response = await fetch(
              `http://localhost:8080/delete?id=${id}`,
              {
                method: "DELETE",
              }
            );
            if (!response.ok) {
              throw new Error("Error deleting collection");
            }
            if (onActionComplete) {
              onActionComplete();
            }
            resolve();
          } catch (error) {
            console.error("Failed to delete:", error);
            reject(error);
          }
        });
      },
    });
  };

  const showEdit = () => {
    setEditModalVisible(true);
  };

  const onMenuClick = async (e) => {
    if (e.key === "edit") {
      showEdit();
    }

    if (e.key === "delete") {
      showConfirm();
    }
  };

  const items = [
    {
      label: (
        <div className="flex items-center justify-between gap-x-4">
          <span>Edit</span>
          <EditOutlined />
        </div>
      ),
      key: "edit",
    },
    {
      label: (
        <div className="flex items-center justify-between gap-x-4">
          <span>Delete</span>
          <DeleteOutlined />
        </div>
      ),
      key: "delete",
      danger: true,
    },
  ];

  return (
    <>
      <Dropdown
        overlay={<Menu items={items} onClick={onMenuClick} />}
        trigger={["click"]}
        placement="bottom"
        arrow={{ pointAtCenter: true }}
      >
        <Button
          className="flex items-center justify-center w-6"
          onClick={(e) => e.preventDefault()}
        >
          <EllipsisOutlined />
        </Button>
      </Dropdown>

      <CollectionModal
        title="Update collection"
        name="Collection Name"
        message="Name your collection"
        description="Description"
        buttonText="Save"
        open={editModalVisible}
        onCreate={(values) => {
          onCreateProps({ ...values, id: id });
          setEditModalVisible(false);
        }}
        onCancel={() => setEditModalVisible(false)}
        valueName={valueName}
        valueDescription={valueDescription}
        placholderName={placholderName}
        placeholderDescription={placeholderDescription}
      />
    </>
  );
}

export { OpenCollection, AddNewCollection, DropdownAction };
