import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/components/sidebar.service';
import { SideItemComponent } from './side-item/side-item.component';
import { TrelloAuthService } from '../../services/authorization.service';
import { GlobalVariablesService } from '../../services/global-variables.service';

export interface SideItem {
  label: string;
  icon?: string;
  url?: string;
  id: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, SideItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  isOpen: boolean = false;
  sideItems: SideItem[] = [];  

  constructor(private sidenav: SidebarService, private trelloService: TrelloAuthService, private globalService: GlobalVariablesService) { }

  ngOnInit(): void {
    // Obtener listado de tableros del usuario
    this.trelloService.getUserBoards().subscribe((response: any) => {
      response.forEach((board: any) => {
        this.sideItems.push({
          label: board.name,          
          url: `/board/${board.id}`,
          id: board.id
        });

        // setear el primer tablero como activo
        if (response.length > 0) {
          this.trelloService.selectedBoardIDSubject.next(response[0].id);
        }
      });
    });

    this.checkScreenSize();
    this.sidenav.stateChange$.subscribe((navState) => {
      this.isOpen = navState;
    });    
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    if (window.innerWidth < 768) {
      this.sidenav.setMenuExpanded(false);
    } else if (window.innerWidth >= 768) {
      this.sidenav.setMenuExpanded(true);
    }
  }

  // evento para seleccionar nuevo tablero
  selectBoard(boardId: string): void {
    this.globalService.selectedBoardIDSubject.next(boardId);
  }

  // Método para cerrar el sidenav al hacer clic en el overlay
  closeNav(): void {
    this.sidenav.setMenuExpanded(false);
  }  
}
