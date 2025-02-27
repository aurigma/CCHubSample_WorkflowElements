export class CCHubConfiguration {
    public readonly baseUrl: string;
    public readonly apiUrl: string;
    public readonly storefrontId: number;
    public readonly clientId: string;
    public readonly clientSecret: string;
    public readonly tenantId: number;
    public readonly productId: number;


    constructor() {
        this.baseUrl = process.env["CCHUB_BASEURL"] ?? "https://customerscanvashub.com";
        this.apiUrl = this.baseUrl.replace("://", "://api.");
        this.storefrontId = Number(process.env["CCHUB_STOREFRONTID"]);
        this.clientId = process.env["CCHUB_CLIENTID"] ?? "";
        this.clientSecret = process.env["CCHUB_CLIENTSECRET"] ?? "";
        this.tenantId = Number(process.env["CCHUB_TENANTID"]);
        this.productId = Number(process.env["CCHUB_PRODUCTID"]);
    }
}