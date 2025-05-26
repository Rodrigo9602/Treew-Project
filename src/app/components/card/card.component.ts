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

  private colorMap: { [key: string]: { bg: string; text: string } } = {
    'green': { bg: 'bg-green-100', text: 'text-green-700' },
    'yellow': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    'orange': { bg: 'bg-orange-100', text: 'text-orange-700' },
    'red': { bg: 'bg-red-100', text: 'text-red-700' },
    'purple': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'blue': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'sky': { bg: 'bg-sky-100', text: 'text-sky-700' },
    'lime': { bg: 'bg-lime-100', text: 'text-lime-700' },
    'pink': { bg: 'bg-pink-100', text: 'text-pink-700' },
    'black': { bg: 'bg-gray-100', text: 'text-gray-700' }    
  };

  getLabelClasses(color: string): string {
    const colors = this.colorMap[color] || { bg: 'bg-gray-100', text: 'text-gray-700' };
    return `${colors.bg} ${colors.text}`;
  }

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
