import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-new-board-form',
  imports: [ReactiveFormsModule],
  templateUrl: './new-board-form.component.html',
  styleUrl: './new-board-form.component.scss',
})
export class NewBoardFormComponent implements OnInit {  
  @Output() newBoardName = new EventEmitter<string>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/), // sin caracteres especiales
        ],
      ],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.newBoardName.emit(this.form.value.name);
    }
    this.form.reset();
  }

  resetForm(): void {
    this.form.reset();
  }
}
