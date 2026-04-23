export interface SaveProjectInput {
    privateDesignId: string, 
    userId: string, 
    orderId: string 
}

export interface CodeExampleConfig {
    name: string,
    description: string,
    path: string,
    enabled: boolean,
    params: Record<string, unknown>
}

export interface CodeExamplePageProps {
    codeExample: CodeExampleConfig
}

export interface GetProductInfoOutput {
    tenantId: number,
    cchubApiGatewayUrl: string,
    storefrontId: number
}

export interface PrepareDesignTemplate {
    privateDesignId: string 
}
