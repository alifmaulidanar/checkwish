import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Breadcrumb, Empty } from "antd";
import {
  OpenCollection,
  AddNewCollection,
  DropdownAction,
} from "../components/Button";
import { PlusOutlined } from "@ant-design/icons";
import { CollectionModal } from "../components/Modal";

function Home() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState([]);

  const fetchCollections = async () => {
    try {
      const response = await fetch("http://localhost:8080/");
      if (!response.ok) {
        throw new Error("Failed to fetch collections");
      }
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const onCreate = async (values) => {
    try {
      const response = await fetch("http://localhost:8080/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setOpen(false);

      // Refresh the collection list
      fetchCollections();
    } catch (error) {
      console.error("Error adding new collection:", error);
    }
  };

  const onEdit = async (values) => {
    const { id, name, description } = values;
    const data = { name, description };
    try {
      const response = await fetch(`http://localhost:8080/edit?id=${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setOpen(false);

      // Refresh the collection list
      fetchCollections();
    } catch (error) {
      console.error("Error adding new collection:", error);
    }
  };

  const goToCollection = (id) => {
    navigate(`/collection?collection=${id}`);
  };

  return (
    <div id="home" className="grid w-full h-screen pt-32 mx-auto">
      <div className="grid w-full h-fit gap-y-8">
        <div className="grid items-center grid-cols-2">
          <Breadcrumb className="" items={[{ title: "Collections" }]} />
          <div className="flex justify-end">
            <AddNewCollection
              onClick={() => setOpen(true)}
              text={
                <div className="flex items-center gap-x-2">
                  <span>New collection</span>
                  <PlusOutlined />
                </div>
              }
              onCreate={onCreate}
            />
          </div>
        </div>
        {collections.length === 0 ? (
          <Empty
            className="grid justify-center w-full ml-0"
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{ height: 100 }}
            description={<span>There is no collection yet</span>}
          >
            <AddNewCollection
              onClick={() => setOpen(true)}
              text="Create a collection"
            />
          </Empty>
        ) : (
          <div className="flex flex-wrap justify-start gap-8">
            {" "}
            {/* Flex container */}
            {collections.map((collection, index) => (
              <Card
                key={index}
                title={
                  <div className="flex items-center justify-between w-full">
                    <span>{collection.name}</span>
                    <DropdownAction
                      id={collection.id}
                      onActionComplete={fetchCollections}
                      onCreateProps={onEdit}
                      valueName={collection.name}
                      valueDescription={collection.description}
                    />
                  </div>
                }
                bordered={false}
                style={{ width: 320 }}
              >
                <div className="grid h-full gap-y-4">
                  <p>{collection.description}</p>
                  <OpenCollection
                    onClick={() => goToCollection(collection.id)}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <CollectionModal
        title="Create a new collection"
        name="Collection Name"
        message="Name your new collection"
        description="Description"
        buttonText="Create"
        open={open}
        onCreate={onCreate}
        onCancel={() => setOpen(false)}
        placeholderName="Your collection name"
        placeholderDescription="Collection description"
      />
    </div>
  );
}

export default Home;
