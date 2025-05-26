import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { By } from '@angular/platform-browser';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe aplicar clases de visibilidad correctamente cuando isVisible es true', () => {
    component.isVisible = true;
    fixture.detectChanges();

    const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
    const container = fixture.debugElement.query(By.css('.modal-container'));

    expect(backdrop.classes['opacity-100']).toBeTrue();
    expect(container.classes['opacity-100']).toBeTrue();
    expect(container.classes['translate-y-0']).toBeTrue();
  });

  it('debe aplicar clases de ocultamiento correctamente cuando isVisible es false', () => {
    component.isVisible = false;
    fixture.detectChanges();

    const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
    const container = fixture.debugElement.query(By.css('.modal-container'));

    expect(backdrop.classes['opacity-0']).toBeTrue();
    expect(container.classes['opacity-0']).toBeTrue();
    expect(container.classes['translate-y-4']).toBeTrue();
  });

  it('debe llamar a close() al hacer clic en el botón de cerrar', () => {
    spyOn(component, 'close');
    const closeButton = fixture.debugElement.query(By.css('button'));
    closeButton.nativeElement.click();
    expect(component.close).toHaveBeenCalled();
  });

  it('debe llamar a close() al hacer clic en el backdrop (fuera del modal)', () => {
    spyOn(component, 'close');
    const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
    // Simulamos click en el backdrop: target y currentTarget coinciden
    backdrop.triggerEventHandler('click', {
      target: backdrop.nativeElement,
      currentTarget: backdrop.nativeElement
    } as MouseEvent);
    expect(component.close).toHaveBeenCalled();
  });

  it('no debe llamar a close() si se hace clic dentro del modal', () => {
    spyOn(component, 'close');
    const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
    const container = fixture.debugElement.query(By.css('.modal-container'));
    // Simulamos click en el interior: target es el container, currentTarget el backdrop
    backdrop.triggerEventHandler('click', {
      target: container.nativeElement,
      currentTarget: backdrop.nativeElement
    } as MouseEvent);
    expect(component.close).not.toHaveBeenCalled();
  });
});
