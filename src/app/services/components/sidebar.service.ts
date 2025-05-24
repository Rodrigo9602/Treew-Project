import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidenavState = new BehaviorSubject<boolean>(false);
  stateChange$ = this.sidenavState.asObservable();

  constructor() { }

  toggle() {
    this.sidenavState.next(!this.sidenavState.value);
  }

  open() {
    this.sidenavState.next(true);
  }

  close() {
    this.sidenavState.next(false);
  }
}
