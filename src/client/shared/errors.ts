export const getErrorMessage = (error: unknown, fallbackMessage = "Something went wrong while loading."): string => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (typeof error === "string" && error) {
        return error;
    }

    return fallbackMessage;
};
