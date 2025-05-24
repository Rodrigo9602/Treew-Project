import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

export interface MenuItem {
  label: string,
  url?: string,
  icon?: string,
  childrens?: MenuItem[]
}

@Component({
  selector: 'app-nav-item',
  imports: [CommonModule, NgOptimizedImage, RouterModule],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss'
})
export class NavItemComponent {
 @Input() item:MenuItem | undefined;

  constructor(public router:Router) {}
}
