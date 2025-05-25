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

  setMenuExpanded(expanded: boolean) {
    this.sidenavState.next(expanded);
  }
}
