import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SidebarComponent} from "./features/shared/components/sidebar/sidebar.component";
import {SafeHtmlPipe} from './safe-html.pipe';
import {LoadingComponent} from "./features/shared/components/loading/loading.component";
import {NgIf} from "@angular/common";
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, SafeHtmlPipe, LoadingComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Business Mapping Client';
}
