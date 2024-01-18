import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Breadcrumb, Empty, Table, Modal, notification } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
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
  const openNotification = (placement, type, name) => {
    api[type]({
      message: `Item deleted`,
      description: `"${name}" has been deleted successfully.`,
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
    wishName: wish.name,
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

  const onDelete = async (record) => {
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
            const newData = data.map((item) => {
              if (item.key === record.key) {
                return { ...item, deleting: true };
              }
              return item;
            });
            setWishData(newData);

            const response = await fetch(
              `http://localhost:8080/collection/delete?collection=${collectionId}&wish=${record.wishId}`,
              {
                method: "DELETE",
              }
            );

            if (!response.ok) {
              throw new Error("Network response was not ok");
            }

            openNotification("top", "success", `${record.wishName}`);
            fetchCollection();
          } catch (error) {
            console.error("Error deleting item:", error);
            reject(error);
          } finally {
            const newData = data.map((item) => {
              if (item.key === record.key) {
                return { ...item, deleting: false };
              }
              return item;
            });
            setWishData(newData);
            resolve();
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
          <EditWish onClick={() => onEdit(record)} loading={record.editing} />
          <DeleteWish
            danger="true"
            onClick={() => onDelete(record)}
            loading={record.deleting}
          />
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
            <div>
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
