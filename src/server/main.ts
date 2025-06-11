import express from "express";
import winston from "winston";
import ViteExpress from "vite-express";
import { CCHubConfiguration } from "./cchub-configuration.js";
import { CCHubAuth } from "./cchub-auth.js";
import { CCHubDesignAtomsApiService } from "./cchub-designatomsapi-service.js";
import { CCHubAssetProcessorService } from "./cchub-assetprocessor-service.js";
import { CCHubStorefrontApiService } from "./cchub-storefrontapi-service.js";
import { asyncHandler } from "./async-handler.js";
import { logEndpoint } from "./log-endpoint.js";

import dotenv from "dotenv";
dotenv.config();

const logger = winston.createLogger({
  level: process.env["APP_LOGLEVEL"] ?? "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    }),
    winston.format.errors({ stack: true })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

logger.info("Starting server...");

const port = Number(process.env["APP_PORT"]) || 3000;

const app = express();
app.use(express.json());

const config = new CCHubConfiguration();
const cchubAuth = new CCHubAuth(config, logger);
const cchubService = new CCHubStorefrontApiService(config, cchubAuth, logger);
const designAtomsService = new CCHubDesignAtomsApiService(config, cchubAuth);
const assetProcessorService = new CCHubAssetProcessorService(config, cchubAuth);

logger.info("Obtaining access token on startup...");
await cchubAuth.getAccessToken(); // obtain an access token beforehand with wide scope for simplicity
logger.info("Access token received successfully.");

app.get("/api/products", logEndpoint(logger), asyncHandler(async (req, res) => {
  const products = await cchubService.getProducts();
  res.json(products);
}));


app.get("/api/get-token/:userId", logEndpoint(logger), asyncHandler(async (req, res) => {
  const storefrontUserToken = await cchubService.getStorefrontToken(req.params.userId);

  res.json({
    storefrontUserToken
  });
}));

app.get("/api/get-product-info/", logEndpoint(logger), asyncHandler(async (req, res) => {
  
  res.json({
    tenantId: config.tenantId,
    cchubApiGatewayUrl: config.apiUrl,
    storefrontId: config.storefrontId
  });
}));

app.post("/api/prepare-design-template/", logEndpoint(logger), asyncHandler(async (req, res) => {
  const userId = req.body.userId;
  const publicDesignTemplateId = req.body.publicDesignId;
  const mockupIds = req.body.mockupIds;

  const privateDesignId = await assetProcessorService.createPrivateCopyFromPublicDesignTemplate(publicDesignTemplateId, userId);
  await designAtomsService.mergeDesignWithMockups(privateDesignId, mockupIds, userId);

  res.json({
    privateDesignId
  })
}))

app.post("/api/save-project/", logEndpoint(logger), asyncHandler(async (req, res) => {
  const { privateDesignId, userId, orderId } = req.body;

  const project = await cchubService.saveProjectInCCHub(privateDesignId, userId, orderId);
  
  res.json(project);
}));

app.post("/api/save-public-design/", logEndpoint(logger), asyncHandler(async (req, res) => {
  const { serializedDesignModel, id } = req.body;
  await designAtomsService.savePublicDesign(id, serializedDesignModel);
}));

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Unhandled error: %s\n-----\n%s\n-------", err.message, err.stack);
  res.status(500).json({ error: "Internal server error" });
});

ViteExpress.listen(app, port, () =>
  logger.info("Server is listening on port %d...", port),
);
