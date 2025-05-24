import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/components/sidebar.service';
import { SideItemComponent } from './side-item/side-item.component';
import { MenuItem } from '../navbar/nav-item/nav-item.component';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, SideItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  isOpen: boolean = false;
  sideItems: MenuItem[] = [];

  constructor(private sidenav: SidebarService) { }

  ngOnInit(): void {
    this.sidenav.stateChange$.subscribe((navState) => {
      this.isOpen = navState;
    });
  }

  // Método para cerrar el sidenav al hacer clic en el overlay
  closeNav(): void {
    this.sidenav.close();
  }
}
