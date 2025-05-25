import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { SideItem } from '../sidebar.component';


@Component({
  selector: 'app-side-item',
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './side-item.component.html',
  styleUrl: './side-item.component.scss'
})
export class SideItemComponent {
  @Input() sideItem: SideItem | undefined;
  @Output() selectedBoardChanged = new EventEmitter<string>();

  onSelectNewBoard(id:string): void {     
    this.selectedBoardChanged.emit(id);
  }
}
