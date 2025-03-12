import { CCHubConfiguration } from "./cchub-configuration.js";
import { ApiClientConfiguration, PrivateDesignProcessorApiClient } from "@aurigma/axios-asset-processor-api-client";
import { CCHubAuth } from "./cchub-auth.js";

export class CCHubAssetProcessorService {

    private readonly config: CCHubConfiguration;
    private readonly authService: CCHubAuth;

    constructor(config: CCHubConfiguration, authService: CCHubAuth) {
        this.config = config;
        this.authService = authService;
    }

    /**
     * Creates a private copy (belonging to a specific user) of a public design template.
     * 
     * @param publicDesignId A design template ID that you would like to get a private copy for.
     * @param userId A user ID who will own the copy.
     * @returns The private design ID copied from the public template and assigned to a specified userId.
     */
    public async createPrivateCopyFromPublicDesignTemplate(publicDesignId: string, userId: string): Promise<string> {
        const apiClient = await this.initPrivateDesignProcessorApiClient();
        const result = await apiClient.copyDesignFromPublicDesign(undefined, userId, { publicDesignId });
        return result.id!;
    }

    /**
     * Initializes the API Client for PrivateDesignProcessorApiClient. 
     * 
     * Refer readme.MD in the @aurigma/axios-storefront-api-client package (e.g. in node_modules).
     * 
     * @returns API client for PrivateDesignProcessorApiClient controller.
     */
    private async initPrivateDesignProcessorApiClient(): Promise<PrivateDesignProcessorApiClient> {
        const apiClientConfig = await this.initApiClientConfiguration("Assets_read Private_assets_full");

        return new PrivateDesignProcessorApiClient(apiClientConfig);
    }

    /**
     * Initializes API Client configuration. 
     * 
     * @param scope  Access token scope (i.e. permissions). 
     * @returns An API Configuration object which can be used to init API Clients for all controllers.
     */
    private async initApiClientConfiguration(scope: string) {
        const accessToken = await this.authService.getAccessToken(scope);

        const apiClientConfig = new ApiClientConfiguration();
        apiClientConfig.setAuthorizationToken(accessToken);
        apiClientConfig.apiUrl = this.config.apiUrl;

        return apiClientConfig;
    }
}