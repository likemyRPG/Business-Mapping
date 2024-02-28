import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SidebarComponent} from "./features/shared/components/sidebar/sidebar.component";
import {SafeHtmlPipe} from './safe-html.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, SafeHtmlPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Business Mapping Client';
}
