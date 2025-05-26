import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from './nav-item/nav-item.component';
import { NgOptimizedImage } from '@angular/common';
import { NavItemComponent } from './nav-item/nav-item.component';
import { SidebarService } from '../../services/components/sidebar.service';
import { TrelloAuthService } from '../../services/authorization.service';

/**
 * Componente de navegación principal de la aplicación.
 * 
 * Proporciona la barra de navegación superior con logo, elementos de menú
 * y controles para el sidebar. Maneja la autenticación de usuario y
 * el estado de expansión del menú lateral.
 * 
 * @example
 * ```html
 * <app-navbar></app-navbar>
 * ```
 */
@Component({
  selector: 'app-navbar',
  imports: [CommonModule, NgOptimizedImage, NavItemComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit{
  /**
   * Ruta de la imagen del logo de la aplicación.
   * @default '/assets/images/logo.png'
   */
  logoSrc = '/assets/images/logo.png';

  /**
   * Lista de elementos del menú de navegación.
   * @type {MenuItem[] | undefined}
   */
  items: MenuItem[] | undefined;

  /**
   * Estado de apertura del sidebar.
   * @default false
   */
  opened:boolean = false;

  /**
   * Constructor del componente.
   * 
   * @param {SidebarService} sidebar - Servicio para controlar el estado del sidebar
   * @param {TrelloAuthService} trelloAuthService - Servicio de autenticación de Trello
   */
  constructor(private sidebar:SidebarService, private trelloAuthService:TrelloAuthService) {}

  /**
   * Inicializa el componente.
   * 
   * Configura los elementos del menú y se suscribe a los cambios
   * de estado del sidebar.
   * 
   * @returns {void}
   */
  ngOnInit(): void {
    this.items = [      
    ];

   this.sidebar.stateChange$.subscribe((navState) => {
      this.opened = navState;
    });
  }

  /**
   * Alterna el estado de apertura del sidebar.
   * 
   * Cambia el estado local y notifica al servicio del sidebar
   * para sincronizar el estado en toda la aplicación.
   * 
   * @public
   * @returns {void}
   */
  onSideBarOpen():void {
    this.opened = !this.opened;
    this.sidebar.setMenuExpanded(this.opened);
  }

  /**
   * Cierra la sesión del usuario.
   * 
   * Utiliza el servicio de autenticación para realizar el logout
   * y redirigir al usuario según sea necesario.
   * 
   * @public
   * @returns {void}
   */
  logout():void {
    this.trelloAuthService.logout();
  }
}