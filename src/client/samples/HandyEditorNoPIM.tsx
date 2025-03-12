import { useEffect, useState } from "react";
import { loadWorkflowElement } from "../shared/asset-loaders.js";
import { ServerApiService } from "../shared/server-api-service.js";
import { handyEditorBasicSampleSettings, handyEditorBasicSampleResources } from "../constants/configuration.js"
import { getWorkflowElementUrl, WorkflowElementType } from "../shared/urls.js";

const HandyEditorNoPIM = () => {

    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const userId = "testUserId42";
    const orderId = "42";

    /*
        This demo illustrates the following use case. 
        
        You would like to let users personalize items in Handy Editor, but you would not like to use
        Customer's Canvas PIM module to manage products/options/variants and associate design templates and
        mockups there. Instead, you have our own app to handle that. We assume that you build your own admin UI
        to connect assets to the appropriate options and variants in your system. 

        Now you have a design template (publicDesignId) for the product template and one or more IDs for mockups.
        Before you load a design template to the editor, you need to merge it with a right design template as we will
        demonstrate further.

        Mockups are PSD files uploaded to Customer's Canvas (see [Mockups](https://customerscanvas.com/help/admin-guide/manage-assets/mockups/intro.html) section
        in the Admin Guide and [Mockups for PIM module](https://customerscanvas.com/help/designers-manual/mockups/pim-mockups/intro.html) in Designer's Manual). 

        Some of these files can be used to visualize the product inside the editor (Editor Mockups), others - on the Approval page. 
        They can be the same files or different depending on your needs (e.g. the Preview mockups can be isometric or include 
        more elements, while Editor Mockups should be flat and maximize the editing area size). 

        If you have a multi-surface design (e.g. a double-sided product), you may want to have different editor mockups
        for each side. In this case, you need to pass two IDs. 

        In this sample, these values are read from the .env file. To set multiple IDs, separate them by comma. 
        In a real-life app, you may want to grab it from your database. 
    */
    const publicDesignId = import.meta.env["VITE_NOPIMSAMPLE_CCHUB_PUBLICDESIGNID"];
    const editorMockupIds = import.meta.env["VITE_NOPIMSAMPLE_CCHUB_EDITORMOCKUPID"]?.split(",") ?? [];
    const previewMockupIds = import.meta.env["VITE_NOPIMSAMPLE_CCHUB_PREVIEWMOCKUPID"]?.split(",") ?? [];

    if (!publicDesignId) {
        console.error("No design template for this sample is specified. Ensure that you have set the VITE_NOPIMSAMPLE_CCHUB_PUBLICDESIGNID environment variable in the .env file!");
    }

    if (editorMockupIds.length == 0) {
        console.warn("No editor mockups are specified. The editor will load a template without a product visualization. If you expect to visualize a design on a mockup, ensure that you have specified the VITE_NOPIMSAMPLE_CCHUB_EDITORMOCKUPID environment variable in the .env file.");
    }

    useEffect(() => {

        (async () => {

            // In this sample we illustrate how to load Handy Editor dynamically. 
            //
            // Technically, you can just add scripts and styles statically. However, the following
            // considerations should be taken into account: 
            // - Having multiple instances of SE on one page may be a problem. That's why a cleanup is recommended.
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


                // Now we need to create a copy of a public template merged with a correct mockup. You can do it
                // with a couple of API calls (see the server part for details). In this sample we are doing it
                // on the fly, however, in a real-life sample, you may want to generate it beforehand for optimization
                // purposes.
                const { privateDesignId } = await ServerApiService.prepareDesignTemplate(userId, publicDesignId, editorMockupIds);

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
                        designId: privateDesignId,
                        previewMockupIds
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

export default HandyEditorNoPIM;