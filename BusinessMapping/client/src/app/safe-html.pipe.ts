import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true // Marking the pipe as standalone
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {
  }

  transform(value: any) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
