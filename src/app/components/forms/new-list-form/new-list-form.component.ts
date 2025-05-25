import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-list-form',
  imports: [ReactiveFormsModule],
  templateUrl: './new-list-form.component.html',
  styleUrl: './new-list-form.component.scss'
})
export class NewListFormComponent implements OnInit{
  @Output() create = new EventEmitter<string>();

  listForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.listForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  onSubmit(): void {
    if (this.listForm.valid) {
      this.create.emit(this.listForm.value.name);
      this.listForm.reset();
    }
  }

  resetForm(): void {
    this.listForm.reset();
  }
}
