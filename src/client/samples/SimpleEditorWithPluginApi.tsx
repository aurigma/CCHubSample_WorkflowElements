import { useEffect, useState } from "react";
import Preloader from "../components/preloader/Preloader.js";
import { loadWorkflowElement } from "../shared/asset-loaders.js";
import { ServerApiService } from "../shared/server-api-service.js";
import { simpleEditorBasicSampleSettings } from "../constants/configuration.js"
import { getWorkflowElementUrl, WorkflowElementType } from "../shared/urls.js";
import Header from "../components/header/Header.js";
import { DesignAtomsColors, DesignAtomsContainers } from "../interfaces/plugin-api.js";
import { Viewer } from "@aurigma/design-atoms";
import { BaseItem, Surface, SurfaceContainer } from "@aurigma/design-atoms-model";

const SimpleEditorWithPluginApi = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isComponentLoaded, setIsComponentLoaded] = useState(false);
  const userId = "testUserId42";
  const orderId = "42";

  useEffect(() => {

    (async () => {

      // In this sample we illustrate how to load Simple Editor dynamically. 
      //
      // Technically, you can just add scripts and styles statically. However, the following
      // considerations should be taken into account: 
      // - Having multiple instances of SE on one page may be a problem. That's why a cleanup is recommended.
      // - You may want using different editors for different products, that's why you may want dynamically determine 
      // which script to load. 
      const [style, script] = await loadWorkflowElement(getWorkflowElementUrl(WorkflowElementType.SimpleEditor));

      setIsScriptLoaded(true);

      // Cleanup on component unmount
      return () => {
        document.head.removeChild(style);
        document.body.removeChild(script);
      };

    })();

  }, []);

  useEffect(() => {
    // You may load Simple Editor only once its script is ready.
    if (isScriptLoaded) {
      (async () => {

        // Before you load the editor, you need to capture some data from the backend:
        // - Get a Storefront User Token so that Simple Editor were able to communicate to Customer's Canvas API
        // - Get some Customer's Canvas related settings (can be hardcoded on the frontend)
        // - Get Customer's Canvas product ID. Some alternative ways to specify how to locate the data is available.
        //
        // Also, in a real-life code you may want to capture Simple Editor configuration for a specific product from
        // backend as well (as you may want to store different settings for different products). However, in this sample
        // the configuration is hardcoded for simplicity. 
        const [token, productInfo] = await ServerApiService.getStartPersonalizationData(userId);

        // To load the editor, you need to call the `init` method where you pass:
        // - Some integration settings, including tenant info, user info, etc. 
        // - Input information, such as a Product ID
        // - Settings (config) and resources (additional data)
        //
        // In a real-life app you may need to get this structure by merging the Workflow File extracted
        // from a product with the integration settings and input.
        const simpleEditor = document.querySelector("au-simple-editor") as any;
        simpleEditor?.init({
          configVersion: 2,
          integration: initIntegrationData(productInfo.tenantId, productInfo.storefrontId, userId, token, productInfo.cchubApiGatewayUrl),
          input: {
            productId: productInfo.productId,
          },
          settings: simpleEditorBasicSampleSettings
        });

        // Event handlers

        /** Use the load event to hide a preloader */
        document?.addEventListener("editorloaded", (e: any) => {
          setIsComponentLoaded(true);
          const DAContainers = simpleEditor.injector.get("DESIGN_ATOMS_CONTAINERS_TOKEN") as DesignAtomsContainers;
          const viewer = simpleEditor.injector.get("VIEWER_TOKEN") as Viewer;
          const DAColors = simpleEditor.injector.get("DESIGN_ATOMS_COLORS_TOKEN") as DesignAtomsColors;

          const oldContainer = viewer.userEditContainer; //main container 
          const oldContainerItems = oldContainer.items.toArray();
          const oldContainerName = oldContainer.name ?? "";

          const newContainer = createColorlessContainer(oldContainerName, oldContainerItems, viewer, DAContainers, DAColors);

          replaceContainer(oldContainer, newContainer, viewer);
        });

        /** Use the addtocart event to capture the output data from the editor 
         * when the user clicks Add to cart.
         * 
         * In this example, we submit a project to Customer's Canvas to start rendering.
         * In a real-life app you need to save this output temporary with a shopping cart line item,
         * and create a project once the user successfully completes the checkout process.  
         * */
        simpleEditor?.addEventListener("addtocart", async (e: CustomEvent) => {
          const editorOutput = e.detail as any;

          const requestBody = {
            privateDesignId: editorOutput.properties._stateId[0],
            userId: editorOutput.properties._userId,
            orderId: orderId // it is supposed to be taken from your system.
          }

          const project = await ServerApiService.saveProject(requestBody);
          simpleEditor.showLoader(false);
          alert(`You have successfully created a project ${project.id} (name '${project.name}').`);
        });
      })()
    }
  }, [isScriptLoaded]);

  


  const initIntegrationData = (tenantId: number, storefrontId: number, userId: string, storefrontUserToken: string, cchubApiGatewayUrl: string) => ({
    tenantId,
    user: {
      id: userId,
      token: storefrontUserToken,
    },
    storefrontId,
    cchubApiGatewayUrl
  });

  const createColorlessContainer = (name: string, items: BaseItem[], viewer: any, DAContainers: DesignAtomsContainers, DAColors: DesignAtomsColors) => {
    const container = new DAContainers.ColorLessContainer(items, name);
    container.printingTechniqueConstraints = createTechniqueConstraints(DAContainers); //optional
    container.outputColor = viewer.colorParser.parse("cmyk(0%,0%,0%,100%,100%)");
    const visualization = new DAContainers.ColorContainerVisualization();
    visualization.color = new DAColors.RgbColor(0, 0, 0, 255);
    container.visualization = visualization;
    return container;
  }

  const createTechniqueConstraints = (containers: DesignAtomsContainers) => {
    const techniqueConstraints = new containers.PrintingTechniqueConstraints();
    techniqueConstraints.minFontSize = 8;
    techniqueConstraints.minWidth = 100;
    techniqueConstraints.targetDpi = 300;
    techniqueConstraints.allowRasterElements = true;
    return techniqueConstraints;
  }

  const replaceContainer = (oldLayer: SurfaceContainer, newLayer: SurfaceContainer, viewer: Viewer): void  => {
    const surface = oldLayer.parentComponent as Surface;

    if (!surface) {
      return;
    }

    const index = surface.containers.indexOf(oldLayer);
    if (index !== -1) {
      surface.containers.removeAt(index);
      surface.containers.insertAt(index, newLayer);
    }

    if (viewer.userEditContainer === oldLayer) {
      viewer.userEditContainer = newLayer;
    }

    viewer.canvas.redraw();
  }

  return (
    <div className="main">
      <Header />
      <div className="body">
        <div className="simple-editor">
          <Preloader isActive={!isComponentLoaded}></Preloader>
          <au-simple-editor></au-simple-editor>
        </div>
      </div>
    </div>
  );
}

export default SimpleEditorWithPluginApi;