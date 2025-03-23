import "./Main.css";
import reactLogo from "../../public/react.svg?inline";
import { Outlet, NavLink } from "react-router";

const Main = () => {
  return (
    <div className="react-app-view">
      <NavLink to="/foo">Foo</NavLink>
      <NavLink to="/bar">Bar</NavLink>
      <div>
        <img
          src={reactLogo}
          alt="React Logo"
          width={100}
          style={{ marginTop: 16 }}
        />
      </div>
      <Outlet />
    </div>
  );
};

export default Main;
