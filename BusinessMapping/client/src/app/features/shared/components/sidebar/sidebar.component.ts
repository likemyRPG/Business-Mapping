import {Component, OnInit} from '@angular/core';
import {NgForOf} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {SafeHtmlPipe} from "../../../../safe-html.pipe";
import {NavItem} from "../../models/NavItem";
import {NavService} from "../../services/nav.service";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgForOf,
    RouterLink,
    RouterLinkActive,
    SafeHtmlPipe
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  navItems: NavItem[] = [];

  constructor(private navService: NavService) {}

  ngOnInit(): void {
    this.navItems = this.navService.getNavItems();
  }
}
