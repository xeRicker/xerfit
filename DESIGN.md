---
name: XERFIT
description: Dark, mobile-first tracker progresu w treningu siłowym. Neonowa limonka oznacza akcję, postęp i rekord.
colors:
  brand-lime: "#C6FF00"
  brand-lime-hover: "#D6FF3D"
  brand-lime-pressed: "#A8DC00"
  brand-lime-subtle: "#26310A"
  brand-lime-dimmer: "#1A2207"
  app-black: "#070806"
  surface-dark: "#141613"
  surface-raised: "#1C1F1A"
  surface-overlay: "#242821"
  text-primary: "#F4F7EF"
  text-secondary: "#B4BCA9"
  text-muted: "#838B79"
  success: "#9BE564"
  danger: "#FF7A6B"
  warning: "#FFC94D"
  info: "#7BC6FF"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "46px"
    fontWeight: 800
    fontStyle: italic
    lineHeight: 0.95
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "27px"
    fontWeight: 700
    fontStyle: italic
    lineHeight: 1.05
  heading:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    fontStyle: italic
    lineHeight: 1.1
  body:
    fontFamily: "Barlow, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Barlow, -apple-system, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: "Barlow, -apple-system, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.06em"
rounded:
  sm: "8px"
  md: "14px"
  lg: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.brand-lime}"
    textColor: "{colors.app-black}"
    rounded: "{rounded.sm}"
    minHeight: "48px"
    padding: "0 16px"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    minHeight: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.sm}"
    minHeight: "48px"
  card:
    backgroundColor: "{colors.surface-dark}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    minHeight: "48px"
    padding: "0 12px"
  number-display:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-primary}"
    fontFamily: "Barlow Condensed italic"
    fontSize: "46px"
    fontWeight: 800
---

# Design System: XERFIT

Treningowy, głośny, czytelny z odległości wyciągniętej ręki. Czarny canvas, ciemne karty i jedna limonka, która zawsze coś znaczy.

## Hard limits
- **Wyłącznie dark mode.** Bez trybu jasnego, bez przełącznika, bez `prefers-color-scheme`.
- **7 stopni tekstu (46 / 30 / 27 / 19 / 15 / 13 / 12).** Duże liczby i nagłówki to zawsze Barlow Condensed italic; tekst interfejsu to Barlow. Bez nowych rozmiarów — przepełnienie rozwiązuje zawijanie i layout.
- **Spacing tylko ze skali** (4, 8, 12, 16, 20, 24, 32). Bez dowolnych pikseli.
- **Kolory tylko z tokenów.** Żadnych gradientów (poza wypełnieniem wykresu), czystej bieli ani czystej czerni jako kontrastu.
- **Każdy element dotykowy ma minimum 48px.** Główne akcje mają 60px i siedzą na dole ekranu.
- **Budżet limonki: około 10% powierzchni.** Jeśli wszystko jest limonkowe, nic nie jest.

## Color
- Limonka oznacza akcję, aktywny stan, postęp i rekord. Nigdy dekorację.
- Hover `brand-lime-hover`, pressed `brand-lime-pressed`. Aktywny stan to wypełnienie `brand-lime-dimmer` plus obwódka limonkowa.
- Tekst na wypełnionej limonce to zawsze `app-black`.
- `text-primary` dla wartości, `text-secondary` dla opisów, `text-muted` dla metadanych i podpisów osi.
- Kolory semantyczne (`success`, `danger`, `warning`, `info`) służą tylko statusowi: zapis do GitHuba, plateau, walidacja. Nigdy jako drugi akcent.
- Wykresy: linia `brand-lime` na `app-chart-grid`, wypełnienie pod linią z przezroczystością limonki.

## Typography
- Display 46/800 italic: wartość wpisywanego ciężaru i powtórzeń. Title 27/700 italic: nagłówek widoku i nazwa ćwiczenia w trybie treningu. Heading 19/700 italic: nagłówki kart i pozycja w serii. Body 15/400: listy, opisy, formularze. Label 13/500: treść przycisków i pól. Caption 12/700 z `+0.06em`: etykiety pól i statusy (uppercase).
- Nagłówki są pisane wersalikami przez CSS (`text-transform: uppercase`), więc w danych trzymamy normalną wielkość liter.
- Wszystkie liczby, które się zmieniają, używają `font-variant-numeric: tabular-nums`, żeby wartości nie skakały.

## Layout
- Mobile-first: jedna kolumna, kontener do 560px, padding 16px. Szerokość odniesienia to 390px.
- Cztery widoki: Plan (zakładki → splity → ćwiczenia), Ćwiczenia (globalny katalog), Historia (treningi + progresja), Ustawienia. Dolna nawigacja ma cztery pozycje i jest stała.
- Ćwiczenia są globalne, splity należą do zakładki. Pasek zakładek przewija się poziomo i pokazuje, na czym pracujesz — reszta widoku należy do wybranej zakładki.
- Tryb treningu ukrywa nawigację dolną: cały ekran należy do jednego ćwiczenia, a nawigacja między ćwiczeniami to strzałki w górnym pasku.
- Akcje główne siedzą w zasięgu kciuka: dolny pasek akcji albo przycisk `position: fixed` nad nawigacją, z zapasem `padding-bottom` w treści, żeby nic nie zasłaniał.
- Sekcje rozdzielamy większym oddechem (20–24px), elementy w grupie mniejszym (8–12px).

## Depth and shape
- Głębokość budujemy tonem powierzchni, nie cieniem. Cień tylko dla warstw unoszących się: arkusza dolnego i dialogu.
- Karty: `surface-dark` + cienka obwódka `app-border`, promień 14px. Kontrolki: 8px. Statusy i przełączniki: pill.
- Obwódki są cienkie i chłodne (odcień limonki), mocniejsze przy hover, fokusie i stanie aktywnym.
- Fokus klawiatury: obwódka limonkowa 2px z odstępem 2px. Nigdy nie usuwamy fokusu.

## Components
- **Button primary:** limonkowe tło, czarny tekst, 8px promienia, minimum 48px, wariant `--large` 60px dla akcji w trybie treningu i na dole ekranu.
- **Button secondary:** `surface-raised` z mocniejszą obwódką. **Ghost:** przezroczysty, `text-secondary`. **Danger:** tylko obwódka i tekst `danger` — do usuwania.
- **Container tabs (zakładki):** poziomy pasek przewijanych chipów nad treścią planu. Aktywna zakładka ma limonkowy tekst, limonkową obwódkę i tło `brand-lime-dimmer`. Ostatni chip to przerywany „+” na nową zakładkę.
- **Stepper wartości:** duże pole numeryczne w Barlow Condensed italic pomiędzy dwoma przyciskami +/− po 60px. Obsługuje wpisanie wartości z klawiatury numerycznej telefonu.
- **Set chip:** wiersz serii z numerem lub checkiem, wartością `ciężar × powtórzenia` i akcjami edycji oraz usunięcia. Stan zapisany to limonkowe tło i limonkowa obwódka, stan aktywny dostaje dodatkowy pierścień. Sesja startuje z jednym chipem — przycisk usunięcia pojawia się dopiero przy drugiej serii, a „Dodaj serię” jest zawsze widoczny.
- **Logger:** jedno pole ciężaru i jedno pole powtórzeń na ekranie. Kolejne serie dodajesz świadomie, nie są wypełniane z góry. Pasek akcji trybu treningu (Pomiń + Zapisz serię, 60px) siedzi na stałe na dole ekranu, nie w treści strony — kciuk ma go pod ręką, a treść robi zapas miejsca.
- **Badge progresji:** mały, pod polem wpisywania, w trzech wariantach: `up` (limonka, dołożenie ciężaru lub powtórzenia), `hold` (warning, utrzymanie ciężaru), `down` (info, zejście z ciężarem). Nigdy nie zasłania pól.
- **Wykresy:** własne SVG, nie biblioteka. Limonkowa linia, numeryczne etykiety osi, kropki z tooltipem. Jeden wykres na ćwiczenie, przełączany metrykami (ciężar, 1RM, powtórzenia, objętość).
- **Feedback:** `dialogService` (alert / confirm / confirmDanger / prompt), `sheetService` (arkusz dolny do wyboru ćwiczenia z katalogu i formularzy) i `notify` (toast). Bez natywnych `alert`, `confirm`, `prompt` i bez natywnych `select`.
- **Pasek zapisu:** pojawia się tylko wtedy, gdy jest co zapisać — ciemna pływająca karta (Cofnij + Zapisz) nad dolną nawigacją, znikająca po zapisaniu. Nigdy nie jest widoczny bez zmian.
- **Icons:** Material Symbols Rounded jako znaczniki funkcji, nie ozdoby.

## Copy
- Etykiety krótkie i mówiące, co robi akcja: „Zapisz serię”, „Startuj”, „Pomiń ćwiczenie”, „Zakończ trening”.
- Nazwa przycisku opisuje jego prawdziwy skutek, nie sąsiedni.
- Kontener nazywamy „zakładką” w interfejsie (nazwy własne to miesiące), a w kodzie i danych zostaje `container`.
- Nie powtarzamy słów, które już są w nagłówku sekcji.
- Jednostki trzymamy w `kg` i `powt.`, zakres zawsze w formie `6–10 powt.`.

## Do
- Trzymaj tę samą formę dla rzeczy pokrewnych: seria zawsze wygląda jak set chip, status zawsze jak badge, zapis zawsze jak save status.
- Pokazuj poprzedni wynik obok aktualnego wpisywania — to jest cała wartość aplikacji.
- Utrzymuj duże pola dotykowe i czytelne liczby; aplikacja działa w hałasie siłowni i w jednej ręce.
- Projektuj najpierw dla 390px, potem sprawdź szerszy ekran.

## Don't
- Nie dodawaj kart w kartach ani efektów, które kosztują czytelność.
- Nie dodawaj gradientów, blurów poza nagłówkiem nawigacji, ani skeuomorfizmu.
- Nie zmieniaj formatu danych, funkcji ani zachowania kontrolek przy pracy nad warstwą wizualną.
- Nie ukrywaj postępu za interakcją — sugestia progresji jest widoczna od razu, bez tapnięcia.
