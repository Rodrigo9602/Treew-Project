import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { TrelloList, TrelloCard } from './authorization.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalVariablesService {
  // tablero seleccionado
  public selectedBoardIDSubject = new BehaviorSubject<string | null>(null);
  public selectedBoardID$ = this.selectedBoardIDSubject.asObservable();

  // lista seleccionada
  public selectedListSubject = new BehaviorSubject<TrelloList | null>(null);
  public selectedList$ = this.selectedListSubject.asObservable();

  // tarjeta seleccionada
  public selectedCardSubject = new BehaviorSubject<TrelloCard | null>(null);
  public selectedCard$ = this.selectedCardSubject.asObservable();

  constructor() {}
}
