import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TrelloAuthService } from '../../services/authorization.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-callback',
  imports: [CommonModule],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss'
})
export class CallbackComponent implements OnInit{
  constructor(private router: Router, private trelloAuthService: TrelloAuthService) {}
  
  ngOnInit() {
    // Manejar el callback de Trello
    const success = this.trelloAuthService.handleTrelloCallback();
    
    if (success) {
      // Inicializar datos del usuario
      this.trelloAuthService.initializeUser();
      // Redireccionar al dashboard
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1000);
    } else {
      // Error en la autenticación, volver al login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }
}
