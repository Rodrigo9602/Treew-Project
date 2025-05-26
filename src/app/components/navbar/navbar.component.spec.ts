import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { Directive, Input } from '@angular/core';

import { NavbarComponent } from './navbar.component';
import { NavItemComponent } from './nav-item/nav-item.component';
import { TrelloAuthService } from '../../services/authorization.service';
import { SidebarService } from '../../services/components/sidebar.service';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { AinalysisComponent } from '../../pages/ainalysis/ainalysis.component';


@Directive({ selector: 'img[ngSrc]' })
class MockNgOptimizedImageDirective {
  @Input() ngSrc: string = '/assets/images/logo.png';
  @Input() width!: number | string;
  @Input() height!: number | string;
  @Input() priority!: boolean;
}

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let component: NavbarComponent;
  let trelloAuthSpy: jasmine.SpyObj<TrelloAuthService>;
  let sidebarStub: { stateChange$: any; setMenuExpanded: jasmine.Spy };

  const activatedRouteStub = {
    snapshot: { data: { items: [] } },
    data: of({ items: [] })
  };

  beforeEach(async () => {    
    trelloAuthSpy = jasmine.createSpyObj('TrelloAuthService', ['logout']);
    sidebarStub = {
      stateChange$: of(false),
      setMenuExpanded: jasmine.createSpy('setMenuExpanded')
    };

    await TestBed.configureTestingModule({
      imports: [
        NavbarComponent,       
        RouterModule.forRoot(
          [{path: '/dashboard', component: DashboardComponent}, {path: '/ainalyzis', component: AinalysisComponent}]
        )
      ],
      providers: [
        provideHttpClientTesting(),
        { provide: TrelloAuthService, useValue: trelloAuthSpy },
        { provide: SidebarService,    useValue: sidebarStub },
        { provide: ActivatedRoute,    useValue: activatedRouteStub }
      ]
    })    
    .overrideComponent(NavbarComponent, {
      set: {
        imports: [
          CommonModule,
          NavItemComponent,
          MockNgOptimizedImageDirective
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the logo image', () => {
    const img = fixture.debugElement.query(By.css('img[alt="logo-image"]'));
    expect(img).toBeTruthy();
  });  

  it('should call logout() when logout button is clicked', () => {
    const logoutBtn = fixture.debugElement
      .queryAll(By.css('button'))
      .find(btn => btn.nativeElement.textContent.includes('Cerrar Sesión'))!;
    logoutBtn.triggerEventHandler('click', null);
    expect(trelloAuthSpy.logout).toHaveBeenCalled();
  });

  it('should toggle "opened" state when sidebar button is clicked', () => {
    const sidebarBtn = fixture.debugElement.queryAll(By.css('button')).pop()!;
    sidebarBtn.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.opened).toBeTrue();
    expect(sidebarStub.setMenuExpanded).toHaveBeenCalledWith(true);
  });

  it('should apply correct classes when "opened" is true', () => {
    component.opened = true;
    fixture.detectChanges();
    const lines = fixture.debugElement.queryAll(By.css('button div'));
    expect(lines[0].nativeElement.className).toContain('rotate-[45deg]');
    expect(lines[1].nativeElement.className).toContain('opacity-0');
    expect(lines[2].nativeElement.className).toContain('rotate-[-45deg]');
  });
});
