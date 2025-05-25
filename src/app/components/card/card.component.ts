import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrelloCard } from '../../services/authorization.service';
import { CheckListProgress, getCardPriority, getChecklistProgress } from '../../utils/utils';
import { GlobalVariablesService } from '../../services/global-variables.service';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit{
  @Input() card:TrelloCard | undefined;
 
  public priority: 'high' | 'medium' | 'low' | 'none' = 'none';
  public checklistProgress: CheckListProgress | undefined;

  constructor(private globalService: GlobalVariablesService) {}

  ngOnInit(): void {
    // obtener la prioridad de la tarjeta
    if (this.card) {
      this.priority = getCardPriority(this.card);
    }

    // obtener el progreso de la checklist
    if (this.card && this.card.checklists) {      
      const progress = getChecklistProgress(this.card);
      this.checklistProgress = progress;
    }
  }

  onCardOpen(card: TrelloCard) {    
    this.globalService.selectedCardSubject.next(card);
  } 

}
