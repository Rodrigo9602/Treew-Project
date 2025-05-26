import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TrelloAuthService } from '../../services/authorization.service';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';

/**
 * Componente de inicio de sesión que maneja la autenticación con Trello.
 * Proporciona una interfaz para que los usuarios se conecten con sus cuentas
 * de Trello y accedan a la aplicación con los permisos necesarios.
 */

@Component({
  selector: 'app-login',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  /**
   * Indica si el proceso de autenticación está en progreso.
   * Se utiliza para mostrar el estado de carga y deshabilitar el botón durante la conexión.
   */
  isLoading = false;

  constructor(
    private router: Router,
    private trelloAuthService: TrelloAuthService
  ) {}

  /**
   * Verifica si el usuario ya está autenticado al cargar el componente.
   * Si ya tiene una sesión activa, lo redirige directamente al dashboard.
   */
  ngOnInit(): void {
    if (this.trelloAuthService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Inicia el proceso de autenticación con Trello.
   * Redirige al usuario a la página de autorización de Trello
   * donde deberá otorgar los permisos necesarios para la aplicación.
   *
   * Los permisos solicitados incluyen:
   * - Lectura de tableros, listas y tarjetas
   * - Creación, edición y eliminación de listas
   * - Creación, edición y eliminación de tarjetas
   * - Acceso a información básica del perfil
   */

  loginWithTrello() {
    this.isLoading = true;
    this.trelloAuthService.loginWithTrello();
  }
}
