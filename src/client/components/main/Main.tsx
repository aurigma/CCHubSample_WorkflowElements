import { useNavigate } from "react-router-dom";
import "./Main.scss";
import Header from "../header/Header";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Preloader from "../preloader/Preloader";
import { CodeExampleConfig } from "../../interfaces/server-api";

interface MainProps {
  codeExamples: CodeExampleConfig[];
  isLoading: boolean;
  error: string | null;
}

const Main = ({ codeExamples, isLoading, error }: MainProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Preloader isActive={isLoading || !!error} isError={!!error} errorMessage={error ?? undefined}></Preloader>
      <Container className="py-5">
        <Row className="py-lg-5">
          <Col lg={6} md={8} className="mx-auto">
            <h1 className="fw-light">Code examples</h1>
          </Col>
        </Row>
        <Row>
          <Col lg={6} md={8} className="mx-auto">
          <ListGroup as="ul" className="list-unstyled">
            {codeExamples.map((codeExample) => (
              <ListGroup.Item as="li" key={codeExample.path} className="mb-3">
                <a role='button' className="main__code-examples-list__item-title" onClick={() => navigate(codeExample.path)}>
                  {codeExample.name}
                </a>
                <div className="main__code-examples-list__item-desc">
                  {codeExample.description}
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
