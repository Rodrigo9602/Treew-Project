import { Component, OnInit } from '@angular/core';
import { TrelloAuthService, TrelloList } from '../../services/authorization.service';
import { ListComponent } from '../../components/list/list.component';

@Component({
  selector: 'app-dashboard',
  imports: [ListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  noBoardSelected: boolean = false;
  public boardLists: TrelloList[] = [];
  constructor(private trelloService: TrelloAuthService) { }

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
  } 

  createNewBoard() {
    
  }
}
