import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';
import { AuthService } from '../services/auth';
import { fabriquerJeton } from '../../testing/jetons-de-test';

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

  it('should expose the five navigation links', () => {
    const liens = (fixture.nativeElement as HTMLElement).querySelectorAll('.navigation a');
    // Etape 9 : ajout du lien « Équipes ».
    expect(liens.length).toBe(5);
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

  describe('session (etape 8)', () => {
    function zoneSession(): HTMLElement {
      return (fixture.nativeElement as HTMLElement).querySelector('.session') as HTMLElement;
    }

    /**
     * Recree le bandeau avec un jeton deja present dans le stockage, comme
     * apres un rechargement de page. Le service de session lit le stockage a
     * sa creation : il faut donc repartir d'un module de test neuf.
     */
    async function recreerConnecte(role: 'utilisateur' | 'administrateur'): Promise<void> {
      TestBed.resetTestingModule();
      localStorage.setItem('jeton', fabriquerJeton({ pseudo: 'Benjamin', role }));

      await TestBed.configureTestingModule({
        imports: [Header],
        providers: [provideRouter([])],
      }).compileComponents();

      fixture = TestBed.createComponent(Header);
      component = fixture.componentInstance;
      await fixture.whenStable();
    }

    it('propose de se connecter a une personne anonyme', () => {
      expect(zoneSession().textContent).toContain('Connexion');
      expect(zoneSession().textContent).not.toContain('Déconnexion');
    });

    it('affiche le pseudo et le role administrateur', async () => {
      await recreerConnecte('administrateur');

      expect(zoneSession().textContent).toContain('Benjamin');
      expect(zoneSession().querySelector('.session-role')?.textContent).toContain('admin');
    });

    it("n'affiche pas de badge pour un simple utilisateur", async () => {
      await recreerConnecte('utilisateur');

      expect(zoneSession().querySelector('.session-role')).toBeNull();
    });

    it('deconnecte au clic sur « Déconnexion »', async () => {
      await recreerConnecte('utilisateur');

      (zoneSession().querySelector('button') as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(TestBed.inject(AuthService).estConnecte()).toBe(false);
      expect(zoneSession().textContent).toContain('Connexion');
    });
  });
});
