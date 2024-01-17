import { BrowserRouter as Router } from "react-router-dom";
import Canvas from "./components/Canvas";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Router>
        <div className="min-h-screen min-w-screen">
          <Navbar />
          <Canvas />
        </div>
      </Router>
    </>
  );
}

export default App;
