import {Component} from '@angular/core';
import {RouterModule, RouterOutlet} from '@angular/router';
import {SidebarComponent} from "./features/shared/components/sidebar/sidebar.component";
import {SafeHtmlPipe} from './safe-html.pipe';
import {LoadingComponent} from "./features/shared/components/loading/loading.component";
import {CommonModule, NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, SafeHtmlPipe, LoadingComponent, NgIf, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Business Mapping Client';
}
