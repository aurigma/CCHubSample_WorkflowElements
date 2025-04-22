import { CCHubConfiguration } from "./cchub-configuration.js";
import { ApiClientConfiguration, DesignAtomsServiceApiClient, SetEditorMockupsModel, DesignAtomsPrintProductApiClient } from "@aurigma/axios-design-atoms-api-client";
import { CCHubAuth } from "./cchub-auth.js";

export class CCHubDesignAtomsApiService {

    private readonly config: CCHubConfiguration;
    private readonly authService: CCHubAuth;

    constructor(config: CCHubConfiguration, authService: CCHubAuth) {
        this.config = config;
        this.authService = authService;
    }

    /**
     * Combines a specified design with editor mockups.
     * 
     * @param privateDesignId A private design where you want to add mockups.
     * @param publicMockupIds A list of mockups to merge with the design. If the list is empty, no merge occurs. Also, don't specify more mockups than surfaces you have in a design.
     * @param storefrontUserId A user who owns the private design.
     */
    public async mergeDesignWithMockups(privateDesignId: string, publicMockupIds: string[], storefrontUserId: string) {
        const apiClient = await this.initDesignAtomsServiceApiClient();

        const editorMockupsModel = publicMockupIds.map((mockupId, i) => ({ mockupId, surfaceIndex: i }))

        if (editorMockupsModel.length > 0) {
            await apiClient.setEditorMockups(
                privateDesignId,
                storefrontUserId,
                undefined,
                {
                    editorMockupBindings: editorMockupsModel
                } as SetEditorMockupsModel);    
        }
    }

    /**
     * Saves changes into public design
     * 
     * @param designId - Public design id
     * @param designJson - Object of serialized design model
     */
    public async savePublicDesign(designId: string, serializedDesignModel: string): Promise<void> {
        const apiClient = await this.initDesignAtomsPrintProductApiClient("Assets_full");

        return apiClient.updateDesignProductModel(designId, null, undefined, serializedDesignModel);
    }

    /**
     * Initializes the API Client for DesignAtomsApi service.
     * 
     * @param scope Access token scope (i.e. permissions). 
     * @returns API client for DesignAtomsPrintProduct controller
     */
    private async initDesignAtomsPrintProductApiClient(scope: string): Promise<DesignAtomsPrintProductApiClient> {
        const configuration = await this.initApiClientConfiguration(scope);

        return new DesignAtomsPrintProductApiClient(configuration);
    }

    /**
     * Initializes the API Client for DesignAtomsApi service. 
     * 
     * Refer readme.MD in the @aurigma/axios-storefront-api-client package (e.g. in node_modules).
     * 
     * @returns API client for StorefrontUsers controller.
     */
    private async initDesignAtomsServiceApiClient(): Promise<DesignAtomsServiceApiClient> {
        const apiClientConfig = await this.initApiClientConfiguration("Assets_read Private_assets_full");
        
        return new DesignAtomsServiceApiClient(apiClientConfig);
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