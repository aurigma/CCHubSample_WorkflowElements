// Example of SimpleEditor settings.
export const simpleEditorBasicSampleSettings = {
    pageSelector: {
        enabled: true,
    },
    options: {
        disableUnavailable: true,
    },
    designVariants: {
        type: "List",
        showLessModeEnabled: true,
        showValueInTitle: true,
        showLessModeRows: 3,
    },
    proof: {
        downloadButtonEnabled: true,
        openInNewTab: true,
        proofRenderingConfig: {
            format: "Pdf",
            width: 2000,
            height: 2000,
            watermarkEnabled: true,
            watermarkOpacity: 1,
        },
    },
    validations: {
        approvalCheckboxEnabled: true,
        ignoringFormValidationEnabled: true,
        approvalWarningModeEnabled: false,
    },
    productDetails: {
        priceVisible: false,
        skuVisible: true,
    },
    designViewer: {
        surfaceShadowEnabled: false,
        previewMode: true,
    },
}


// Example of HandyEditor settings.
export const handyEditorBasicSampleSettings = {
    assetLibrary: {
        text: {
            enabled: true
        },
        shapes: {
            enabled: true
        },
        images: {
            enabled: true
        },
        cliparts: {
            enabled: false
        },
        imageUploader: {
            enabled: true
        },
        templates: {
            enabled: false
        },
        productOptions: {
            enabled: false
        }
    },
    designViewer: {
        grid: {
            step: 10,
            gridEnabled: false
        }
    },
    imageUploader: {
        insertByDefaultAs: "Auto",
        insertFileAs: {
            svg: "Shape",
            pdf: "Clipart",
            png: "Image",
            jpeg: "Image"
        }
    },
    itemValidation: {
        qualityMeter: {
            targetResolution: 300,
            bad: 50,
            warning: 80
        }
    },
    leaveConfirmation: {
        enabled: false
    }
}

// Example of HandyEditor resources.
export const handyEditorBasicSampleResources = {
    "assetLibrary": {
        "clipartsFolder": "/Image Library/Clipart",
        "imagesFolder": "/"
    }    
}
