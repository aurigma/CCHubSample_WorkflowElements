import { CCHubConfiguration } from "./cchub-configuration.js";
import { ApiClientConfiguration, StorefrontUsersApiClient, StorefrontUserDto, ProjectsApiClient, CreateProjectByRenderHiResScenarioDto, RenderHiResScenarioOutputColorSpace, RenderHiResScenarioOutputFormat, RenderHiResScenarioOutputFlipMode, ProductReferencesApiClient, ProductsApiClient } from "@aurigma/axios-storefront-api-client";
import { CCHubAuth } from "./cchub-auth.js";
import { Logger } from "winston";

export class CCHubStorefrontApiService {

    private readonly config: CCHubConfiguration;
    private readonly authService: CCHubAuth;
    private readonly logger: Logger;

    constructor(config: CCHubConfiguration, authService: CCHubAuth, logger: Logger) {
        this.config = config;
        this.authService = authService;
        this.logger = logger;
    }

    /**
     * Gets a special API token which can be used from the frontend without exposing the full access token.
     * 
     * Refer https://customerscanvas.com/dev/backoffice/concepts/storefront-users.html for explanation. 
     * 
     * @param userId An ID of a user from your system.
     * @returns A token which can be used on a storefront (not the same as the OAuth2 access token!)
     */
    public async getStorefrontToken(userId: string) {
        const storefrontUsersApiClient = await this.initStorefrontUsersApiClient();

        const user = await this.getOrCreateStorefrontUser(userId, storefrontUsersApiClient);
        return storefrontUsersApiClient.getToken(user.userId ?? userId, this.config.storefrontId);
    }

    /**
     * Submits a "project" to Customer's Canvas to start print file rendering process.
     * 
     * See these articles for details:
     * https://customerscanvas.com/dev/backoffice/concepts/projects.html
     * https://customerscanvas.com/dev/backoffice/howto/processing-personalization-results.html
     * https://customerscanvas.com/dev/backoffice/howto/rendering-print-files.html 
     * https://customerscanvas.com/dev/backoffice/howto/download-artifacts.html
     * 
     * @param privateDesignId An ID of a design created by the user.
     * @param userId A user ID, the same as you used to create a storefront token.
     * @param orderId An order ID in your system this project is created for.
     * @returns A project DTO.
     */
    public async saveProjectInCCHub(privateDesignId: string, userId: string, orderId: string) {
        const projectsApiClient = await this.initProjectsApiClient();

        const createProjectDto: CreateProjectByRenderHiResScenarioDto = {
            ownerId: userId,
            name: "Project for Order #" + orderId,
            orderDetails: {
                orderId: orderId,
                customerId: userId,
                customerName: "Johnny Appleseed"
            },
            scenario: {
                designId: privateDesignId,
                anonymousAccess: true,
                colorSpace: RenderHiResScenarioOutputColorSpace.Cmyk,
                dpi: 300,
                flipMode: RenderHiResScenarioOutputFlipMode.None,
                format: RenderHiResScenarioOutputFormat.Pdf
            }
        };
        
        return await projectsApiClient.createByRenderHiResScenario(this.config.storefrontId, null, createProjectDto)
    }

    /**
     * Gets a list of products, potentially filtered by a tag.
     * 
     * @param tags An array of tags to filter products by. If not specified, all products are returned.
     * @returns A list of products.
    */   
    public async getProducts(tags?: string[]) {
        const productsApiClient = await this.initProductsApiClient();

        return await productsApiClient.getAllProducts(
            null, // skip
            null, // take
            null, // sort 
            null, // search 
            null, // sku
            tags, //tags
            null,  // custom fields
        );
    }

    /**
     * Get storefront user registered in Customer's Canvas based on ID from your system. Creates
     * a user if it does not exist in Customer's Canvas yet.
     * 
     * Refer https://customerscanvas.com/dev/backoffice/howto/register-customers.html?tabs=js for details.
     *  
     * @param userId An ID of a user from your system.
     * @param storefrontUsersApiClient An API client.
     * @returns A user DTO.
     */
    private async getOrCreateStorefrontUser(userId: string, storefrontUsersApiClient: StorefrontUsersApiClient) {
        try {
            this.logger.debug("Entered CCHubStorefrontApiService.getOrCreateStorefrontUser. userId: %s, storefrontId: %d", userId, this.config.storefrontId);
            const user = await storefrontUsersApiClient.get(userId, this.config.storefrontId);
            this.logger.debug("User %s was found (isAnonymous=%s). Tenant=%d, Storefront=%d", user.userId, user.isAnonymous, user.tenantId, user.storefrontId );
            return user;
        }
        catch (e) {
            const createUserDto = { isAnonymous: true, storefrontUserId: userId };
            this.logger.debug("No user with this id found. Trying to create it", e);
            return await storefrontUsersApiClient.create(this.config.storefrontId, null, createUserDto);
        }
    }

    /**
     * Initializes the API Client for StorefrontUsers. 
     * 
     * Refer readme.MD in the @aurigma/axios-storefront-api-client package (e.g. in node_modules).
     * 
     * @returns API client for StorefrontUsers controller.
     */
    private async initStorefrontUsersApiClient(): Promise<StorefrontUsersApiClient> {
        const apiClientConfig = await this.initApiClientConfiguration();
        
        return new StorefrontUsersApiClient(apiClientConfig);
    }

        /**
     * Initializes the API Client for ProjectsApiClient. 
     * 
     * Refer readme.MD in the @aurigma/axios-storefront-api-client package (e.g. in node_modules).
     * 
     * @returns API client for StorefrontUsers controller.
     */
        private async initProjectsApiClient(): Promise<ProjectsApiClient> {
            const apiClientConfig = await this.initApiClientConfiguration("Projects_full Private_assets_full");
            
            return new ProjectsApiClient(apiClientConfig);
        }
    
    /**
     * Initializes API Client configuration. 
     * 
     * @param scope  Access token scope (i.e. permissions). 
     * @returns An API Configuration object which can be used to init API Clients for all controllers.
     */
    private async initApiClientConfiguration(scope?: string) {
        const accessToken = await this.authService.getAccessToken(scope);

        const apiClientConfig = new ApiClientConfiguration();
        apiClientConfig.setAuthorizationToken(accessToken);
        apiClientConfig.apiUrl = this.config.apiUrl;

        return apiClientConfig;
    }

    /**
     * Initializes the API Client for ProductReferenceApiClient. 
     * 
     * Refer readme.MD in the @aurigma/axios-storefront-api-client package (e.g. in node_modules).
     * 
     * @returns API client for StorefrontUsers controller.
     */
    private async initProductReferenceApiClient(): Promise<ProductReferencesApiClient> {
        const apiClientConfig = await this.initApiClientConfiguration("Templates_read");

        return new ProductReferencesApiClient(apiClientConfig);
    }

    /**
     * Initializes the API Client for Product. 
     * 
     * Refer readme.MD in the @aurigma/axios-storefront-api-client package (e.g. in node_modules).
     * 
     * @returns API client for StorefrontUsers controller.
     */
    private async initProductsApiClient(): Promise<ProductsApiClient> {
        const apiClientConfig = await this.initApiClientConfiguration("Templates_read");

        return new ProductsApiClient(apiClientConfig);
    }


}