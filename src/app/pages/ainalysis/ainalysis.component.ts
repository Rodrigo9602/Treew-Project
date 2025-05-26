import { Component, OnInit } from '@angular/core';
import { AiAnalysisService } from '../../services/ai-analysis.service';
import { GlobalVariablesService } from '../../services/global-variables.service';
import { TrelloAuthService } from '../../services/authorization.service';
import { RouterModule } from '@angular/router';

/**
 * Componente que proporciona análisis inteligente de tableros de Trello mediante IA.
 * Permite a los usuarios obtener insights y análisis automatizados sobre el estado,
 * progreso y características de sus tableros seleccionados.
 */
@Component({
  selector: 'app-ainalysis',
  imports: [ RouterModule],
  templateUrl: './ainalysis.component.html',
  styleUrl: './ainalysis.component.scss'
})
export class AinalysisComponent implements OnInit{
  /** ID del tablero seleccionado para análisis */
  boardId = '';
  
  /** Resultado del análisis de IA en formato texto */
  result = '';
  
  /** Indica si el análisis está en progreso */
  loading = false;
  
  /** Mensaje de error si ocurre algún problema durante el análisis */
  error = '';
  
  /** Nombre del tablero seleccionado */
  boardName = '';
  
  /** Descripción del tablero seleccionado */
  boardDescription = '';

  constructor(private ai: AiAnalysisService, private globalService: GlobalVariablesService, private trelloService: TrelloAuthService) {}

  /**
   * Inicializa el componente y configura la suscripción al tablero seleccionado.
   * Se ejecuta automáticamente cuando se carga el componente y obtiene
   * la información del tablero actualmente seleccionado.
   */
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

  /**
   * Ejecuta el análisis de IA sobre el tablero seleccionado.
   * Limpia resultados anteriores, establece el estado de carga y
   * procesa la respuesta del servicio de análisis.
   */
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

  /**
   * Limpia los resultados del análisis y mensajes de error.
   * Permite al usuario reiniciar la vista sin ejecutar un nuevo análisis.
   */
  clearResult() {
    this.result = '';
    this.error = '';
  }
}