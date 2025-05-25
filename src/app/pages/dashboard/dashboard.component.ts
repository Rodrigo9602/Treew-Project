import { Component, OnInit } from '@angular/core';
import { TrelloAuthService, TrelloCard, TrelloList } from '../../services/authorization.service';
import { GlobalVariablesService } from '../../services/global-variables.service';
import { ListComponent } from '../../components/list/list.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { CardFormComponent } from '../../components/forms/card-form/card-form.component';
@Component({
  selector: 'app-dashboard',
  imports: [ListComponent, ModalComponent, CardFormComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  noBoardSelected: boolean = false;
  public boardLists: TrelloList[] = [];  
  public openCardModal: boolean = false;

  constructor(private trelloService: TrelloAuthService, private globalService: GlobalVariablesService) { }

  ngOnInit(): void {
    // obtener el tablero seleccionado
    this.trelloService.selectedBoardID$.subscribe((boardID) => {
      // obtener listas para el tablero seleccionado
      if(boardID) {
        this.trelloService.getBoardLists(boardID).subscribe((response: any) => {
          this.boardLists = response;        
        });
        this.noBoardSelected = false;
      } else {
        this.noBoardSelected = true;
      }    
    });  
    
    // suscribirse al observable de cards
    this.globalService.selectedCard$.subscribe((card)=> {
      if(card) {
        this.openCardModal = true;        
      }
    })
  } 

  

  onCloseCardModal() {
    this.openCardModal = false; 
    this.globalService.selectedCardSubject.next(null);   
  }

  createNewBoard() {
    
  }
}
