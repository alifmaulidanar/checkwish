import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Breadcrumb, Empty, Button, Table, Modal, notification } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { AddNewCollection, EditWish, DeleteWish } from "../components/Button";
import { WishModal } from "../components/Modal";

function Collection() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const collectionId = queryParams.get("collection");
  const name = location.state || {};

  const [open, setOpen] = useState(false);
  const [collection, setCollection] = useState({ name: "", wishes: [] });
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [wishData, setWishData] = useState([]);

  const [api, contextHolder] = notification.useNotification();
  const openNotification = (placement, type) => {
    api[type]({
      message: `Item deleted successfully`,
      description:
        "This is the content of the notification. This is the content of the notification. This is the content of the notification.",
      placement,
    });
  };

  const fetchCollection = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/collection?collection=${collectionId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch collection");
      }
      const data = await response.json();
      setCollection(data);
      setWishData(data.wishlist || []);
    } catch (error) {
      console.error("Error fetching collection:", error);
    }
  };

  const data = wishData.map((wish, index) => ({
    ...wish,
    key: index,
    no: index + 1,
    wishId: wish.id,
  }));

  useEffect(() => {
    fetchCollection();
  }, []);

  const onCreate = async (values) => {
    try {
      const response = await fetch(
        `http://localhost:8080/collection/add?collection=${collectionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Refresh the collection list
      fetchCollection();
      setOpen(false);
    } catch (error) {
      console.error("Error adding new collection:", error);
    }
  };

  const onEdit = async (values) => {
    console.log("EditWish clicked for item:", values);
  };

  const onDelete = async () => {
    Modal.confirm({
      title: "Do you want to delete this item?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okButtonProps: {
        className: "ok-button",
      },
      onOk() {
        return new Promise(async (resolve, reject) => {
          try {
            const wishIdsToDelete = selectedRowKeys.map(
              (key) => data.find((item) => item.key === key)?.wishId
            );

            const response = await fetch(
              `http://localhost:8080/collection/delete?collection=${collectionId}&wish=${wishIdsToDelete.join(
                ","
              )}`,
              {
                method: "DELETE",
              }
            );

            if (!response.ok) {
              throw new Error("Network response was not ok");
            }

            openNotification("top", "success");
            fetchCollection();
            setSelectedRowKeys([]);
            resolve();
            // message.success("Selected items deleted successfully");
          } catch (error) {
            console.error("Error deleting items:", error);
            reject(error);
          }
        });
      },
    });
  };

  // Table
  const start = () => {
    setLoading(true);
    // ajax request after empty completing
    setTimeout(() => {
      setSelectedRowKeys([]);
      setLoading(false);
    }, 1000);
  };
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  const breadcrumbItems = [
    {
      title: "Collections",
      href: "/",
    },
    {
      title: name,
    },
  ];

  const columns = [
    {
      title: "No.",
      dataIndex: "no",
    },
    {
      title: "Item Name",
      dataIndex: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
    },
    {
      title: "Date Added",
      dataIndex: "date",
    },
    {
      title: "Platform",
      dataIndex: "platform",
    },
    {
      title: "Link",
      dataIndex: "link",
    },
    {
      title: "Status",
      dataIndex: "status",
    },

    // Button EditWish dan DeleteWish
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => (
        <span className="flex gap-x-2">
          <EditWish onClick={() => onEdit(record)} loading={loading} />
          <DeleteWish danger="true" onClick={onDelete} loading={loading} />
        </span>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div id="collection" className="grid w-full h-screen pt-32 mx-auto">
        <div className="grid w-full h-fit gap-y-8">
          <div className="grid items-center grid-cols-2">
            <Breadcrumb className="">
              {breadcrumbItems.map((item, index) => {
                const isLastItem = index === breadcrumbItems.length - 1;
                return (
                  <Breadcrumb.Item key={index}>
                    {isLastItem ? (
                      item.title
                    ) : (
                      <Link to={item.href}>{item.title}</Link>
                    )}
                  </Breadcrumb.Item>
                );
              })}
            </Breadcrumb>
            <div className="flex justify-end">
              <AddNewCollection
                onClick={() => setOpen(true)}
                text="New Item +"
              />
            </div>
          </div>
          {data.length === 0 ? (
            <Empty
              className="grid justify-center w-full ml-0"
              image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
              imageStyle={{ height: 100 }}
              description={<span>No items here</span>}
            >
              <AddNewCollection
                onClick={() => setOpen(true)}
                text="Add new item"
              />
            </Empty>
          ) : (
            <div className="">
              <div
                style={{
                  marginBottom: 16,
                }}
              >
                <EditWish
                  onClick={start}
                  disabled={!hasSelected}
                  loading={loading}
                  className="mr-4"
                />
                <DeleteWish
                  danger="true"
                  onClick={onDelete}
                  disabled={!hasSelected}
                  loading={loading}
                  className="w-auto mr-4"
                />
                <span className="ml-4">
                  {hasSelected
                    ? `Selected ${selectedRowKeys.length} items`
                    : ""}
                </span>
              </div>
              <Table
                fixed
                rowSelection={rowSelection}
                columns={columns}
                dataSource={data}
              />
            </div>
          )}
        </div>
        <WishModal
          title="Add new item"
          buttonText="Create"
          open={open}
          onCreate={onCreate}
          onCancel={() => setOpen(false)}
        />
      </div>
    </>
  );
}

export default Collection;
