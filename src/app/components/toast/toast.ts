export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface ToastConfig {
  id?: string;
  type: ToastType;
  header: string;
  message: string;
  duration?: number; // Duración en milisegundos, por defecto será 3000ms
  visible?: boolean;
}

export interface ToastPosition {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
} 