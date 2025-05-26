import { Directive, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';

/**
 * Directiva que detecta clics fuera del elemento al que se aplica.
 * 
 * Esta directiva permite detectar cuando el usuario hace clic fuera del elemento
 * que contiene la directiva, emitiendo un evento que puede ser manejado por el
 * componente padre.
 * 
 * @example
 * ```html
 * <div (clickOutside)="closeDropdown()">
 *   <button>Toggle Dropdown</button>
 *   <ul class="dropdown-menu">
 *     <li>Opción 1</li>
 *     <li>Opción 2</li>
 *   </ul>
 * </div>
 * ```
 * 
 * @example
 * ```html
 * <div class="modal" (clickOutside)="closeModal()">
 *   <div class="modal-content">
 *     <p>Contenido del modal</p>
 *   </div>
 * </div>
 * ```
 * 
 * @usageNotes
 * ### Casos de uso comunes:
 * - Cerrar dropdowns cuando se hace clic fuera
 * - Cerrar modales al hacer clic en el backdrop
 * - Ocultar tooltips o popovers
 * - Cancelar edición en línea
 * 
 * ### Consideraciones:
 * - La directiva escucha eventos de clic en todo el documento
 * - Solo se emite el evento si el clic ocurre fuera del elemento
 * - Es compatible con elementos anidados
 * 
 * @since 1.0.0
 * @author [Nombre del desarrollador]
 */
@Directive({
  selector: '[clickOutside]'
})
export class ClickOutsideDirective {
  
  /**
   * Evento emitido cuando se detecta un clic fuera del elemento.
   * 
   * Este evento se dispara cada vez que el usuario hace clic en cualquier
   * lugar del documento que no sea el elemento al que se aplica la directiva
   * o sus elementos hijos.
   * 
   * @event clickOutside
   * @type {EventEmitter<void>}
   * 
   * @example
   * ```html
   * <div (clickOutside)="onClickOutside()">
   *   Contenido del elemento
   * </div>
   * ```
   * 
   * @example
   * ```typescript
   * onClickOutside() {
   *   console.log('Se hizo clic fuera del elemento');
   *   this.isVisible = false;
   * }
   * ```
   */
  @Output() clickOutside = new EventEmitter<void>();

  /**
   * Constructor de la directiva.
   * 
   * @param elementRef - Referencia al elemento DOM al que se aplica la directiva.
   *                    Se utiliza para determinar si el clic ocurrió dentro o fuera
   *                    del elemento.
   */
  constructor(private elementRef: ElementRef) {}

  /**
   * Escucha los eventos de clic en el documento.
   * 
   * Este método se ejecuta cada vez que se produce un clic en cualquier lugar
   * del documento. Evalúa si el clic ocurrió dentro o fuera del elemento
   * y emite el evento correspondiente.
   * 
   * @param target - El elemento HTML que fue clickeado
   * 
   * @hostListener document:click
   * 
   * @example
   * El método se ejecuta automáticamente cuando:
   * ```
   * - Usuario hace clic en cualquier parte del documento
   * - Se verifica si el clic está dentro del elemento
   * - Si está fuera, se emite el evento clickOutside
   * ```
   * 
   * @internal
   * Este método es interno y no debe ser llamado directamente.
   */
  @HostListener('document:click', ['$event.target'])
  public onClick(target: HTMLElement): void {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}