import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Breadcrumb, Empty, Button, Table } from "antd";
import { AddNewCollection } from "../components/Button";
import { CollectionModal } from "../components/Modal";

const columns = [
  {
    title: "ID",
    dataIndex: "id",
  },
  {
    title: "Product Name",
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
];

function Collection() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const collectionId = queryParams.get("collection");

  const [open, setOpen] = useState(false);
  const [collection, setCollection] = useState({ name: "", wishes: [] });
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [wishData, setWishData] = useState([]);

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
      setWishData(data.wishes || []);
    } catch (error) {
      console.error("Error fetching collection:", error);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, []);

  const wishes = collection.wishes || [];

  const onCreate = async (values) => {
    try {
      const response = await fetch(
        `http://localhost:8080/collection/${collectionId}/add`,
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
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
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
      title: collection.name,
    },
  ];

  return (
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
            <AddNewCollection onClick={() => setOpen(true)} text="New Item +" />
          </div>
        </div>
        {wishes.length === 0 ? (
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
              <Button
                onClick={start}
                disabled={!hasSelected}
                loading={loading}
                className="mr-4"
              >
                Edit
              </Button>
              <Button
                danger
                onClick={start}
                disabled={!hasSelected}
                loading={loading}
                className="mr-4"
              >
                Delete
              </Button>
              <span className="ml-4">
                {hasSelected ? `Selected ${selectedRowKeys.length} items` : ""}
              </span>
            </div>
            <Table
              fixed
              rowSelection={rowSelection}
              columns={columns}
              dataSource={wishData}
            />
          </div>
        )}
      </div>
      <CollectionModal
        open={open}
        onCreate={onCreate}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}

export default Collection;
