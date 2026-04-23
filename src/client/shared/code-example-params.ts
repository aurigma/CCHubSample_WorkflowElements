import { CodeExampleConfig } from "../interfaces/server-api";

export const getStringParam = (codeExample: CodeExampleConfig, name: string): string => {
    const value = codeExample.params[name];

    if (typeof value !== "string" || !value) {
        throw new Error(`${codeExample.name} code example requires ${name} param.`);
    }

    return value;
};

export const getNumberParam = (codeExample: CodeExampleConfig, name: string): number => {
    const value = codeExample.params[name];

    if (typeof value !== "number") {
        throw new Error(`${codeExample.name} code example requires ${name} param.`);
    }

    return value;
};

export const getStringArrayParam = (codeExample: CodeExampleConfig, name: string): string[] => {
    const value = codeExample.params[name];

    if (!Array.isArray(value) || value.some(item => typeof item !== "string")) {
        throw new Error(`${codeExample.name} code example requires ${name} param.`);
    }

    return value;
};
