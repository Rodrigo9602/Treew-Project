import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from './nav-item/nav-item.component';
import { NgOptimizedImage } from '@angular/common';
import { NavItemComponent } from './nav-item/nav-item.component';
import { SidebarService } from '../../services/components/sidebar.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, NgOptimizedImage, NavItemComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit{
  items: MenuItem[] | undefined;
  opened:boolean = false;

  constructor(private sidebar:SidebarService) {}

  ngOnInit(): void {
    this.items = [      
    ];

   this.sidebar.stateChange$.subscribe((navState) => {
      this.opened = navState;
    });
  }

  onSideBarOpen():void {
    this.opened = !this.opened;
    this.opened ? this.sidebar.open() : this.sidebar.close();
  }
}
