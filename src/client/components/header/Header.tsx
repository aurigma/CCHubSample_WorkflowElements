import "./Header.scss";
import Logo from "../logo/Logo";
import { useLocation } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";

const Header = () => {
  const location = useLocation();

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Navbar.Brand href="/"><Logo></Logo></Navbar.Brand>
    </Navbar>
  );
};

export default Header;