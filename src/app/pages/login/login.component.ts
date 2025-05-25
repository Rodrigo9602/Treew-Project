import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TrelloAuthService } from '../../services/authorization.service';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  isLoading = false;
  
  constructor(private router: Router, private trelloAuthService: TrelloAuthService) {}

  ngOnInit(): void {
    if (this.trelloAuthService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  loginWithTrello() {
    this.isLoading = true;
    this.trelloAuthService.loginWithTrello();
  }
 
}
