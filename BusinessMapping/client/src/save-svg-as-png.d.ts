declare module 'save-svg-as-png' {
    export function svgAsPngUri(
      el: SVGElement,
      options?: { scale?: number, encoderOptions?: number }
    ): Promise<string>;
  
    export function saveSvgAsPng(
      el: SVGElement,
      name: string,
      options?: { scale?: number, encoderOptions?: number }
    ): void;
  }
  