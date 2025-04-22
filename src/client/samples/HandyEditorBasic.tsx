import { useEffect, useState } from "react";
import { loadWorkflowElement } from "../shared/asset-loaders.js";
import { ServerApiService } from "../shared/server-api-service.js";
import { handyEditorBasicSampleSettings, handyEditorBasicSampleResources } from "../constants/configuration.js"
import { getWorkflowElementUrl, WorkflowElementType } from "../shared/urls.js";

const HandyEditorBasic = () => {

    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const userId = "testUserId42";
    const orderId = "42";

    useEffect(() => {

        (async () => {

            // In this sample we illustrate how to load Handy Editor dynamically. 
            //
            // Technically, you can just add scripts and styles statically. However, the following
            // considerations should be taken into account: 
            // - Having multiple instances of Handy Editor on one page may be a problem. That's why a cleanup is recommended.
            // - You may want using different editors for different products, that's why you may want dynamically determine 
            // which script to load. 
            const [style, script] = await loadWorkflowElement(getWorkflowElementUrl(WorkflowElementType.HandyEditor));

            setIsScriptLoaded(true);

            // Cleanup on component unmount
            return () => {
                document.head.removeChild(style);
                document.body.removeChild(script);
            };

        })();

    }, []);

    useEffect(() => {
        // You may load Handy Editor only once its script is ready.
        if (isScriptLoaded) {
            (async () => {

                // Before you load the editor, you need to capture some data from the backend:
                // - Get a Storefront User Token so that Handy Editor were able to communicate to Customer's Canvas API
                // - Get some Customer's Canvas related settings (can be hardcoded on the frontend)
                // - Get Customer's Canvas product ID. Some alternative ways to specify how to locate the data is available.
                //
                // Also, in a real-life code you may want to capture Handy Editor configuration for a specific product from
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
                const handyEditor = document.querySelector("au-handy-editor") as any;
                handyEditor?.init({
                    configVersion: 2,
                    integration: initIntegrationData(productInfo.tenantId, productInfo.storefrontId, userId, token, productInfo.cchubApiGatewayUrl),
                    input: {
                        productId: productInfo.productId,
                    },
                    settings: handyEditorBasicSampleSettings,
                    resources: handyEditorBasicSampleResources
                });

                // Event handlers


                /** Use the addtocart event to capture the output data from the editor 
                 * when the user clicks Add to cart.
                 * 
                 * In this example, we submit a project to Customer's Canvas to start rendering.
                 * In a real-life app you need to save this output temporary with a shopping cart line item,
                 * and create a project once the user successfully completes the checkout process.  
                 * */
                handyEditor?.addEventListener("addtocart", async (e: CustomEvent) => {
                    const editorOutput = e.detail as any;

                    const requestBody = {
                        privateDesignId: editorOutput.properties._stateId[0],
                        userId: editorOutput.properties._userId,
                        orderId: orderId // it is supposed to be taken from your system.
                    }

                    const project = await ServerApiService.saveProject(requestBody);
                    handyEditor.showLoader(false);
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

    return (
        <au-handy-editor></au-handy-editor>
    );
}

export default HandyEditorBasic;