import express from "express";
import ViteExpress from "vite-express";
import { CCHubConfiguration } from "./cchub-configuration.js";
import { CCHubAuth } from "./cchub-auth.js";
import { CCHubDesignAtomsApiService } from "./cchub-designatomsapi-service.js";
import { CCHubAssetProcessorService } from "./cchub-assetprocessor-service.js";
import { CCHubStorefrontApiService } from "./cchub-storefrontapi-service.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const config = new CCHubConfiguration();
const cchubAuth = new CCHubAuth(config);
const cchubService = new CCHubStorefrontApiService(config, cchubAuth);
const designAtomsService = new CCHubDesignAtomsApiService(config, cchubAuth);
const assetProcessorService = new CCHubAssetProcessorService(config, cchubAuth);

app.on("listening", async (_) => {
  await cchubAuth.getAccessToken(); // obtain an access token beforehand with wide scope for simplicity
})

app.get("/api/get-token/:userId", async (req, res) => {
  const storefrontUserToken = await cchubService.getStorefrontToken(req.params.userId);

  res.json({
    storefrontUserToken
  });
});

app.get("/api/get-product-info/", async (req, res) => {
  
  res.json({
    tenantId: config.tenantId,
    cchubApiGatewayUrl: config.apiUrl,
    storefrontId: config.storefrontId
  });
});

app.post("/api/prepare-design-template/", async (req, res) => {
  const userId = req.body.userId;
  const publicDesignTemplateId = req.body.publicDesignId;
  const mockupIds = req.body.mockupIds;

  const privateDesignId = await assetProcessorService.createPrivateCopyFromPublicDesignTemplate(publicDesignTemplateId, userId);
  await designAtomsService.mergeDesignWithMockups(privateDesignId, mockupIds, userId);

  res.json({
    privateDesignId
  })
})

app.post("/api/save-project/", async (req, res) => {
  const { privateDesignId, userId, orderId } = req.body;

  const project = await cchubService.saveProjectInCCHub(privateDesignId, userId, orderId);
  
  res.json(project);
});

app.post("/api/save-public-design/", async (req, res) => {
  const { serializedDesignModel, id } = req.body;
  
  try {
    await designAtomsService.savePublicDesign(id, serializedDesignModel);
  } catch (error) {
    res.status(500)
    res.send(error);
  } finally {
    res.end();
  }
})


ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
