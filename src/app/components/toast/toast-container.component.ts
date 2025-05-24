import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/component-services/toast.service';
import { ToastItemComponent } from './toast-item.component';
import { ToastPosition } from '../../interfaces/toast';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastItemComponent],
  template: `
    <div 
      class="fixed z-50 p-4 flex flex-col"
      [ngClass]="positionClasses">
      @for (toast of toastService.getToasts()(); track toast.id) {
        <app-toast-item [toast]="toast"></app-toast-item>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ToastContainerComponent implements OnInit {
  @Input() position: ToastPosition = { top: true, right: true };
  
  toastService = inject(ToastService);
  
  get positionClasses(): string {
    const classes: string[] = [];
    
    if (this.position.top) classes.push('top-0');
    if (this.position.right) classes.push('right-0');
    if (this.position.bottom) classes.push('bottom-0');
    if (this.position.left) classes.push('left-0');
    
    // Si no se especifica ninguna posición, por defecto será arriba a la derecha
    if (classes.length === 0) {
      classes.push('top-0', 'right-0');
    }
    
    return classes.join(' ');
  }
  
  ngOnInit() {
    // Validar que la posición sea válida
    if (this.position.top && this.position.bottom) {
      console.warn('Toast container cannot be positioned at both top and bottom. Using top position.');
      this.position.bottom = false;
    }
    
    if (this.position.left && this.position.right) {
      console.warn('Toast container cannot be positioned at both left and right. Using right position.');
      this.position.left = false;
    }
  }
} 