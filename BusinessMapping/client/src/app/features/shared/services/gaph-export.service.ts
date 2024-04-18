import { Injectable } from '@angular/core';

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
}
