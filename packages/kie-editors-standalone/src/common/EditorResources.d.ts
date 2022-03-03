export interface JsResource {
  path: string;
  content: string;
}
export interface CssResource {
  path: string;
  content: string;
}
export interface FontSource {
  mimeType: string;
  content: string;
  format: string;
}
export interface FontResource {
  family: string;
  sources: FontSource[];
  additionalStyle?: string;
}
export interface ReferencedResource {
  path: string;
  prefix?: string;
  suffix?: string;
}
export interface EditorResources {
  envelopeJsResource: JsResource;
  baseJsResources: JsResource[];
  referencedJsResources: JsResource[];
  baseCssResources: CssResource[];
  referencedCssResources: CssResource[];
  fontResources: FontResource[];
}
export interface FontSourceTypeAttributes {
  mimeType: string;
  format: string;
}
export declare const FONT_ATTRIBUTES: Map<string, FontSourceTypeAttributes>;
export declare abstract class BaseEditorResources {
  abstract get(args: { resourcesPathPrefix: string }): EditorResources;
  abstract getReferencedJSPaths(resourcesPathPrefix: string, gwtModuleName: string): ReferencedResource[];
  abstract getReferencedCSSPaths(resourcesPathPrefix: string, gwtModuleName: string): ReferencedResource[];
  abstract getFontResources(resourcesPathPrefix: string, gwtModuleName: string): FontResource[];
  abstract getEditorResourcesPath(): string;
  abstract getTemplatePath(): string;
  abstract getHtmlOutputPath(): string;
  createResource(
    resource: ReferencedResource,
    escapeCharacters?: string[]
  ): {
    path: string;
    content: string;
  };
  createFontSource(path: string): {
    mimeType: string;
    content: string;
    format: string;
  };
  getBase64FromFile(path: string): string;
}
//# sourceMappingURL=EditorResources.d.ts.map
