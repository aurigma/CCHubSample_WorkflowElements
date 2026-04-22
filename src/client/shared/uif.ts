import { PersonalizationParametersDto } from "@aurigma/axios-storefront-api-client";

export const getECommerceDriver = async (baseUrl: string) => {
  const driver = await import(/* @vite-ignore */`${baseUrl}/drivers/default-driver.js`);
  return driver.ecommerceDriver;
};

export const getEditor = async (baseUrl: string) => {
  const editor = await import(/* @vite-ignore */`${baseUrl}/editor.js`);
  return editor.default.default;
};

export const getPluginSettings = (
  personalizationParams: PersonalizationParametersDto
) => {
  return {
    customersCanvasBaseUrl: personalizationParams.designEditorUrl,
    preflightToolUrl: personalizationParams.preflightUrl,
    dynamicImageUrl: personalizationParams.dynamicImageUrl,
    useBackOffice: true,
  };
};

export const getUserData = (id: string, token: string) => {
  return { id, tokenId: token, data: {} };
};

export const getBackOfficeSettings = (
  personalizationParams: PersonalizationParametersDto,
  token: string
) => {
  return {
    storefrontId: import.meta.env["VITE_CCHUB_STOREFRONTID"],
    apiGatewayUrl: personalizationParams.apiGatewayUrl,
    backOfficeUrl: import.meta.env["VITE_CCHUB_BASEURL"],
    assetProcessorUrl: personalizationParams.apiGatewayUrl,
    assetStorageUrl: personalizationParams.apiGatewayUrl,
    designAtomsApiUrl: personalizationParams.apiGatewayUrl,
    tenantId: import.meta.env["VITE_CCHUB_TENANTID"],
    token,
    externalProductId: "",
    integrationType: 2, // See IntegrationType.OptionBasedProduct
    optionBasedProductInfo: {
      productId: personalizationParams.id,
      productVersionId: personalizationParams.versionId,
    },
    ecommerceSystemType: 0, // See EcommerceSystemType.Custom
  };
};
