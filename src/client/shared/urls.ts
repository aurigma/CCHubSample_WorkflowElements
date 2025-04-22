export enum WorkflowElementType {
    SimpleEditor = "simple-editor",
    HandyEditor = "handy-editor",
    TemplateEditor = "template-editor"
};

export const getWorkflowElementUrl = (type: WorkflowElementType) =>
    `https://staticjs-aurigma.azureedge.net/libs/${import.meta.env["VITE_CCHUB_ENVIRONMENT"]}/workflow-elements/${type}`;