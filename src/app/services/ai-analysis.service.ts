import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap } from 'rxjs';

import { TrelloAuthService } from './authorization.service';

@Injectable({
  providedIn: 'root'
})
export class AiAnalysisService {
  private readonly OPENAI_KEY = environment.openaiKey;
  private readonly OPENAI_API = 'https://api.openai.com/v1/chat/completions';
  private readonly trelloService = inject(TrelloAuthService);

  
  

  constructor(private http: HttpClient) {
    console.log(this.OPENAI_KEY)
  }

  analyzeBoard(boardId: string): Observable<string> {    
    return forkJoin([
      this.trelloService.getBoardCards(boardId),
      this.trelloService.getBoardLists(boardId)
    ]).pipe(
      map(([cards, lists]) => {
        const listMap = new Map<string, string>(
          lists.map((l: any) => [l.id, l.name])
        );

        const tasks = cards.map(card => ({
          name: card.name,
          start: card.start,
          due: card.due,
          completed: card.dueComplete,
          list: listMap.get(card.idList) || 'Sin lista'
        }));
        return this.createPrompt(tasks);      
      }),
      switchMap(prompt =>         
        this.http.post<any>(this.OPENAI_API, {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        }, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.OPENAI_KEY}`,
          })          
        })
      ),
      map(res => res.choices[0].message.content)
    );
  }

  private createPrompt(tasks: any[]): string {    
    return `
Tengo las siguientes tareas en un tablero de Trello:

${JSON.stringify(tasks, null, 2)}

Por favor, analiza el flujo de trabajo y:
1. Indica si hay demasiadas tareas en ejecución (tareas que han comenzado pero no han terminado).
2. Sugiere si es necesario limitar el WIP (work in progress).
3. Identifica tareas prioritarias.
4. Menciona posibles cuellos de botella.

Responde en español, de forma clara y estructurada.
    `;
  }
}
