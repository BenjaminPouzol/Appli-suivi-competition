import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { INTERVALLE_ACTUALISATION_MS, MatchDetail } from './match-detail';
import { OM, PSG, detailsApi, matchApi, partieLol } from '../../../testing/details-de-test';

const URL = 'http://localhost:3000/api/matchs/m1/details';

/** Un match de League of Legends en direct : partie 1 gagnee, partie 2 en cours. */
const LOL_EN_DIRECT = detailsApi(matchApi('en-direct'), {
  discipline: 'lol',
  parties: [partieLol(1, 'domicile'), partieLol(2, null)],
});

/** Le meme match, termine. */
const LOL_TERMINE = detailsApi(matchApi('termine', undefined, undefined, [2, 0]), {
  discipline: 'lol',
  parties: [partieLol(1, 'domicile'), partieLol(2, 'domicile')],
});

/*
 * La page s'actualise avec un minuteur de 30 secondes. Attendre VRAIMENT 30
 * secondes rendrait les tests interminables : vi.useFakeTimers() remplace
 * l'horloge par une horloge simulee, que le test fait avancer a la main avec
 * vi.advanceTimersByTime(). Trente secondes passent alors instantanement.
 *
 * Elle doit etre installee AVANT la creation du composant : c'est a ce
 * moment que le minuteur est lance.
 */
describe('MatchDetail (etape 10)', () => {
  let fixture: ComponentFixture<MatchDetail>;
  let composant: MatchDetail;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchDetail],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        // La page lit l'identifiant du match dans l'adresse : on lui fournit
        // une « fausse » route qui contient seulement ce dont elle a besoin.
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'm1' }) } } },
      ],
    }).compileComponents();

    vi.useFakeTimers();
    fixture = TestBed.createComponent(MatchDetail);
    composant = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Detruire le composant arrete le minuteur (takeUntilDestroyed).
    fixture.destroy();
    vi.useRealTimers();
    httpMock.verify();
  });

  /** Le premier « tic » du minuteur part tout de suite (delai 0). */
  function premierTic(): void {
    vi.advanceTimersByTime(1);
  }

  function ticSuivant(): void {
    vi.advanceTimersByTime(INTERVALLE_ACTUALISATION_MS);
  }

  function page(): HTMLElement {
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('charge le detail et affiche le panneau de la discipline', () => {
    premierTic();
    httpMock.expectOne(URL).flush(LOL_EN_DIRECT);

    expect(composant.details()?.discipline).toBe('lol');
    expect(page().querySelector('h1')?.textContent).toContain('Karmine Corp');
    expect(page().querySelector('h1')?.textContent).toContain('1 – 0');
    expect(page().querySelector('app-panneau-lol')).not.toBeNull();
    expect(page().querySelector('app-panneau-football')).toBeNull();
  });

  it('affiche le panneau de football pour un match de football', () => {
    premierTic();
    httpMock
      .expectOne(URL)
      .flush(detailsApi(matchApi('termine', PSG, OM, [0, 0]), { discipline: 'football', statistiques: null, buts: [] }));

    expect(page().querySelector('app-panneau-football')).not.toBeNull();
    expect(page().querySelector('app-panneau-lol')).toBeNull();
  });

  it('se recharge toutes les 30 secondes tant que le match est en direct, puis s\'arrete', () => {
    premierTic();
    httpMock.expectOne(URL).flush(LOL_EN_DIRECT);

    // 30 secondes plus tard : nouvelle requete. Le match s'est termine entre-temps.
    ticSuivant();
    httpMock.expectOne(URL).flush(LOL_TERMINE);
    expect(composant.details()?.match.scoreDomicile).toBe(2);

    // Le match est termine : plus rien ne part.
    ticSuivant();
    ticSuivant();
    httpMock.expectNone(URL);
  });

  it("n'empile pas les requetes si le serveur tarde a repondre (exhaustMap)", () => {
    premierTic();
    // 30 secondes passent sans que le serveur reponde a la premiere requete.
    ticSuivant();

    // expectOne echoue s'il trouve DEUX requetes. Avec mergeMap, le second tic
    // en aurait lance une autre ; avec switchMap, il aurait annule la
    // premiere pour en lancer une nouvelle. exhaustMap a ignore le tic.
    const requete = httpMock.expectOne(URL);
    expect(requete.cancelled).toBe(false);
    requete.flush(LOL_EN_DIRECT);

    expect(composant.details()).not.toBeNull();
  });

  it('garde les chiffres affiches quand une actualisation echoue, et reessaie', () => {
    premierTic();
    httpMock.expectOne(URL).flush(LOL_EN_DIRECT);

    ticSuivant();
    httpMock.expectOne(URL).flush('Indisponible', { status: 500, statusText: 'Erreur interne' });

    // Les donnees precedentes sont toujours la ; un message previent du retard.
    expect(composant.details()).not.toBeNull();
    expect(composant.erreur()).toContain('dernière actualisation a échoué');

    // L'actualisation continue malgre l'erreur, et efface le message.
    ticSuivant();
    httpMock.expectOne(URL).flush(LOL_EN_DIRECT);
    expect(composant.erreur()).toBeNull();
  });

  it("signale un match introuvable, et n'insiste pas", () => {
    premierTic();
    httpMock.expectOne(URL).flush({ erreur: 'Match introuvable' }, { status: 404, statusText: 'Not Found' });

    expect(composant.introuvable()).toBe(true);
    expect(page().textContent).toContain("Ce match n'existe pas");

    ticSuivant();
    httpMock.expectNone(URL);
  });
});
