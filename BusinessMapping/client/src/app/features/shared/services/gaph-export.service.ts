import { Injectable } from '@angular/core';
import { svgAsPngUri } from 'save-svg-as-png';

@Injectable({
  providedIn: 'root'
})
export class GraphExportService {

  constructor() { }

  exportGraph(svgElement: SVGElement, fileName: string = 'graph.svg'): void {
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);

    const svgBlob = new Blob([source], {type: 'image/svg+xml;charset=utf-8'});
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  async exportGraphToImage(svgElement: SVGElement): Promise<any> {
    try {
      const uri = await svgAsPngUri(svgElement, { scale: 2 });
      return { src: uri, width: svgElement.clientWidth, height: svgElement.clientHeight };
    } catch (error) {
      console.error('Error exporting graph to image:', error);
      return null;
    }
  }
}
