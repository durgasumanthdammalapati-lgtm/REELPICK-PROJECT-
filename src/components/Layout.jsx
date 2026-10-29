import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="shell">
      <Navbar />
      <div className="app">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
