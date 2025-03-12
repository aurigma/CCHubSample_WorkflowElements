import axios, { AxiosResponse } from "axios";
import { CCHubConfiguration } from "./cchub-configuration.js";

interface AuthClientGrantResponse {
    access_token: string,
    expires_in: number,
    token_type: string,
    scope: string
}

interface AuthClientGrantBody {
    client_id: string,
    client_secret: string,
    grant_type: "client_credentials" | "authorization_code" | "refresh_token",
    scope?: string,
    code?: string,
    code_verifier?: string,
    redirect_uri?: string,
    refresh_token?: string
}

export class CCHubAuth {

    private config: CCHubConfiguration;
    private token: string | null;

    constructor(config: CCHubConfiguration) {
        this.config = config;
        this.token = null;
    }

    /**
      * Returns the access token. During the first call a new token is request, otherwise a cached version is used.   
      * 
      * Refer [Auth docs](https://customerscanvas.com/dev/backoffice/auth.html#requesting-an-access-token-for-the-client-credentials-flow) for details. 
      * 
      * @param scope Access token scope (i.e. permissions). If omitted, retrieves the token for max allowed permissions. Refer Discovery document for available values (see the Auth article).
      * @returns An access token for a specific Client Credentials configured in Customer's Canvas.
      */
    public async getAccessToken(scope?: string): Promise<string> {
        if (this.token == null) {
            this.token = (await this.requestAccessToken(scope)).access_token;
        } 

        return this.token;
    }

    /**
     * Receives Customer's Canvas access token through OAuth2 Client Credentials flow.
     * 
     * @param scope Access token scope (i.e. permissions). If omitted, retrieves the token for max allowed permissions. Refer Discovery document for available values (see the Auth article).
     * @returns 
     */
    private async requestAccessToken(scope?: string): Promise<AuthClientGrantResponse> {
        const authUrl = `${this.config.baseUrl}/connect/token`;

        try {
            const response: AxiosResponse<AuthClientGrantResponse> = await axios.post(
                authUrl,
                this.buildClientCredentialsAuthRequestBody(scope),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            return response.data;

        } catch (e) {
            throw new Error(`Failed to authenticate. Server responded - ${e}`);
        }

    }

    /**
     * Prepares a request body for the /connect/token endpoint for Client Credentials flow. 
     * 
     * @param scope Access token scope (i.e. permissions). If omitted, retrieves the token for max allowed permissions. Refer Discovery document for available values (see the Auth article).
     * @returns 
     */
    private buildClientCredentialsAuthRequestBody(scope?: string): AuthClientGrantBody {
        const body: AuthClientGrantBody = {
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            grant_type: "client_credentials"
        };

        if (scope != null) {
            body.scope = scope;
        } 

        return body;
    }
}