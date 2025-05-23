import { useCallback, useEffect, useState } from "react";
import { loadWorkflowElement } from "../shared/asset-loaders.js";
import { ServerApiService } from "../shared/server-api-service.js";
import { getWorkflowElementUrl, WorkflowElementType } from "../shared/urls.js";
import "./TemplateEditor.scss";
import Logo from "../components/logo/Logo.js";
import { IImageDpiInfo } from "../interfaces/template-editor.js";

const TemplateEditor = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [editor, setEditor] = useState<any>(null);
  const [saveIsDisabled, setSaveIsDisabled] = useState<boolean>(false);
  const userId = "testUserId42";

  useEffect(() => {
    (async () => {
      // In this sample we illustrate how to load Template Editor dynamically.
      //
      // Technically, you can just add scripts and styles statically. However, the following
      // considerations should be taken into account:
      // - Having multiple instances of Template Editor on one page may be a problem. That's why a cleanup is recommended.
      // - You may want using different editors for different products, that's why you may want dynamically determine
      // which script to load.
      const [style, script] = await loadWorkflowElement(
        getWorkflowElementUrl(WorkflowElementType.TemplateEditor)
      );

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
        // Before you load the editor, you need to capture
        // a Storefront User Token so that Handy Editor were
        // able to communicate to Customer's Canvas API
        const [token, productInfo] =
          await ServerApiService.getStartPersonalizationData(userId);

        // To load the editor, you need to call the `init` method where you pass:
        // - Some integration settings, including tenant info, user info, etc.
        // - Input information, such as a public design ID (i.e. a template you want to modify)
        // - Settings (config) and resources (additional data)
        const templateEditor = document.querySelector(
          "au-template-editor"
        ) as any;
        setEditor(templateEditor);

        templateEditor?.init({
          configVersion: 2,
          integration: initIntegrationData(
            productInfo.tenantId,
            productInfo.storefrontId,
            userId,
            token,
            productInfo.cchubApiGatewayUrl
          ),
          input: {
            designTemplateId: ServerApiService.getTemplateEditorPublicDesign(),
          },
          //  See https://customerscanvas.com/dev/backoffice/workflow-elements/template-editor/settings.html
          settings: {
            toolbar: {
              qrCode: { enabled: false },
              barcode: { enabled: false },
            },
            pages: {
              list: {
                createOrRemove: { enabled: false },
                changeOrder: { enabled: false },
              },
              properties: {
                areas: { readonly: true },
                background: { readonly: true },
                pageProperties: { readonly: true },
              },
            },
            editorSettings: { enabled: false },
            itemBuilder: {
              rectangle: {
                fillColor: "rgb(255, 100, 13)",
              },
            },
          },
          // See https://customerscanvas.com/dev/backoffice/workflow-elements/template-editor/resources.html
          resources: {
            imageManager: {
              // sourceFolders: ["/Image Library/Images", "/Links"]
            },
            fonts: {
              // sourceFolders: ["/Avenir", "/Raleway"],
              // defaultFont: "Roboto Regular",
            },
          },
        });

        templateEditor?.addEventListener("change", () => {
          const dpiInfo = templateEditor.getImagesDpiInfo();
          const saveIsDisabled = !!dpiInfo.find(
            (info: IImageDpiInfo) => info.qualityState === "Bad"
          );
          setSaveIsDisabled(saveIsDisabled);
        });
      })();
    }
  }, [isScriptLoaded, setSaveIsDisabled]);

  const initIntegrationData = (
    tenantId: number,
    storefrontId: number,
    userId: string,
    storefrontUserToken: string,
    cchubApiGatewayUrl: string
  ) => ({
    tenantId,
    user: {
      id: userId,
      token: storefrontUserToken,
    },
    storefrontId,
    cchubApiGatewayUrl,
  });

  /**
   * Click handler function for custom save button
   */
  const saveDesign = useCallback(async () => {
    const serializedDesignModel = editor.getSerializedDesignModel();
    try {
      // This code sets the destination design ID the same as the source
      // design ID. This way the design will be overwritten.
      // If you would like to create a copy instead of overwriting,
      // generate new GUID or another unique name.
      const destinationDesignId =
        ServerApiService.getTemplateEditorPublicDesign();
      await ServerApiService.savePublicDesign(
        destinationDesignId,
        serializedDesignModel
      );
      alert("Design successfully saved!");
    } catch (error) {
      alert("Error saving design!");
    }
  }, [editor]);

  return (
    <au-template-editor>
      <div head-buttons="true">
        <button
          className="save-button"
          disabled={saveIsDisabled}
          onClick={saveDesign}
        >
          Save
        </button>
      </div>
      <div head-logo="true">
        <Logo />
      </div>
    </au-template-editor>
  );
};

export default TemplateEditor;
