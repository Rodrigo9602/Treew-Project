import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-card',
  imports: [ ReactiveFormsModule],
  templateUrl: './new-card.component.html',
  styleUrl: './new-card.component.scss'
})
export class NewCardComponent {
  cardForm: FormGroup;
  @Output() abortAction = new EventEmitter<boolean>(false);
  @Output() createCard = new EventEmitter<{ name: string; desc: string }>();

  constructor(private fb: FormBuilder) {
    this.cardForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      desc: ['', [Validators.maxLength(300)]],
    });
  }

  onSubmit(): void {
    if (this.cardForm.valid) {
      this.createCard.emit(this.cardForm.value);
      this.cardForm.reset();
    }
  }

  resetForm():void {    
    this.cardForm.reset(); 
    this.abortAction.emit(true);   
  }
}
