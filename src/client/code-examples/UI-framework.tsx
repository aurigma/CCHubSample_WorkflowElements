import { useEffect, useRef, useState } from "react";
import { ServerApiService } from "../shared/server-api-service";
import {
  getBackOfficeSettings,
  getECommerceDriver,
  getEditor,
  getPluginSettings,
  getUserData,
} from "../shared/uif";
import Container from "react-bootstrap/esm/Container";
import { CodeExamplePageProps } from "../interfaces/server-api";
import { getStringParam } from "../shared/code-example-params";
import CodeExampleBreadcrumb from "../components/breadcrumb/breadcrumb";
import Header from "../components/header/Header";
import Preloader from "../components/preloader/Preloader";
import Navbar from "react-bootstrap/esm/Navbar";
import { getErrorMessage } from "../shared/errors";

const USER_ID = "testUserId42";
const QUANTITY = 1;
const PRODUCT = {
  id: 0,
  sku: "PRODUCT-001",
  name: "My Product",
  description: "",
  options: [],
  price: 1,
  attributes: [],
};
const ORDER_ID = "42";

const updateConfigForLoadTimeCheck = (config: any) => {
  const ddeWidget = config.widgets.find(
    (widget: any) => widget.type === "data-driven-editor",
  );
  if (ddeWidget == null) return config;

  ddeWidget.params.onReady = [
    "{{#function performance.measure('uif_init_duration', 'uif_init_start') }}",
    "{{#function console.log(`The editor loaded in ${(performance.getEntriesByName('uif_init_duration')[0].duration / 1000).toFixed(2)} seconds`) }}",
    "{{#function main.showToast({ message: `The editor loaded in ${(performance.getEntriesByName('uif_init_duration')[0].duration / 1000).toFixed(2)} seconds`, duration: 5000 }) }}",
  ];

  const approveStep = config.steps.find(
    (step: any) => step.name === "Approve" && Array.isArray(step.onActivate) && step.onActivate != null
  );

  if (approveStep) {
    approveStep.onActivate.unshift(
      "{{#function performance.mark('approve_step_activated')}}");
    approveStep.onActivate.push(
      "{{#function performance.measure('time_to_approve_step', 'approve_step_activated') }}",
      "{{#function console.log(`Time to generate preview: ${(performance.getEntriesByName('time_to_approve_step')[0].duration / 1000).toFixed(2)} seconds`) }}",
      "{{#function main.showToast({ message: `Time to generate preview: ${(performance.getEntriesByName('time_to_approve_step')[0].duration / 1000).toFixed(2)} seconds`, duration: 5000 }) }}"
    );
  }

  return config;
};

const UIFramework = ({ codeExample }: CodeExamplePageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded) {
      (async () => {
        try {
          setIsLoaded(true);
          performance.mark("uif_init_start");

          const productReference = getStringParam(codeExample, "productReference");

          const personalizationParams =
            await ServerApiService.getPersonalizationParameters(productReference);

          const [driverModule, editorModule, token] = await Promise.all([
            getECommerceDriver(personalizationParams.uiFrameworkUrl as string),
            getEditor(personalizationParams.uiFrameworkUrl as string),
            ServerApiService.getToken(USER_ID),
          ]);

          const config = JSON.parse(
            personalizationParams.workflowContent as string
          );
          const user = getUserData(USER_ID, token);
          const pluginSettings = getPluginSettings(personalizationParams);
          const backOfficeSettings = getBackOfficeSettings(
            personalizationParams,
            token
          );

          const eCommerceDriver = await driverModule.init(
            PRODUCT,
            editorModule,
            updateConfigForLoadTimeCheck(config),
            pluginSettings,
            null,
            QUANTITY,
            user,
            backOfficeSettings
          );
          const uif = await eCommerceDriver.products.current.renderEditor(containerRef.current);

          setIsLoading(true);

          eCommerceDriver.cart.onSubmitted.subscribe(async (cart: any) => {
            const [lineItem] = cart.lineItems;
            const requestBody = {
              privateDesignId: lineItem.props._stateId[0],
              userId: lineItem.props._userId,
              orderId: ORDER_ID, // it is supposed to be taken from your system.
            };

            const project = await ServerApiService.saveProject(requestBody);
            alert(
              `You have successfully created a project ${project.id} (name '${project.name}').`
            );
          });
        } catch (error) {
          if (!isLoading) {
            setLoadingError(getErrorMessage(error));
          }
        }
      })();
    }
  }, [isLoaded, codeExample]);

  return (
    <>
      <Preloader isActive={!isLoading || !!loadingError} isError={!!loadingError} errorMessage={loadingError ?? undefined}></Preloader>
      <Container fluid>
        <Navbar expand="lg" className="bg-body-tertiary">
          <CodeExampleBreadcrumb codeExample={codeExample} />
        </Navbar>
        <div style={{ height: "90vh" }} ref={containerRef} />
      </Container>
    </>
  );
};

export default UIFramework;
