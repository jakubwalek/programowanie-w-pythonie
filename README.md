# Karta pracy Python: Instrukcje warunkowe

Interaktywna aplikacja edukacyjna (React + Vite + Tailwind CSS + Lucide React) z kartą pracy dla ucznia i panelem weryfikacji tokenu dla nauczyciela. Cała logika działa w przeglądarce — **bez backendu**.

## Uruchomienie

```bash
npm install
npm run dev
```

## Build i wdrożenie na GitHub Pages

1. W pliku `[vite.config.ts](vite.config.ts)` ustaw `repoName` na **dokładną nazwę repozytorium** na GitHubie (ścieżka strony będzie `https://<user>.github.io/<repoName>/`).
2. Zbuduj z właściwym `base` (zmienna środowiskowa `GH_PAGES`):

```bash
GH_PAGES=true npm run build
```

1. Wdróż folder `dist` na gałąź `gh-pages` (skrypt w `package.json`):

```bash
npm run deploy
```

1. W ustawieniach repozytorium GitHub: **Settings → Pages** — źródło: gałąź `**gh-pages`**, folder `**/**` (root).

> Lokalny podgląd buildu: `npm run preview`

## Algorytm sumy kontrolnej tokenu

Token to łańcuch pól rozdzielonych znakiem `|`:

`IF_ELSE_LAB | klasa | nazwisko_san | imię_san | punkty | max | długość_nazwiska | praktyka | suma | sól`

- **Sanityzacja** pól tekstowych: spacje → `_`, dozwolone znaki alfanumeryczne, `_`, `-`, maks. długość segmentu.
- **długość_nazwiska**: liczba znaków w nazwisku **po `trim`**, liczona jak w JavaScript (`string.length`, pełne znaki Unicode).
- **praktyka**: `1` jeśli laboratorium jest zaliczone (walidacja składni), `0` w przeciwnym razie.

**Suma kontrolna** (liczba całkowita):

```text
suma = punkty × 7 + max × 3 + długość_nazwiska + (praktyka_zaliczona ? 50 : 0)
```

Przy weryfikacji nauczyciel odtwarza `suma` z pól tokenu i porównuje z zapisanym polem. Zgodność potwierdza spójność danych; **nie jest to kryptografia** — suma chroni przed przypadkową edycją, nie przed świadomym fałszowaniem.

## Punktacja (domyślnie)


| Moduł        | Max |
| ------------ | --- |
| Quiz (5×1)   | 5   |
| Laboratorium | 3   |
| Symulator    | 1   |
| **Razem**    | 9   |


Ocena szkolna 1–6 jest wyliczana procentowo z uzyskanego wyniku i maksimum.

## Licencja

Projekt edukacyjny — do swobodnego użytku w klasie.