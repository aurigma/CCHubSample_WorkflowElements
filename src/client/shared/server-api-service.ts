import axios, { AxiosResponse } from "axios";
import { CodeExampleConfig, GetProductInfoOutput, PrepareDesignTemplate, SaveProjectInput } from "../interfaces/server-api";
import { PagedOfProductDto, PersonalizationParametersDto, ProjectDto } from "@aurigma/axios-storefront-api-client";


export const getProductList = async (): Promise<PagedOfProductDto> => {
    const response = await axios.get("/api/products", {});
    return response.data;
}

export class ServerApiService {

    static getCodeExamples = async (): Promise<CodeExampleConfig[]> => {
        const response: AxiosResponse<CodeExampleConfig[]> = await axios.get("/api/code-examples");
        return response?.data;
    };

    static getStartPersonalizationData = (userId: string) => Promise.all([
        ServerApiService.getToken(userId),
        ServerApiService.getProductInfo()
    ]);

    static getToken = async (userId: string): Promise<string> => {
        const response: AxiosResponse<{ storefrontUserToken: string }> = await axios.get(`/api/get-token/${userId}`);
        const token = response?.data?.storefrontUserToken;
        return token;
    };

    static getProductInfo = async (): Promise<GetProductInfoOutput> => {
        const response: AxiosResponse<GetProductInfoOutput> = await axios.get(`/api/get-product-info/`);
        return response?.data;
    };

    static savePublicDesign = async (id: string, serializedDesignModel: object): Promise<ProjectDto> => {
        return axios.post("/api/save-public-design", {
            serializedDesignModel,
            id,
          });
    }

    static saveProject = async (body: SaveProjectInput): Promise<ProjectDto> => {
        const response: AxiosResponse<ProjectDto> = await axios.post("/api/save-project/", body);
        return response?.data;
    }

    static prepareDesignTemplate = async (userId: string, publicDesignId: string, mockupIds: string[]): Promise<PrepareDesignTemplate> => {
        const body = {
            userId,
            publicDesignId,
            mockupIds
        };
        const response: AxiosResponse<PrepareDesignTemplate> = await axios.post("/api/prepare-design-template/", body);
        return response?.data;
    }

    static getPersonalizationParameters = async (ref: string): Promise<PersonalizationParametersDto> => {
        const response = await axios.get(`/api/personalization-parameters/${ref}`);

        return response?.data;
    }
}
