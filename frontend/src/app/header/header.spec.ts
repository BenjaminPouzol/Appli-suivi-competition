import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    // On repart d'un etat connu : sans ca, un test laisserait le theme
    // modifie et le suivant partirait d'une situation imprevisible.
    document.documentElement.dataset['theme'] = 'clair';
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the three navigation links', () => {
    const liens = (fixture.nativeElement as HTMLElement).querySelectorAll('.navigation a');
    expect(liens.length).toBe(3);
  });

  it('bascule du theme clair vers le theme sombre au clic', async () => {
    const bouton = (fixture.nativeElement as HTMLElement).querySelector(
      '.bascule-theme',
    ) as HTMLButtonElement;

    expect(component.theme()).toBe('clair');

    bouton.click();
    await fixture.whenStable();

    expect(component.theme()).toBe('sombre');
    expect(document.documentElement.dataset['theme']).toBe('sombre');
  });

  it('retient le choix du theme dans le stockage du navigateur', () => {
    component.basculerTheme();
    expect(localStorage.getItem('theme')).toBe('sombre');

    component.basculerTheme();
    expect(localStorage.getItem('theme')).toBe('clair');
  });
});
