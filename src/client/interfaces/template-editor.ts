export interface IImageResolution {
    /**
     * Design atoms model Item
     * https://customerscanvas.com/dev/editors/design-atoms-js/reference/design-atoms-model/item.html#_aurigma_design_atoms_model_Item_class
     */
    item: any;
    resolution: number;
    qualityState: "None" | "Good" | "Warning" | "Bad";
  }