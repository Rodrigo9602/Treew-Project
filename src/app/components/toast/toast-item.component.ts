import { Component, Input, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastConfig } from '../../interfaces/toast';
import { ToastService } from '../../services/component-services/toast.service';

@Component({
  selector: 'app-toast-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="flex flex-col min-w-[300px] max-w-[400px] rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out"
      [ngClass]="toastClasses()"
      role="alert"
      aria-live="assertive"
      aria-atomic="true">
      
      <div class="flex items-center justify-between p-3">
        <div class="flex items-center">
          <span class="mr-2" [ngClass]="iconClass()">
            <i [ngClass]="iconType()"></i>
          </span>
          <h4 class="font-bold text-sm">{{ toast.header }}</h4>
        </div>
        <button 
          (click)="close()"
          class="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="px-3 pb-3">
        <p class="text-sm">{{ toast.message }}</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 0.75rem;
    }
  `]
})
export class ToastItemComponent implements OnInit {
  @Input() toast!: ToastConfig;
  
  private toastService = inject(ToastService);
  
  ngOnInit() {
    if (!this.toast) {
      throw new Error('Toast configuration is required');
    }
  }
  
  close() {
    if (this.toast.id) {
      this.toastService.remove(this.toast.id);
    }
  }
  
  toastClasses = computed(() => {
    const baseClasses = 'border-l-4';
    
    switch (this.toast?.type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-500 text-green-800`;
      case 'danger':
        return `${baseClasses} bg-red-50 border-red-500 text-red-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-50 border-blue-500 text-blue-800`;
    }
  });
  
  iconClass = computed(() => {
    switch (this.toast?.type) {
      case 'success':
        return 'text-green-500';
      case 'danger':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  });
  
  iconType = computed(() => {
    switch (this.toast?.type) {
      case 'success':
        return 'pi pi-check-circle';
      case 'danger':
        return 'pi pi-times-circle';
      case 'warning':
        return 'pi pi-exclamation-triangle';
      case 'info':
      default:
        return 'pi pi-info-circle';
    }
  });
} 