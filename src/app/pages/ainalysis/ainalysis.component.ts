import { Component, OnInit } from '@angular/core';
import { AiAnalysisService } from '../../services/ai-analysis.service';
import { GlobalVariablesService } from '../../services/global-variables.service';
import { TrelloAuthService } from '../../services/authorization.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ainalysis',
  imports: [FormsModule],
  templateUrl: './ainalysis.component.html',
  styleUrl: './ainalysis.component.scss'
})
export class AinalysisComponent implements OnInit{
  boardId = '';
  result = '';
  loading = false;
  error = '';
  boardName = '';
  boardDescription = '';

  constructor(private ai: AiAnalysisService, private globalService: GlobalVariablesService, private trelloService: TrelloAuthService) {}

  ngOnInit(): void {
    // Chequear si existe un tablero por defecto
    this.globalService.selectedBoardID$.subscribe(boardId => {
      if (boardId) {
        this.boardId = boardId;
        // obtener datos del tablero
        this.trelloService.getBoardById(this.boardId).subscribe({
          next: board => {
            this.boardName = board.name;
            this.boardDescription = board.desc;
          },
          error: err => {
            this.error = 'Error al obtener el tablero.';
          }
        });
      } else {
        this.boardId = '';
      }
    });
  }

 runAnalysis() {
    this.result = '';
    this.error = '';
    this.loading = true;

    this.ai.analyzeBoard(this.boardId).subscribe({
      next: res => {
        this.result = res;
        this.loading = false;
      },
      error: err => {
        console.error('Error al analizar el tablero:', err);
        this.error = 'Error al analizar el tablero.';
        this.loading = false;
      }
    });
  }

  clearResult() {
    this.result = '';
    this.error = '';
  }
}
