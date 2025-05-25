import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { GlobalVariablesService } from '../../../services/global-variables.service';
import { TrelloAuthService, TrelloCard } from '../../../services/authorization.service';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './card-form.component.html',
  styleUrl: './card-form.component.scss'
})
export class CardFormComponent implements OnInit, OnDestroy {
  cardForm: FormGroup;
  cardData: TrelloCard | null = null;
  isLoading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private globalService: GlobalVariablesService,
    private trelloService: TrelloAuthService
  ) {
    this.cardForm = this.createForm();
  }

  ngOnInit(): void {
    // Suscribirse para obtener la tarjeta seleccionada
    this.globalService.selectedCard$
      .pipe(takeUntil(this.destroy$))
      .subscribe((card) => {
        this.cardData = card;
        if (card) {
          this.populateForm(card);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      desc: [''],
      due: [''],
      dueComplete: [false],
      start: [''],
      subscribed: [false],
      address: [''],
      locationName: [''],
      pos: [0, [Validators.min(0)]]
    });
  }

  private populateForm(card: TrelloCard): void {
    this.cardForm.patchValue({
      name: card.name || '',
      desc: card.desc || '',
      due: card.due ? this.formatDateForInput(card.due) : '',
      dueComplete: card.dueComplete || false,
      start: card.start ? this.formatDateForInput(card.start) : '',
      subscribed: card.subscribed || false,
      address: card.address || '',
      locationName: card.locationName || '',
      pos: card.pos || 0
    });
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Formato para datetime-local input
  }

  private formatDateForApi(dateString: string): string | null {
    if (!dateString) return null;
    return new Date(dateString).toISOString();
  }

  onSubmit(): void {
    if (this.cardForm.valid && this.cardData) {
      this.isLoading = true;
      this.error = null;

      const formValue = this.cardForm.value;
      const updates = {
        name: formValue.name,
        desc: formValue.desc
      };

      // Actualizar la tarjeta básica
      this.trelloService.updateCard(this.cardData.id, updates)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedCard) => {
            // Si hay cambios en la fecha de vencimiento, actualizarla por separado
            if (this.shouldUpdateDueDate(formValue)) {
              this.updateDueDate(updatedCard.id, formValue);
            } else {
              this.handleSuccess(updatedCard);
            }
          },
          error: (error) => {
            this.handleError(error);
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private shouldUpdateDueDate(formValue: any): boolean {
    const currentDue = this.cardData?.due;
    const newDue = this.formatDateForApi(formValue.due);
    const currentDueComplete = this.cardData?.dueComplete || false;
    const newDueComplete = formValue.dueComplete;

    return currentDue !== newDue || currentDueComplete !== newDueComplete;
  }

  private updateDueDate(cardId: string, formValue: any): void {
    const dueDate = this.formatDateForApi(formValue.due);
    const dueComplete = formValue.dueComplete;

    this.trelloService.updateCardDueDate(cardId, dueDate, dueComplete)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedCard) => {
          this.handleSuccess(updatedCard);
        },
        error: (error) => {
          this.handleError(error);
        }
      });
  }

  private handleSuccess(updatedCard: TrelloCard): void {
    this.isLoading = false;
    console.log('Card updated successfully:', updatedCard);
    // Aquí podrías emitir un evento o actualizar el estado global
    // this.globalService.updateSelectedCard(updatedCard);
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.error = 'Error updating card. Please try again.';
    console.error('Error updating card:', error);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.cardForm.controls).forEach(key => {
      this.cardForm.get(key)?.markAsTouched();
    });
  }

  // Getters para facilitar el acceso a los controles en el template
  get nameControl() { return this.cardForm.get('name'); }
  get descControl() { return this.cardForm.get('desc'); }
  get dueControl() { return this.cardForm.get('due'); }
  get dueCompleteControl() { return this.cardForm.get('dueComplete'); }
  get startControl() { return this.cardForm.get('start'); }
  get subscribedControl() { return this.cardForm.get('subscribed'); }
  get addressControl() { return this.cardForm.get('address'); }
  get locationNameControl() { return this.cardForm.get('locationName'); }
  get posControl() { return this.cardForm.get('pos'); }

  // Método para resetear el formulario
  resetForm(): void {
    this.cardForm.reset();
    this.error = null;
    if (this.cardData) {
      this.populateForm(this.cardData);
    }
  }

  // Método para verificar si un campo tiene errores
  hasError(controlName: string, errorType: string): boolean {
    const control = this.cardForm.get(controlName);
    return !!(control?.hasError(errorType) && (control?.dirty || control?.touched));
  }

  // Método para obtener el mensaje de error
  getErrorMessage(controlName: string): string {
    const control = this.cardForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${controlName} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('min')) {
      return `${controlName} must be greater than or equal to ${control.errors?.['min'].min}`;
    }
    return '';
  }
}