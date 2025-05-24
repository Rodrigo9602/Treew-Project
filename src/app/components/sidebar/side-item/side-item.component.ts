import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { MenuItem } from '../../navbar/nav-item/nav-item.component';

@Component({
  selector: 'app-side-item',
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './side-item.component.html',
  styleUrl: './side-item.component.scss'
})
export class SideItemComponent {
  @Input() sideItem: MenuItem | undefined;
}
