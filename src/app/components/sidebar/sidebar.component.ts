import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/components/sidebar.service';
import { SideItemComponent } from './side-item/side-item.component';
import { TrelloAuthService } from '../../services/authorization.service';
import { GlobalVariablesService } from '../../services/global-variables.service';
import { ModalComponent } from '../modal/modal.component';
import { NewBoardFormComponent } from '../forms/new-board-form/new-board-form.component';
export interface SideItem {
  label: string;
  icon?: string;
  url?: string;
  id: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, SideItemComponent, ModalComponent, NewBoardFormComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  isOpen: boolean = false;
  sideItems: SideItem[] = [];  
  public openCreateBoardModal: boolean = false;

  constructor(private sidenav: SidebarService, private trelloService: TrelloAuthService, private globalService: GlobalVariablesService) { }

  ngOnInit(): void {
    this.getBoardsData(); 

    // suscribirse a cambios en la variable newBoard$
    this.trelloService.newBoard$.subscribe((newBoard)=> {
      if(newBoard) {
        this.getBoardsData();
      }
    })

    this.checkScreenSize();
    this.sidenav.stateChange$.subscribe((navState) => {
      this.isOpen = navState;
    });    
  }

  getBoardsData():void {
    // Obtener listado de tableros del usuario inicialmente
    this.trelloService.getUserBoards().subscribe((response: any) => {
      response.forEach((board: any) => {
        this.sideItems.push({
          label: board.name,          
          url: `/board/${board.id}`,
          id: board.id
        });

        // setear el primer tablero como activo
        if (response.length > 0) {
          this.globalService.selectedBoardIDSubject.next(response[0].id);
        }
      });
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

  createNewBoard():void {   
    this.openCreateBoardModal = true;
  }

  onCreateNewBoard(event: string):void {
    this.trelloService.createBoard(event).subscribe({
      next: (newBoard) => {
        this.sideItems.push({
          label: newBoard.name,          
          url: `/board/${newBoard.id}`,
          id: newBoard.id
        });
        this.openCreateBoardModal = false;
      },
      error: (err) => {
        console.error('Error creating board:', err);        
      }
    });
  }
}
