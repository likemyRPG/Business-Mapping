import { Injectable } from '@angular/core';
import {NavItem} from "../models/NavItem";

@Injectable({
  providedIn: 'root'
})
export class NavService {

  constructor() { }

  getNavItems(): NavItem[] {
    return [
      {
        iconPath: 'https://cdn-icons-png.flaticon.com/512/1828/1828791.png',
        label: 'Dashboard',
        route: '/',
      },
      {
        iconPath: 'https://cdn-icons-png.flaticon.com/512/3126/3126647.png',
        label: 'Customers',
        route: '/customers',
      },
      // Add more items as needed
    ];
  }
}
