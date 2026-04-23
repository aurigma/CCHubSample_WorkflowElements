import { useCallback, useEffect, useState } from "react";
import { loadWorkflowElement } from "../shared/asset-loaders.js";
import { ServerApiService } from "../shared/server-api-service.js";
import { getWorkflowElementUrl, WorkflowElementType } from "../shared/urls.js";
import "./TemplateEditor.scss";
import Logo from "../components/logo/Logo.js";
import { IImageResolution } from "../interfaces/template-editor.js";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import CodeExampleBreadcrumb from "../components/breadcrumb/breadcrumb.js";
import Preloader from "../components/preloader/Preloader.js";
import { CodeExamplePageProps } from "../interfaces/server-api.js";
import { getStringParam } from "../shared/code-example-params.js";
import { getErrorMessage } from "../shared/errors.js";

const TemplateEditor = ({ codeExample }: CodeExamplePageProps) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isComponentLoaded, setIsComponentLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [editor, setEditor] = useState<any>(null);
  const [saveIsDisabled, setSaveIsDisabled] = useState<boolean>(false);
  const userId = "testUserId42";

  useEffect(() => {
    (async () => {
      try {
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
      } catch (error) {
        if (!isComponentLoaded) {
          setLoadingError(getErrorMessage(error));
        }
      }
    })();
  }, []);

  useEffect(() => {
    // You may load Handy Editor only once its script is ready.
    if (isScriptLoaded) {
      (async () => {
        try {
          const publicDesignId = getStringParam(codeExample, "publicDesignId");

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
              designTemplateId: publicDesignId,
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

          templateEditor?.addEventListener("load", () => {
            setIsComponentLoaded(true);
          });

          templateEditor?.addEventListener("error", (e: any) => {
            console.log("Template Editor error", e);
            if (!isComponentLoaded) {
              setLoadingError("Something went wrong while loading the editor. Please, check dev console for details.");
            }
          });

          templateEditor?.addEventListener("change", () => {
            const resolutionCheckResults: IImageResolution[] =
              templateEditor.getImagesResolution();
            const hasBadCheckResult = resolutionCheckResults
              .map((checkResult) => checkResult.qualityState)
              .includes("Bad");
            setSaveIsDisabled(hasBadCheckResult);
          });
        } catch (error) {
          if (!isComponentLoaded) {
            setLoadingError(getErrorMessage(error));
          }
        }
      })();
    }
  }, [isScriptLoaded, codeExample, setSaveIsDisabled]);

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
      const publicDesignId = getStringParam(codeExample, "publicDesignId");
      const destinationDesignId = publicDesignId;
      await ServerApiService.savePublicDesign(
        destinationDesignId,
        serializedDesignModel
      );
      alert("Design successfully saved!");
    } catch (error) {
      alert("Error saving design!");
    }
  }, [editor, codeExample]);

  return (
    <>
      <Container fluid>
        <Preloader isActive={!isComponentLoaded || !!loadingError} isError={!!loadingError} errorMessage={loadingError ?? undefined}></Preloader>
        <au-template-editor>
    
          <div head-buttons="true">
            <Button
              disabled={saveIsDisabled}
              onClick={saveDesign}>Save
            </Button>
          </div>
          <div head-logo="true">
            <CodeExampleBreadcrumb codeExample={codeExample} />
          </div>
        </au-template-editor>
      </Container>
    </>
  );
};

export default TemplateEditor;
