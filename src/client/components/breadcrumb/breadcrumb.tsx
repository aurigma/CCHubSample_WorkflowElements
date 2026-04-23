import Breadcrumb from "react-bootstrap/Breadcrumb";
import { CodeExampleConfig } from "../../interfaces/server-api";

interface CodeExampleBreadcrumbProps {
    codeExample: CodeExampleConfig;
}

const CodeExampleBreadcrumb = (props: CodeExampleBreadcrumbProps) => {

  return (
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>
          {props.codeExample.name}
        </Breadcrumb.Item>
      </Breadcrumb>
  );
};

export default CodeExampleBreadcrumb;
