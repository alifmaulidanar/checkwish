import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Collection from "../pages/Collection";

function Canvas() {
  return (
    <>
      <div className="container px-8 mx-auto lg:px-20 h-fit">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
        </Routes>
      </div>
    </>
  );
}

export default Canvas;
