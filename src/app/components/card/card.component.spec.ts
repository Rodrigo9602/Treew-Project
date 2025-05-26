import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { By } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { TrelloCard } from '../../services/authorization.service';

describe('CardComponent (Integration Test)', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  const mockCard: TrelloCard = {
    id: '68340727f440b867356abd91',
    name: 'Añadir funcionalidad para ordenar tarjetas en un mismo listado',
    desc: '',
    url: 'https://trello.com/c/DeCOO4Rx/28-a%C3%B1adir-funcionalidad-para-ordenar-tarjetas-en-un-mismo-listado',
    idBoard: '683201c6bc5b07e6f368b566',
    idList: '683202cc6c968dd8b0f4a321',
    closed: false,
    due: '2025-05-26T07:45:00.000Z',
    dueComplete: true,
    dueReminder: -1,
    start: null,
    pos: 100,
    dateLastActivity: '2025-05-26T07:33:58.215Z',
    subscribed: false,
    isTemplate: false,
    cardRole: null,
    address: null,
    locationName: null,
    labels: [
      { name: 'Backend', color: 'blue', id: '', idBoard: '', uses: 0 },
      { name: 'Urgente', color: 'red', id: '', idBoard: '', uses: 0 }
    ],
    stickers: [],
    checklists: [
      {
        id: 'chk1',
        checkItems: [
          { state: 'complete', id: 'chkItem1', name: 'Task 1', nameData: null, pos: 1, idChecklist: '', idMember: null, due: null },
          { state: 'incomplete', id: '', name: '', nameData: undefined, pos: 0, idChecklist: '', idMember: null, due: null }
        ],
        name: '',
        idBoard: '',
        idCard: '',
        pos: 0
      }
    ],
    checkItemStates: [],
    pluginData: [],
    customFieldItems: [],
    members: [],
    idMembers: [],
    idChecklists: [],
    badges: {
      votes: 0,
      viewingMemberVoted: false,
      subscribed: false,
      fogbugz: '',
      checkItems: 0,
      checkItemsChecked: 0,
      checkItemsEarliestDue: null,
      comments: 0,
      attachments: 0,
      description: false,
      due: null,
      dueComplete: false,
      start: null,
      location: false
    },
    cover: null,
    idMembersVoted: [],
    limits: {
      attachments: {
        perCard: { status: '', disableAt: 0, warnAt: 0 }
      }
    },
    coordinates: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;

    component.card = mockCard;
    component.priority = 'high';
    component.checklistProgress = {
      completed: 1,
      total: 2,
      percentage: 50
    };

    fixture.detectChanges();
  });

  it('debe renderizar el nombre de la tarjeta', () => {
    const titleEl = fixture.debugElement.query(By.css('h3')).nativeElement;
    expect(titleEl.textContent.trim()).toBe(mockCard.name);
  });

  it('debe mostrar el color correcto del indicador de prioridad', () => {
    const circle = fixture.debugElement.query(By.css('div.rounded-full'));
    expect(circle.nativeElement.classList).toContain('bg-red-500'); // 'high' => rojo
  });

  it('debe mostrar la fecha de vencimiento en formato corto', () => {
    const dateSpan = fixture.debugElement.query(By.css('.text-xs span')).nativeElement;
    const expectedDate = mockCard.due ? formatDate(mockCard.due, 'short', 'en-US') : '';
    expect(dateSpan.textContent).toContain(expectedDate);
  });

  it('debe renderizar todas las etiquetas', () => {
    const labels = fixture.debugElement.queryAll(By.css('.flex.flex-wrap span'));
    expect(labels.length).toBe(2);
    expect(labels[0].nativeElement.textContent).toContain('Backend');
    expect(labels[1].nativeElement.textContent).toContain('Urgente');
  });

  it('debe renderizar correctamente el progreso del checklist', () => {
    // texto "1/2"
    const progressText = fixture.debugElement
      .query(By.css('.text-xs.text-slate-500.mb-1'))
      .nativeElement;
    expect(progressText.textContent).toContain('1/2');

    // ancho inline style: "50%"
    const progressBarEl: HTMLElement = fixture.debugElement
      .query(By.css('.bg-blue-500'))
      .nativeElement;
    expect(progressBarEl.style.width).toBe('50%');
  });

  it('debe llamar a onCardOpen al hacer clic en el botón de acción', () => {
    spyOn(component, 'onCardOpen');
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();
    expect(component.onCardOpen).toHaveBeenCalledWith(mockCard);
  });
});
