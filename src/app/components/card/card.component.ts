import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrelloCard } from '../../services/authorization.service';
import { CheckListProgress, getCardPriority, getChecklistProgress } from '../../utils/utils';
import { GlobalVariablesService } from '../../services/global-variables.service';

/**
 * Componente que representa una tarjeta de Trello con funcionalidades de visualización y gestión.
 * 
 * Este componente se encarga de mostrar la información de una tarjeta de Trello,
 * incluyendo su contenido, prioridad, progreso de checklist y etiquetas con colores.
 * También maneja la interacción del usuario para abrir/seleccionar tarjetas.
 * 
 * @example
 * ```html
 * <app-card [card]="trelloCard"></app-card>
 * ```
 * 
 * @example
 * ```typescript
 * // En el componente padre
 * export class BoardComponent {
 *   cards: TrelloCard[] = [
 *     { id: '1', name: 'Tarea 1', labels: [...], checklists: [...] },
 *     { id: '2', name: 'Tarea 2', labels: [...], checklists: [...] }
 *   ];
 * }
 * ```
 * 
 * @usageNotes
 * ### Funcionalidades principales:
 * - Visualización de información de tarjetas Trello
 * - Cálculo automático de prioridad basado en etiquetas
 * - Seguimiento del progreso de checklists
 * - Mapeo de colores para etiquetas
 * - Gestión de selección de tarjetas
 * 
 * ### Dependencias:
 * - Requiere `GlobalVariablesService` para la comunicación entre componentes
 * - Utiliza funciones utilitarias `getCardPriority` y `getChecklistProgress`
 * - Depende del tipo `TrelloCard` del servicio de autorización
 * 
 * ### Consideraciones de rendimiento:
 * - El cálculo de prioridad y progreso se realiza solo en `ngOnInit`
 * - El mapeo de colores utiliza un objeto estático para optimizar las consultas
 * 
 * @since 1.0.0
 * @author [Rodrigo Antonio Fernandez Gonzalez]
 */
@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit {
  
  /**
   * Datos de la tarjeta de Trello a mostrar.
   * 
   * Esta propiedad recibe la información completa de una tarjeta de Trello
   * desde el componente padre. Incluye todos los datos necesarios para
   * la visualización y funcionalidad del componente.
   * 
   * @input
   * @type {TrelloCard | undefined}
   * 
   * @example
   * ```html
   * <app-card [card]="selectedCard"></app-card>
   * ```
   * 
   * @example
   * ```typescript
   * // Estructura típica de TrelloCard
   * const card: TrelloCard = {
   *   id: '123',
   *   name: 'Nombre de la tarjeta',
   *   desc: 'Descripción de la tarjeta',
   *   labels: [{ name: 'urgent', color: 'red' }],
   *   checklists: [{ name: 'Tareas', checkItems: [...] }]
   * };
   * ```
   */
  @Input() card: TrelloCard | undefined;
 
  /**
   * Nivel de prioridad calculado para la tarjeta.
   * 
   * La prioridad se determina automáticamente basándose en las etiquetas
   * de la tarjeta utilizando la función utilitaria `getCardPriority`.
   * 
   * @type {'high' | 'medium' | 'low' | 'none'}
   * @default 'none'
   * 
   * @example
   * ```typescript
   * // La prioridad se calcula automáticamente en ngOnInit
   * if (this.priority === 'high') {
   *   // Aplicar estilos de alta prioridad
   * }
   * ```
   */
  public priority: 'high' | 'medium' | 'low' | 'none' = 'none';
  
  /**
   * Información del progreso de las checklists de la tarjeta.
   * 
   * Contiene datos sobre el número total de elementos y elementos completados
   * en todas las checklists asociadas a la tarjeta.
   * 
   * @type {CheckListProgress | undefined}
   * 
   * @example
   * ```typescript
   * // Estructura típica de CheckListProgress
   * const progress: CheckListProgress = {
   *   total: 10,
   *   completed: 7,
   *   percentage: 70
   * };
   * ```
   */
  public checklistProgress: CheckListProgress | undefined;

  /**
   * Mapa de configuración de colores para las etiquetas.
   * 
   * Define los estilos de fondo y texto para cada color de etiqueta disponible
   * en Trello. Utiliza clases de Tailwind CSS para la consistencia visual.
   * 
   * @private
   * @readonly
   * @type {{ [key: string]: { bg: string; text: string } }}
   * 
   * @example
   * ```typescript
   * // Uso interno del mapa de colores
   * const redLabelClasses = this.colorMap['red'];
   * // Resultado: { bg: 'bg-red-100', text: 'text-red-700' }
   * ```
   */
  private colorMap: { [key: string]: { bg: string; text: string } } = {
    'green': { bg: 'bg-green-100', text: 'text-green-700' },
    'yellow': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    'orange': { bg: 'bg-orange-100', text: 'text-orange-700' },
    'red': { bg: 'bg-red-100', text: 'text-red-700' },
    'purple': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'blue': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'sky': { bg: 'bg-sky-100', text: 'text-sky-700' },
    'lime': { bg: 'bg-lime-100', text: 'text-lime-700' },
    'pink': { bg: 'bg-pink-100', text: 'text-pink-700' },
    'black': { bg: 'bg-gray-100', text: 'text-gray-700' }    
  };

  /**
   * Constructor del componente.
   * 
   * @param globalService - Servicio global para la comunicación entre componentes.
   *                       Se utiliza para notificar la selección de tarjetas.
   */
  constructor(private globalService: GlobalVariablesService) {}

  /**
   * Inicialización del componente.
   * 
   * Se ejecuta después de que Angular inicializa las propiedades de entrada del componente.
   * Calcula la prioridad de la tarjeta y el progreso de las checklists si están disponibles.
   * 
   * @lifecycle
   * 
   * @example
   * ```typescript
   * // El método se ejecuta automáticamente cuando:
   * // 1. Se asigna una tarjeta al componente
   * // 2. Se calcula la prioridad basada en etiquetas
   * // 3. Se calcula el progreso de checklists
   * ```
   */
  ngOnInit(): void {
    // obtener la prioridad de la tarjeta
    if (this.card) {
      this.priority = getCardPriority(this.card);      
    }

    // obtener el progreso de la checklist
    if (this.card && this.card.checklists) {      
      const progress = getChecklistProgress(this.card);
      this.checklistProgress = progress;
    }
  }

  /**
   * Obtiene las clases CSS para el estilo de una etiqueta basada en su color.
   * 
   * Utiliza el mapa de colores interno para devolver las clases de Tailwind CSS
   * apropiadas para el fondo y texto de una etiqueta con el color especificado.
   * 
   * @param color - El color de la etiqueta (ej: 'red', 'green', 'blue')
   * @returns Las clases CSS combinadas para fondo y texto
   * 
   * @example
   * ```typescript
   * const classes = this.getLabelClasses('red');
   * // Retorna: 'bg-red-100 text-red-700'
   * ```
   * 
   * @example
   * ```html
   * <!-- En el template -->
   * <span [class]="getLabelClasses(label.color)">
   *   {{ label.name }}
   * </span>
   * ```
   * 
   * @public
   */
  getLabelClasses(color: string): string {
    const colors = this.colorMap[color] || { bg: 'bg-gray-100', text: 'text-gray-700' };
    return `${colors.bg} ${colors.text}`;
  }

  /**
   * Maneja el evento de apertura/selección de una tarjeta.
   * 
   * Notifica al servicio global sobre la selección de la tarjeta,
   * permitiendo que otros componentes reaccionen a este evento.
   * Típicamente utilizado para abrir modales de detalle o actualizar vistas.
   * 
   * @param card - La tarjeta que ha sido seleccionada por el usuario
   * 
   * @example
   * ```html
   * <!-- En el template -->
   * <div (click)="onCardOpen(card)" class="card-container">
   *   <!-- Contenido de la tarjeta -->
   * </div>
   * ```
   * 
   * @example
   * ```typescript
   * // El método se puede llamar programáticamente
   * this.onCardOpen(this.card);
   * 
   * // Otros componentes pueden suscribirse al evento
   * this.globalService.selectedCardSubject.subscribe(card => {
   *   console.log('Tarjeta seleccionada:', card);
   * });
   * ```
   * 
   * @public
   */
  onCardOpen(card: TrelloCard): void {    
    this.globalService.selectedCardSubject.next(card);
  } 
}