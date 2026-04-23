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
  return config;
};

const UIFramework = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded) {
      (async () => {
        setIsLoaded(true);
        performance.mark("uif_init_start");

        const personalizationParams =
          await ServerApiService.getPersonalizationParameters(
            import.meta.env["VITE_PRODUCT_REFERENCE"],
          );

        const [driverModule, editorModule, token] = await Promise.all([
          getECommerceDriver(personalizationParams.uiFrameworkUrl as string),
          getEditor(personalizationParams.uiFrameworkUrl as string),
          ServerApiService.getToken(USER_ID),
        ]);

        const config = JSON.parse(
          personalizationParams.workflowContent as string,
        );
        const user = getUserData(USER_ID, token);
        const pluginSettings = getPluginSettings(personalizationParams);
        const backOfficeSettings = getBackOfficeSettings(
          personalizationParams,
          token,
        );

        const eCommerceDriver = await driverModule.init(
          PRODUCT,
          editorModule,
          updateConfigForLoadTimeCheck(config),
          pluginSettings,
          null,
          QUANTITY,
          user,
          backOfficeSettings,
        );
        eCommerceDriver.products.current.renderEditor(containerRef.current);
        eCommerceDriver.cart.onSubmitted.subscribe(async (cart: any) => {
          const [lineItem] = cart.lineItems;
          const requestBody = {
            privateDesignId: lineItem.props._stateId[0],
            userId: lineItem.props._userId,
            orderId: ORDER_ID, // it is supposed to be taken from your system.
          };

          const project = await ServerApiService.saveProject(requestBody);
          alert(
            `You have successfully created a project ${project.id} (name '${project.name}').`,
          );
        });
      })();
    }
  }, [isLoaded]);

  return (
    <Container>
      <div ref={containerRef} />
    </Container>
  );
};

export default UIFramework;
