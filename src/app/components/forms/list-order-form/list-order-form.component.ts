import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-order-form',
  imports: [ReactiveFormsModule],
  templateUrl: './list-order-form.component.html',
  styleUrl: './list-order-form.component.scss'
})
export class ListOrderFormComponent implements OnInit {
  @Input() listName!: string;
  @Input() currentOrder!: number;
  @Input() totalLists!: number;

  @Output() reorder = new EventEmitter<number>();

  form!: FormGroup;
  orderOptions: number[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      order: [this.currentOrder]
    });

    this.orderOptions = Array.from({ length: this.totalLists }, (_, i) => i + 1);
  }

  onSubmit(): void {    
    if (this.form.valid) {      
      this.reorder.emit(this.form.value.order);
    }
    this.form.reset();
  }

  resetForm(): void {
    this.form.reset();
  }
}
