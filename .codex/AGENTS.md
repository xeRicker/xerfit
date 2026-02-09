# AGENTS.md

Ten plik jest jedynym zrodlem prawdy dla agenta AI pracujacego nad tym projektem.
Kazde zadanie, kazdy komponent, kazda linijka kodu MUSI byc zgodna z ponizszymi zasadami.
Nie ma wyjatkow. Nie ma skrotow.


---


## O PROJEKCIE

Aplikacja webowa do liczenia kalorii i sledzenia makroskladnikow.
Dziala WYLACZNIE na urzadzeniach mobilnych (iPhone).
Nie projektujemy desktopa. Nie projektujemy tabletu.
Viewport referencyjny: iPhone 14 Pro (393x852 logical pixels).
Aplikacja ma wygladac i dzialac tak, jakby zaprojektowal ja Apple dla sportowcow.


---


## STACK TECHNOLOGICZNY

- Framework: Next.js 15 (App Router)
- Jezyk: TypeScript (strict mode)
- Styling: Tailwind CSS 4
- Animacje: Framer Motion
- Ikony: Lucide React (liniowe, cienkie, stroke width 1.5)
- Czcionka: Inter (Google Fonts) jako fallback dla SF Pro
- State management: Zustand
- Data fetching: @tanstack/react-query
- Utility CSS: clsx + tailwind-merge (helper cn())


---


## DESIGN SYSTEM — APPLE SPORT


### Filozofia

Styl wizualny laczacy najnowszy jezyk designu Apple (Liquid Glass z iOS 26)
z energetyczna, sportowa estetyka. Dominujacy kolor to neonowy pomaranczowy.
Calosc musi wygladac jak premium aplikacja fitness stworzona przez Apple —
czysta, oddychajaca, z mocnymi akcentami koloru na ciemnym lub jasnym tle.
Kazdy element interfejsu powinien wygladac jak szklany, polprzezroczysty panel
unoszacy sie nad tlem, podswietlony energetycznym pomaranczem.


### Kolor przewodni

Neonowy pomaranczowy: #FF6A00

Ten kolor jest sercem calej aplikacji. Pojawia sie w:
- Glownych przyciskach CTA
- Wypelnieniu progress ringow i paskow postępu
- Aktywnych zakladkach w TabBar
- Akcentach typograficznych (wyroznienia liczbowe, np. ilosc kalorii)
- Gradientach (od #FF6A00 do #FF9500 lub do #FF4D00)
- Glow effects pod kluczowymi elementami (shadow z kolorem pomaranczowym)

Nigdy nie uzywaj tego koloru do tekstu body.
Nigdy nie uzywaj go jako tlo pelnego ekranu.
Uzywa sie go punktowo — jak Apple uzywa niebieskiego, my uzywamy pomaranczowego.


### Paleta kolorow

JASNY TRYB (LIGHT MODE):

  Tlo glowne:               #F2F2F7
  Tlo kart (glass):          rgba(255, 255, 255, 0.55)
  Border glass:              rgba(255, 255, 255, 0.35)
  Tekst glowny:              #1C1C1E
  Tekst drugorzedny:         #8E8E93
  Tekst trzeciorzedn:        #C7C7CC
  Separator:                 rgba(0, 0, 0, 0.06)

CIEMNY TRYB (DARK MODE):

  Tlo glowne:                #000000 (pure black, OLED friendly)
  Tlo drugorzedne:           #1C1C1E
  Tlo kart (glass):          rgba(255, 255, 255, 0.08)
  Border glass:              rgba(255, 255, 255, 0.12)
  Tekst glowny:              #F5F5F7
  Tekst drugorzedny:         #8E8E93
  Tekst trzeciorzedn:        #48484A
  Separator:                 rgba(255, 255, 255, 0.06)

KOLORY AKCENTOWE (identyczne w obu trybach):

  Akcent glowny (orange):    #FF6A00
  Akcent gradient start:     #FF4D00
  Akcent gradient end:       #FF9500
  Akcent glow:               rgba(255, 106, 0, 0.25)

KOLORY MAKROSKLADNIKOW:

  Kalorie:                   #FF6A00  (pomaranczowy — kolor przewodni)
  Bialko:                    #0A84FF (elektryczny niebieski Apple)
  Weglowodany:               #30D158 (zielony Apple)
  Tluszcze:                  #FF375F (rozowy/czerwony — energetyczny)

KOLORY STANOW:

  Sukces:                    #30D158
  Ostrzezenie:               #FFD60A
  Blad:                      #FF453A
  Info:                      #0A84FF

Kolory makroskladnikow sa stale i niezmienne w calej aplikacji.
Gdziekolwiek pojawia sie bialko — jest niebieskie.
Gdziekolwiek pojawiaja sie weglowodany — sa zielone.
Gdziekolwiek pojawia sie tluszcz — jest rozowy.
Gdziekolwiek pojawiaja sie kalorie — sa pomaranczowe.
Bez wyjatkow.


### Glassmorphism — implementacja

Kazda karta, kazdy panel, kazdy kontener uzywa efektu glass:

  Jasny tryb:
    background: rgba(255, 255, 255, 0.55)
    backdrop-filter: blur(40px) saturate(180%)
    border: 1px solid rgba(255, 255, 255, 0.35)
    border-radius: 20px
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06)

  Ciemny tryb:
    background: rgba(255, 255, 255, 0.08)
    backdrop-filter: blur(40px) saturate(180%)
    border: 1px solid rgba(255, 255, 255, 0.12)
    border-radius: 20px
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3)

Dla elementow z akcentem pomaranczowym dodaj glow:
    box-shadow: 0 8px 32px rgba(255, 106, 0, 0.15)

Nigdy nie uzywaj ostrych krawedzi.
Minimalne zaokraglenie to rounded-xl (12px).
Standardowe zaokraglenie to rounded-2xl (16px).
Duze elementy (modals, sheets) to rounded-3xl (24px).


### Typografia

Hierarchia rozmiarow:

  Display:       36px / font-black / tracking-tight / leading-none
  Heading XL:    32px / font-bold / tracking-tight / leading-tight
  Heading L:     28px / font-bold / tracking-tight
  Heading M:     22px / font-semibold / leading-snug
  Heading S:     17px / font-semibold
  Body Large:    17px / font-regular / leading-relaxed
  Body:          15px / font-regular / leading-relaxed
  Caption:       13px / font-medium / text-secondary
  Overline:      11px / font-bold / uppercase / tracking-[0.08em] / text-tertiary

Zasady typograficzne:
- Liczby kaloryczne i makro: font-bold lub font-black, rozmiar wiekszy niz otaczajacy tekst
- Glowna liczba kalorii na dashboardzie: Display (36px), font-black, kolor #FF6A00
- Jednostki (kcal, g) obok liczb: Caption (13px), font-medium, text-secondary
- Nazwy produktow: Body Large, font-medium
- Marki/producenci: Caption, text-tertiary
- Naglowki sekcji (np. "Sniadanie"): Heading S, uppercase, tracking-wide, text-secondary


### Sportowy charakter

Co sprawia ze design jest sportowy:
- Duze, odwazne liczby (kalorie wyswietlane duzym, grubym fontem)
- Kontrastowe akcenty neonowego pomaranczowego na ciemnym tle
- Gradienty pomaranczowe na progress elementach (nie flat color)
- Delikatny glow/shine effect na aktywnych elementach
- Dynamiczne animacje (spring physics, energetyczne przejscia)
- Gorny naglowek moze zawierac subtelny gradient mesh w tle (pomaranczowo-czerwony, opacity 0.05-0.1)
- Osiagniecia i cele wizualizowane jak sportowe statystyki
- Energetyczna, ale nie przytlaczajaca kolorystyka

Czego unikac:
- Pastelowych, miekkich kolorow
- Zbyt okraglych, zabawkowych elementow
- Nudnych, plaskich layoutow bez hierarchii wizualnej
- Malych, slabo widocznych liczb — dane kaloryczne to GWIAZDY ekranu


### Gradienty

Gradient przewodni (Orange Energy):
  from: #FF4D00
  via:  #FF6A00
  to:   #FF9500
  Uzycie: progress ring fill, glowny CTA button, aktywny tab indicator

Gradient tla (Ambient Glow) — tylko ciemny tryb:
  Subtelny radialny gradient w tle ekranu:
  radial-gradient(ellipse at top, rgba(255, 106, 0, 0.06), transparent 60%)
  Dodaje ciepla i glebii bez rozpraszania

Gradient shimmer (skeleton loading):
  from: rgba(255,255,255,0.04)
  via:  rgba(255,255,255,0.08)
  to:   rgba(255,255,255,0.04)
  Animowany przesuw w prawo, petla


### Spacing i layout

- Padding ekranu (horizontal): 20px (px-5)
- Padding ekranu (top): env(safe-area-inset-top) + 16px
- Padding ekranu (bottom): env(safe-area-inset-bottom) + wysokosc TabBar + 16px
- Gap miedzy kartami: 12px (gap-3)
- Gap miedzy sekcjami: 24px (gap-6)
- Padding wewnatrz kart: 16px (p-4)
- Padding wewnatrz przyciskow: 12px 24px (py-3 px-6)
- Layout musi oddychac — duzo przestrzeni miedzy elementami
- Nigdy nie upychaj elementow — lepiej scrollowac niz scisnac


---


## ANIMACJE


### Biblioteki dozwolone do animacji

- Framer Motion — glowna biblioteka do wszelkich animacji
- @formkit/auto-animate — automatyczne animacje list (dodawanie/usuwanie)
- lottie-react — mikro-animacje (sukces, empty states, onboarding)
- CSS @keyframes i transition — tylko dla prostych stanow (shimmer, pulse)

Inne biblioteki animacji sa dozwolone jezeli sa lekkie, popularne
i rozwiazuja konkretny problem lepiej niz powyzsze.
Przed uzyciem sprawdz rozmiar bundle — nie wiecej niz 15KB gzipped.


### Zasady animacji

KAZDA zmiana stanu wizualnego MUSI byc animowana.
Nie ma skokow. Elementy wchodza, wychodza i zmieniaja sie plynnie.
Animacje musza byc szybkie i responsywne — nigdy powolne i ciezkie.
Uzytkownik nigdy nie powinien czekac na zakonczenie animacji zeby wykonac akcje.

Czasy trwania:

  Mikro-interakcja (tap, toggle):           150-200ms
  Pojawienie sie elementu:                  250-350ms
  Przejscie miedzy stronami:               350-450ms
  Spring (drag, swipe, bounce):             stiffness 300, damping 30
  Stagger delay miedzy elementami listy:    40-60ms na element

Easing:

  Standardowy ease-out:      cubic-bezier(0.25, 0.46, 0.45, 0.94)
  Energetyczny (sportowy):   cubic-bezier(0.22, 1, 0.36, 1)
  Spring:                    type: "spring", stiffness: 300, damping: 30

Wzorce Framer Motion:

  Wejscie elementu (fade + slide up):
    initial: { opacity: 0, y: 20 }
    animate: { opacity: 1, y: 0 }
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }

  Wyjscie elementu:
    exit: { opacity: 0, y: -10, scale: 0.98 }

  Tap feedback:
    whileTap: { scale: 0.97 }

  Stagger kontener:
    staggerChildren: 0.05

  Spring dla drag/swipe:
    transition: { type: "spring", stiffness: 300, damping: 30 }


### Przejscia miedzy stronami

Nawigacja wykorzystuje AnimatePresence z Framer Motion.
Nowa strona wjezdza z prawej (x: 100% do x: 0), stara wyjezdza w lewo.
Cofanie: odwrotny kierunek.
Wszystko z lekkim fade (opacity 0 do 1).
Czas: 350-450ms, easing energetyczny.


### Ladowanie danych

Skeleton loading z pulsujacym shimmer efektem.
Nigdy nie uzywaj spinnerow.
Nigdy nie pokazuj bialego/pustego ekranu.
Skeleton musi odzwierciedlac ksztalt docelowej tresci.


### Progress i liczniki

Circular progress ring: animowany fill od 0 do wartosci docelowej.
Liczby kaloryczne: animowane count-up (0 do wartosci) przy wejsciu na ekran.
Macro bars: animowane fill od lewej do prawej.
Wszystko z easing ease-out, czas 600-800ms.


---


## SPOJNOSC KOMPONENTOW


### Zelazna zasada

KAZDY element danego typu MUSI wygladac IDENTYCZNIE w calej aplikacji.
Jesli istnieje komponent — UZYJ GO. Nie tworz wariantow ad-hoc.
Jesli potrzebujesz nowego wariantu — dodaj go do istniejacego komponentu jako prop.


### Strzalki nawigacyjne

Wszystkie strzalki nawigacyjne w aplikacji uzywaja jednego wspolnego komponentu.
Rozmiar ikony: 20px.
Stroke width: 1.5px.
Kolor: text-secondary.
Strzalka wstecz: chevron-left.
Strzalka dalej: chevron-right.
Strzalka rozwin: chevron-down.
Nigdy nie mieszaj stylow strzalek.
Nigdy nie uzywaj innej grubosci linii.
Nigdy nie zmieniaj rozmiaru strzalek w roznych miejscach.


### Przyciski

Warianty:
  primary:     gradient pomaranczowy (#FF4D00 do #FF9500), bialy tekst, glow shadow
  secondary:   glass background, tekst w kolorze primary, border glass
  ghost:       transparent, tekst w kolorze primary, bez borderu
  danger:      glass background, tekst czerwony (#FF453A)

Kazdy przycisk:
  - Minimalny rozmiar dotyku: 44x44px
  - Border radius: rounded-full dla przyciskow akcji, rounded-2xl dla szerokich
  - whileTap scale: 0.97
  - Stan disabled: opacity 0.35, pointer-events none, brak efektow hover/active
  - Stan loading: spinner wewnatrz przycisku, przycisk nie zmienia rozmiaru


### Karty

Zawsze glass effect.
Zawsze rounded-2xl (16px) lub rounded-3xl (24px) dla duzych.
Zawsze padding p-4.
Zawsze subtelny shadow.
Zawsze animacja wejscia (fade + slide up).


### Inputy

Glass background.
Border: 1px solid rgba(255,255,255,0.15).
Border radius: rounded-xl.
Padding: py-3 px-4.
Font size: 17px (Body Large).
Focus state: ring-2 ring-[#FF6A00]/30.
Error state: ring-2 ring-[#FF453A]/40 + tekst bledu ponizej.
Placeholder: text-tertiary.


### Dolny TabBar

Fixed na dole ekranu.
Glass background z mocnym blur.
Bezpieczny padding na dole (safe-area-inset-bottom).
Aktywna zakladka: ikona i tekst w kolorze #FF6A00.
Nieaktywna zakladka: ikona i tekst w kolorze text-tertiary.
Przycisk dodawania (srodkowy): wiekszy, uniesiony, gradient pomaranczowy, glow.
Animacja przelaczania zakladek: plynna zmiana koloru, spring.


---


## UX/UI — NAJLEPSZE PRAKTYKI


### Stany interaktywne

Kazdy interaktywny element MUSI miec zdefiniowane wszystkie stany:

  Default:       Normalny wyglad
  Pressed:       whileTap scale 0.97 + opacity 0.85
  Disabled:      opacity 0.35, pointer-events none, BRAK efektow hover/active
  Loading:       Skeleton shimmer LUB spinner wewnatrz (element nie zmienia rozmiaru)
  Focused:       ring-2 w kolorze akcentu z opacity 0.3
  Error:         ring-2 w kolorze bledu + tekst bledu ponizej
  Success:       Krotka animacja checkmark + zmiana koloru na zielony

Jesli przycisk jest disabled — NIE MOZE reagowac na dotyk.
Nie moze zmieniac wygladu. Nie moze byc podswietlony.
Wyglada jak martwy element.


### Zasady dotykowe

- Minimalny rozmiar elementu klikalnego: 44x44px (Apple Human Interface Guidelines)
- Tap targets nie moga na siebie nachodzic
- Kazdy klikalny element MUSI miec feedback wizualny (scale + opacity)
- Swipe gestures na listach (np. swipe left to delete) z Framer Motion drag
- Scroll momentum naturalny
- Overscroll-behavior none na body (nie bounceuje tlo)
- Rubber band scrolling zostawiamy natywny na listach (Apple feel)


### Nawigacja

- Dolny TabBar (fixed) — glowna nawigacja
- Przycisk dodawania wyroztniony (wiekszy, gradient, uniesiony, glow)
- Nawigacja wewnetrzna: push/pop z animacja slide
- Nigdy nie uzywaj hamburger menu
- Back button zawsze w lewym gornym rogu — spojny komponent strzalki
- Tytul strony wycentrowany na gorze


### Formularze

- Klawiatura numeryczna (inputMode decimal) dla pol kalorycznych i wagowych
- Auto-focus na pierwszym polu przy otwarciu formularza
- Walidacja inline — natychmiastowy feedback, nie po submicie
- Przyciski submit sticky na dole aby zawsze byly widoczne
- Zamkniecie klawiatury przy tap poza inputem


### Listy

- Lazy loading z Intersection Observer
- Animowane dodawanie i usuwanie elementow (AnimatePresence)
- Sekcje z naglowkami sticky
- Empty states z ilustracja/animacja Lottie i CTA
- Nigdy pusta biala strona — zawsze jest cos do zobaczenia
- Stagger animation przy pierwszym renderze listy


### Bottom Sheets

- Wysuwane od dolu z drag handle na gorze
- Drag to dismiss (swipe down)
- Backdrop: ciemny overlay z blur, tap to dismiss
- Spring animation przy otwieraniu i zamykaniu
- Zaokraglone gorne rogi: rounded-t-3xl
- Glass background


---


## MOBILE-ONLY


### Viewport

- Projektujemy TYLKO dla szerokosci 375px do 430px
- Meta viewport: width=device-width, initial-scale=1, viewport-fit=cover
- Obsluga safe-area-inset: env(safe-area-inset-top), env(safe-area-inset-bottom)
- Padding top: safe area dla Dynamic Island / notch
- Padding bottom: safe area dla home indicator + TabBar
- NIGDY nie dodawaj breakpointow md, lg, xl — nie istnieja w tym projekcie


### PWA

- Manifest.json: display standalone
- Theme color zgodny z tlem aplikacji
- Apple meta tagi: apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style
- Splash screens dla iPhone
- Ikona aplikacji w stylu glass z pomaranczowym akcentem


---


## KONWENCJE KODU


### Nazewnictwo

  Komponenty:              PascalCase            (MacroChart.tsx)
  Pliki komponentow:       PascalCase.tsx         (BottomSheet.tsx)
  Hooki:                   useCamelCase           (useDiaryStore.ts)
  Utility functions:       camelCase              (calculateMacros.ts)
  Typy i interfejsy:       PascalCase             (FoodItem, MealType)
  Stale:                   SCREAMING_SNAKE_CASE   (MAX_DAILY_CALORIES)
  Foldery:                 kebab-case lub lower    (components/ui/)


### Komentarze

Ten projekt jest vibe-codowany.
NIE dodawaj komentarzy do kodu. Zadnych.
Kod powinien byc samodokumentujacy sie — czytelne nazwy zmiennych i funkcji.
Jedyny wyjatek: linki do zrodel (np. skad wzieta formula BMR).


### TypeScript

- Strict mode — zawsze
- Zero uzyc any — nigdy, pod zadnym pozorem
- Preferuj interface nad type dla obiektow
- Eksportuj typy z katalogu types — nie definiuj inline
- Uzywaj discriminated unions dla stanow (loading, success, error)
- Kazdy props interface MUSI byc zdefiniowany — nigdy nie uzywaj Record<string, any>


### Tailwind CSS

- Nigdy nie pisz custom CSS (zero plikow .css poza globals.css z dyrektywami tailwind)
- Definiuj kolory w tailwind.config.ts i uzywaj ich przez klasy semantyczne
- Uzywaj cn() helpera (clsx + tailwind-merge) do warunkowych klas
- Grupuj logicznie klasy w className: layout, spacing, typography, colors, effects


---


## DOZWOLONE BIBLIOTEKI ZEWNETRZNE

Dozwolone:

  framer-motion              Animacje
  zustand                    State management
  lucide-react               Ikony
  lottie-react               Mikro-animacje
  @formkit/auto-animate      Auto-animacja list
  clsx + tailwind-merge      Utility do klas CSS
  react-virtuoso             Wirtualizacja dlugich list (100+ elementow)
  date-fns                   Operacje na datach
  next-pwa                   PWA support
  @tanstack/react-query      Data fetching z cache

Inne biblioteki sa dozwolone jezeli:
- Sa lekkie (ponizej 15KB gzipped)
- Sa popularne i utrzymywane (1000+ stars na GitHub)
- Rozwiazuja konkretny problem lepiej niz wlasna implementacja
- Nie koliduja z Framer Motion w kwestii animacji
- Nie narzucaja wlasnego systemu stylowania

Zakazane:

- Biblioteki UI: MUI, Chakra, Ant Design, shadcn, Radix
- Frameworki CSS: Bootstrap, Bulma, Foundation
- Routing: react-router (uzywamy Next.js App Router)
- Ciezkie chart libraries: Chart.js, Recharts, D3 (uzywamy custom SVG + Framer Motion)
- jQuery
- Moment.js (uzywamy date-fns)


---


## DARK MODE

Obsluga dark mode jest WYMAGANA od pierwszego dnia.
Uzywaj dark: variant w Tailwind.
Przelacznik w ustawieniach + respektuj prefers-color-scheme jako domyslny.

Roznice miedzy trybami:
- Glass background: light rgba(255,255,255,0.55) vs dark rgba(255,255,255,0.08)
- Glass border: light rgba(255,255,255,0.35) vs dark rgba(255,255,255,0.12)
- Tlo glowne: light #F2F2F7 vs dark #000000
- Shadow: light rgba(0,0,0,0.06) vs dark rgba(0,0,0,0.3)

Kolory akcentowe (#FF6A00 i kolory makro) POZOSTAJA te same w obu trybach.
Glow effect pomaranczowy jest bardziej widoczny w dark mode — to zamierzony efekt.


---


## PERFORMANCE

- Kazda strona MUSI ladowac sie ponizej 1 sekundy na 4G
- First Contentful Paint ponizej 1.2s
- Cumulative Layout Shift ponizej 0.1
- Obrazy: next/image z lazy loading, format WebP lub AVIF
- Fonty: preload, font-display swap
- Bundle: zadna strona powyzej 150KB JS (gzipped)
- Skeleton loading natychmiast — uzytkownik NIGDY nie patrzy na bialy ekran
- Animacje na GPU: uzywaj transform i opacity, nigdy animuj width/height/top/left


---


## ZASADY OGOLNE DLA AGENTA

1.  Nie pytaj o potwierdzenie dla drobnych decyzji — podejmuj je sam zgodnie z tym dokumentem.
2.  Zawsze tworz KOMPLETNE komponenty — nie zostawiaj TODO, nie zostawiaj placeholderow.
3.  Kazdy nowy komponent MUSI miec animacje wejscia.
4.  Kazdy interaktywny element MUSI miec tap feedback (scale + opacity).
5.  Kazdy stan (loading, empty, error, success, disabled) MUSI byc obsluzony wizualnie.
6.  Testuj mentalnie czy element wyglada jak natywna aplikacja Apple.
7.  Jesli cos nie jest opisane w tym dokumencie — zrob to tak, jak zrobiloby Apple.
8.  Priorytet: wyglad i feel WAZNIEJSZY niz funkcjonalnosc WAZNIEJSZY niz performance WAZNIEJSZY niz clean code.
9.  Nigdy nie tworz elementu bez odpowiedniego stanu disabled.
10. Nigdy nie zostawiaj domyslnych stylow przegladarki — WSZYSTKO jest wystylowane.
11. Nigdy nie uzywaj alertow przegladarki (window.alert, window.confirm) — uzywaj wlasnych modali.
12. Nigdy nie uzywaj domyslnych scrollbarow — ukryj je lub ostyluj.
13. Kazda liczba kaloryczna lub makro musi byc wyswietlona z odpowiednim kolorem z palety.
14. Kolor #FF6A00 to kolor przewodni — uzywaj go konsekwentnie ale punktowo.
15. Jesli musisz wybrac miedzy ladnym a funkcjonalnym — wybierz ladne, a potem dodaj funkcjonalnosc.


---


Motto projektu: "Jesli to nie wyglada jak Apple — zrob to od nowa."