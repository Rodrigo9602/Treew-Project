import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, forkJoin, from, map, switchMap } from 'rxjs';

import OpenAI from 'openai';
import { TrelloAuthService } from './authorization.service';

@Injectable({
  providedIn: 'root'
})
export class AiAnalysisService {
  private readonly trelloService = inject(TrelloAuthService);
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: environment.openaiKey,
      dangerouslyAllowBrowser: true
    });
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
          desc: card.desc,
          due: card.due,
          dueComplete: card.dueComplete,
          listName: listMap.get(card.idList)
        }));

        const prompt = `
Analiza el flujo de trabajo basado en las siguientes tareas de Trello. Sugiere mejoras para optimizar el flujo de trabajo, limitar el WIP si hay muchas tareas en ejecución, identificar tareas prioritarias, y resalta problemas evidentes.

${JSON.stringify(tasks, null, 2)}
        `;

        return prompt;
      }),
      switchMap((prompt) =>
        from(
          this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'Eres un asistente experto en optimización de flujos de trabajo en tableros Trello.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7
          })
        )
      ),
      map(res => res.choices[0]?.message?.content ?? 'Sin respuesta')
    );
  }
}
