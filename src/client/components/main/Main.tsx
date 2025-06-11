import { useNavigate } from "react-router-dom";
import { SAMPLES } from "../../constants/samples";
import "./Main.scss";
import Header from "../header/Header";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';

const Main = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Container className="py-5">
        <Row className="py-lg-5">
          <Col lg={6} md={8} className="mx-auto">
            <h1 className="fw-light">Code examples</h1>
          </Col>
        </Row>
        <Row>
          <Col lg={6} md={8} className="mx-auto">
          <ListGroup as="ul" className="list-unstyled">
            {SAMPLES.map((sample, index) => (
              <ListGroup.Item as="li" key={index} className="mb-3">
                <a role='button' className="main__samples-list__item-title" onClick={() => navigate(sample.path)}>
                  {sample.name}
                </a>
                <div className="main__samples-list__item-desc">
                  {sample.description}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Main;