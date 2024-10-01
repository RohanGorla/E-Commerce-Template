import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <>
      <div className="App_Navbar_Container">
        <Navbar />
      </div>
      <div className="App_Outlet_Container">
        <Outlet />
        <Footer />
      </div>
    </>
  );
}

export default App;
