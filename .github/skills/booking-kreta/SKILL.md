---
name: booking-kreta
description: "Domain knowledge for the Pigi Paradise booking portal. USE FOR: understanding the property, business rules, seasonal pricing, user roles, and feature decisions. Covers the Kreta apartment, owners, tenants, seasons, and maintenance context."
---

# Booking Kreta — Domenekunnskap

## Eiendommen

- **Beliggenhet**: Pigi Paradise, landsbyen Pigi i Rethymno-regionen, Kreta, Hellas
- **Størrelse**: Ca. 60 kvm, 6 soveplasser
- **Senger**: 1 dobbeltseng, 2 enkeltsenger, 1 sovesofa
- **Komplekset**: 40 enheter på 11 000 kvm tomt, 200 kvm svømmebasseng med barneseksjon, fellespark, grillområde
- **Avstand**: 2,5 km til nærmeste strand, 10 km til Rethymno sentrum, bussholdeplass i nærheten
- **Nabolandsby**: Loutra (ved siden av Pigi)

## Fasiliteter

- **Terrasse**: Stor terrasse, godt møblert
- **Underholdning**: Apple TV med WiFi
- **Vaskemaskin**: Ny, stor kapasitet
- **Oppvaskmaskin**: På kjøkkenet
- **Utvask**: Egen vaskehjelp tilgjengelig etter besøk

## Eierskap og brukere

- **Eiere**: Tre brødre som eier leiligheten sammen
- **Tilgang**: Kun eierne har innlogging og kan administrere bookinger, priser og vedlikehold
- **Leietakere**: Kan vurderes gitt tilgang senere — da skal "Vennepris" og "Pris besøkende venner" skjules fra nettsiden

## Sesonger

| Sesong | Måneder | Beskrivelse |
|--------|---------|-------------|
| Høysesong | Mai – August | Høyest pris, mest etterspørsel |
| Lavsesong | September – Oktober | Lavere pris, roligere periode |
| Utenfor sesong | November – April | Ikke tilgjengelig / ikke markedsført |

## Vær i Pigi / Rethymno

| Måned | Temp. (dag) | Temp. (natt) | Havtemp. | Nedbør | Sol (timer/dag) |
|-------|-------------|--------------|----------|--------|------------------|
| Mai | 24°C | 15°C | 20°C | Lite | 10 |
| Juni | 28°C | 19°C | 23°C | Svært lite | 12 |
| Juli | 30°C | 22°C | 25°C | Nesten null | 13 |
| August | 30°C | 22°C | 26°C | Nesten null | 12 |
| September | 27°C | 19°C | 24°C | Lite | 10 |
| Oktober | 23°C | 16°C | 22°C | Moderat | 7 |

- **Mai**: Behagelig varme, perfekt for turer og utflukter. Havet begynner å bli badetemperatur.
- **Juni–August**: Varmt og tørt, ideelt for strand og basseng. Kan bli over 35°C innimellom.
- **September**: Fortsatt varmt, roligere, havet er på sitt varmeste. Fin turmåned.
- **Oktober**: Mildere, noen regnbyger, men fortsatt godt badevær. Lavere priser og færre turister.

## Priser (norske kroner)

Konkrete priser:
- **Høysesong (mai–aug)**: 1 300,- kr per døgn
- **Lavsesong (sep–okt)**: 1 000,- kr per døgn
- **Utvask**: 1 500,- (egen vaskehjelp)

Priskategorier i portalen:
- **Pris i sesong (per natt)** — Høysesong mai–aug
- **Pris utenfor sesong (per natt)** — Lavsesong sep–okt
- **Vennepris (per natt)** — Rabattert pris for venner av eierne
- **Pris besøkende venner (per natt)** — Venner som besøker når eiere er der
- **Pris for utvask** — Engangskostnad per opphold

Priser vises i format `x xxx,-` (norsk tusen-separator, ingen desimaler).

## Portalens faner

1. **Kalender** — Booking-kalender med månedsoversikt, oppsummering, og sesong-belegg
2. **Priser** — Administrere priser (kun redigerbart for innloggede eiere)
3. **Vedlikehold** — Sjekkliste for vedlikeholdsoppgaver med ferdigdato

## Teknisk stack

- **Frontend**: Next.js 16 (statisk eksport), MUI, Zustand, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Deploy**: Netlify (statisk fra `apps/web/out`)
- **Monorepo**: pnpm workspace (`apps/web`, `packages/`)
- **Tema**: Mørkt tema, #121212 bakgrunn, #1a1a1a kort, #1DB954 primærfarge (grønn)
- **Språk**: Norsk UI-tekst, norske commit-meldinger

## Om Pigi Paradise

Pigi Paradise gir følelsen av å bo i hjertet av en autentisk kretisk landsby, med utsikt over havet, fjellene og olivenlundene. Komplekset kombinerer gresk sjarm med moderne fasiliteter. Pigi er nevnt i venetianske dokumenter fra 1500- og 1600-tallet, og er fødested for den greske forfatteren Pantelis Prevelakis. Nabolandsbyen Loutra fikk navnet sitt fra en venetiansk fontene på 1500-tallet.

## Viktige designbeslutninger

- All tekst i portalen skal være hvit på mørk bakgrunn
- Prisfelt skal vise hvit tekst også i disabled-tilstand
- Kalender skal være mobilresponsiv (mindre celler, fullskjerm dialog)
- Sesong-seksjonen skal matche kalenderens bredde
- Login-felt skal være like brede på mobil
