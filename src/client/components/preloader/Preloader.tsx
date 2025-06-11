import Row from "react-bootstrap/Row";
import "./Preloader.scss";

import ProgressBar from 'react-bootstrap/ProgressBar';
import Col from "react-bootstrap/Col";
import { useEffect, useState } from "react";
interface ComponentProps {
  isActive?: boolean;
}

const Preloader: React.FC<ComponentProps> = ({ isActive }) => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {

    (async () => {

      const intervalId = setInterval(() => {
        setCounter((prevCounter) => prevCounter + 1);
        if (counter >= 99) {
          clearInterval(intervalId);
        }
      }, 50);

      // Cleanup on component unmount
      return () => {
        clearInterval(intervalId);
      };

    })();

  }, []);

  return (
    <div className={isActive ? 'preloader preloader_active' : 'preloader'}>
      <Row className="justify-content-center">
        <Col xs="auto" className="text-center d-flex flex-column align-items-center">
          <div>Loading UI...</div>
          <ProgressBar className="w-100" animated now={counter} />
        </Col>
      </Row>
    </div>
  );
};

export default Preloader;