import axios, { AxiosResponse } from "axios";
import { GetProductInfoOutput, PrepareDesignTemplate, SaveProjectInput } from "../interfaces/server-api";
import { PagedOfProductDto, ProjectDto } from "@aurigma/axios-storefront-api-client";


export const getProductList = async (): Promise<PagedOfProductDto> => {
    const response = await axios.get("/api/products", {});
    return response.data;
}

export class ServerApiService {

    static getStartPersonalizationData = (userId: string) => Promise.all([
        ServerApiService.getToken(userId),
        ServerApiService.getProductInfo()
    ]);

    static getToken = async (userId: string): Promise<string> => {
        const response: AxiosResponse<{ storefrontUserToken: string }> = await axios.get(`/api/get-token/${userId}`);
        const token = response?.data?.storefrontUserToken;
        return token;
    };

    static getTemplateEditorPublicDesign = () => import.meta.env["VITE_TEMPLATEEDITOR_CCHUB_PUBLICDESIGNID"]; 

    static getProductInfo = async (): Promise<GetProductInfoOutput> => {
        const response: AxiosResponse<GetProductInfoOutput> = await axios.get(`/api/get-product-info/`);
        response.data.productId = import.meta.env["VITE_BASICSAMPLE_CCHUB_PRODUCTID"]; 
        
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
}