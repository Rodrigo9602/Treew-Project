import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-list-form',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-list-form.component.html',
  styleUrl: './edit-list-form.component.scss'
})
export class EditListFormComponent implements OnInit {
  @Input() listName!: string;
  @Output() editedList = new EventEmitter<string>();

  form!: FormGroup;  

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.listName, [
        Validators.required,
        Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/), // sin caracteres especiales
      ]]
    });
  }

  onSubmit(): void {    
    if (this.form.valid) {      
      this.editedList.emit(this.form.value.name);
    }
    this.form.reset();
  }

  resetForm(): void {
    this.form.reset();
  }
}
