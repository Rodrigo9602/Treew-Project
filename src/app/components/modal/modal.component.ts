import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

/**
 * Componente modal reutilizable con animaciones de entrada y salida.
 * 
 * Proporciona una ventana modal que puede ser controlada desde el componente padre,
 * con soporte para cerrar mediante clic en el backdrop o tecla Escape.
 * 
 * @example
 * ```html
 * <app-modal [isVisible]="showModal" (onClose)="handleModalClose()">
 *   <p>Contenido del modal</p>
 * </app-modal>
 * ```
 */
@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
  ]
})
export class ModalComponent {
  /**
   * Controla la visibilidad del modal.
   * @default false
   */
  @Input() isVisible: boolean = false;

  /**
   * Evento emitido cuando el modal debe cerrarse.
   * Se dispara al hacer clic en el backdrop, presionar Escape o llamar al método close().
   */
  @Output() onClose = new EventEmitter<void>();

  constructor() { }

  /**
   * Cierra el modal emitiendo el evento onClose.
   * 
   * @public
   * @returns {void}
   */
  close(): void {
    this.onClose.emit();
  }

  /**
   * Maneja el clic en el backdrop del modal.
   * Si el clic es directamente en el backdrop (no en el contenido), cierra el modal.
   * 
   * @param {MouseEvent} event - Evento del mouse del clic
   * @returns {void}
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  /**
   * Escucha la tecla Escape a nivel de documento para cerrar el modal.
   * Solo cierra el modal si está visible.
   * 
   * @returns {void}
   */
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isVisible) {
      this.close();
    }
  }
}