import { Injectable, signal } from '@angular/core';
import { ToastConfig } from '../../components/toast/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<ToastConfig[]>([]);

  getToasts() {
    return this.toasts;
  }

  show(config: Omit<ToastConfig, 'id' | 'visible'>) {
    const id = Date.now().toString();
    const toast: ToastConfig = {
      ...config,
      id,
      visible: true,
      duration: config.duration || 3000 // Duración por defecto: 3 segundos
    };

    this.toasts.update(currentToasts => [...currentToasts, toast]);

    // Eliminar el toast después de la duración especificada
    setTimeout(() => {
      this.remove(id);
    }, toast.duration);

    return id;
  }

  // Métodos de conveniencia para diferentes tipos de toast
  success(header: string, message: string, duration?: number) {    
    return this.show({ type: 'success', header, message, duration });
  }

  danger(header: string, message: string, duration?: number) {
    return this.show({ type: 'danger', header, message, duration });
  }

  warning(header: string, message: string, duration?: number) {
    return this.show({ type: 'warning', header, message, duration });
  }

  info(header: string, message: string, duration?: number) {
    return this.show({ type: 'info', header, message, duration });
  }

  remove(id: string) {
    this.toasts.update(currentToasts => 
      currentToasts.filter(toast => toast.id !== id)
    );
  }
} 
