import Breadcrumb from "react-bootstrap/Breadcrumb";
import { SAMPLES } from "../../constants/samples";

interface SampleAppBreadcrumbProps { 
    activeSamplePath: string;
}

const SampleAppBreadcrumb = (props: SampleAppBreadcrumbProps) => {
  
    const findSampleTitleByPath = (path: string): string => {
        const sample = SAMPLES.find(sample => sample.path === path);
        return sample ? sample.name : "Unknown Sample";
    }

  return (
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>
          {findSampleTitleByPath(props.activeSamplePath)}
        </Breadcrumb.Item>
      </Breadcrumb>
  );
};

export default SampleAppBreadcrumb;