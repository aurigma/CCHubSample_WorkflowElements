import Row from "react-bootstrap/Row";
import "./Preloader.scss";

import ProgressBar from 'react-bootstrap/ProgressBar';
import Col from "react-bootstrap/Col";
import { useEffect, useState } from "react";
interface ComponentProps {
  isActive?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

const Preloader: React.FC<ComponentProps> = ({ isActive, isError, errorMessage }) => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (!isActive || isError) {
      return;
    }

    const intervalId = setInterval(() => {
      setCounter((prevCounter) => Math.min(prevCounter + 1, 99));
    }, 50);

    return () => {
      clearInterval(intervalId);
    };
  }, [isActive, isError]);

  return (
    <div className={isActive ? 'preloader preloader_active' : 'preloader'}>
      <Row className="justify-content-center">
        <Col xs="auto" className="text-center d-flex flex-column align-items-center">
          {isError ? (
            <>
              <div className="preloader__error-icon">!</div>
              <div className="preloader__error-title">Loading failed</div>
              <div className="preloader__error-message">
                {errorMessage ?? "Something went wrong while loading."}
              </div>
            </>
          ) : (
            <>
              <div>Loading UI...</div>
              <ProgressBar className="w-100" animated now={counter} />
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Preloader;
