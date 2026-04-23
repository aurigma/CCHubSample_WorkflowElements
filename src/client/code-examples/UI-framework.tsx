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
            config,
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
