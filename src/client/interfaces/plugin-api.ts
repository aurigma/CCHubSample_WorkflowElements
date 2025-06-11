import { SurfaceContainer, TextureContainer, SpotColorContainer, FullColorContainer, LimitedColorContainer, ColorLessContainer, CmykColor, Color, HsbColor, RgbColor, SpotColor, Swatch, Ink, GrayscaleColor, Palette } from "@aurigma/design-atoms-model"
import { PrintingTechniqueConstraints } from "@aurigma/design-atoms-model/Product/Constraints/PrintingTechniqueConstraints";
import { ColorContainerVisualization } from "@aurigma/design-atoms-model/Product/ContainerVisualization";

export interface DesignAtomsContainers {
    SurfaceContainer: typeof SurfaceContainer;
    TextureContainer: typeof TextureContainer;
    SpotColorContainer: typeof SpotColorContainer;
    FullColorContainer: typeof FullColorContainer;
    LimitedColorContainer: typeof LimitedColorContainer;
    ColorLessContainer: typeof ColorLessContainer;
    ColorContainerVisualization: typeof ColorContainerVisualization;
    PrintingTechniqueConstraints: typeof PrintingTechniqueConstraints;
}

export interface DesignAtomsColors {
    CmykColor: typeof CmykColor,
    Color: typeof Color,
    HsbColor: typeof HsbColor,
    RgbColor: typeof RgbColor,
    SpotColor: typeof SpotColor,
    Swatch: typeof Swatch,
    Ink: typeof Ink,
    GrayscaleColor: typeof GrayscaleColor,
    Palette: typeof Palette
}