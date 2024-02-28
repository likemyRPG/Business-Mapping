import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NavbarComponent} from './navbar/navbar.component';
import {SidebarComponent} from "./sidebar/sidebar.component";
import {SafeHtmlPipe} from './safe-html.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, SafeHtmlPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Business Mapping Client';
}
