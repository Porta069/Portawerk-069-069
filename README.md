# WerkPair — Handwerker-Plattform (Frontend)

Diskrete Jobvermittlung fürs Handwerk. Next.js 14 (App Router) · TypeScript · Tailwind v4 · framer-motion.

> Fokus: **funktionale Struktur & Workflow**. Design-System (Navy `#1A1A2E` / Gold `#E8A838`, Playfair Display + Inter) ist etabliert; Backend wird separat implementiert (siehe `../backend`).

## Start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Produktions-Build
```

## Seiten (Routen)

| Route            | Inhalt                                                              |
| ---------------- | ------------------------------------------------------------------ |
| `/`              | Landing Page (Hero, Stellen, Ablauf, Prämie, Für Betriebe, Footer) |
| `/login`         | Login (E-Mail + Passwort, „Angemeldet bleiben")                    |
| `/registrieren`  | 5-Schritt-Registrierung (siehe unten)                              |
| `/verify-email`  | Ziel des E-Mail-Verifikations-Links                                |
| `/dashboard`     | Nach Login — Profil + Feature-Platzhalter (Auth-Guard)             |
| `/rechtliches`   | Datenschutz, Nutzungsbedingungen, Impressum, Cookies (Anker-IDs)   |

## Registrierungs-Flow (`/registrieren`)

1. **Umfrage** — 5 optionale Fragen, überspringbar (`steps/Step1Survey.tsx`)
2. **Kontaktdaten** — Name, E-Mail, Telefon + Client-Validierung (`Step2Contact.tsx`)
3. **Verifizierung** — E-Mail-Link **und** SMS-Code, beide Pflicht (`Step3Verify.tsx`)
4. **KI-Profilfragen** — dynamisch geladen, adaptive Folgefragen (`Step4AiQuestions.tsx`)
5. **Abschluss** — rechtliche Zustimmung (2 Pflicht-Checkboxen) → Profil erstellen (`Step5Legal.tsx`)
   → Erfolgsseite (`StepSuccess.tsx`)

State über alle Schritte: `context/RegistrationContext.tsx` (mit `localStorage`-Persistenz gegen Reload-Verlust).

## Architektur

```
app/
├── context/            AuthContext · RegistrationContext
├── components/         ui.tsx (Primitives) · QuestionComponent · OtpInput
│                       ProgressBar · VerificationStatus · LegalConsent
│                       Navbar · Hero · JobsPreview · HowItWorks · … (Landing)
├── registrieren/       page.tsx · RegisterFlow.tsx · steps/*
├── login/ · dashboard/ · verify-email/ · rechtliches/
lib/
├── types.ts            zentrale Typen
├── api.ts              API-Client (ApiResult<T>, mappt REST-Endpunkte)
├── db.ts               Mock-Backend (Stubs mit künstlicher Latenz)
├── aiService.ts        KI-Profilfragen (Mock, dynamisch)
├── legal.ts            Rechtstexte (Platzhalter)
└── constants.ts        Gewerke · Bundesländer · Umfrage-Fragen
```

## Mock-Backend / DEV-Codes

Alle Netzwerkaufrufe sind simuliert (`lib/db.ts`, `lib/aiService.ts`):

- **SMS-Code:** `123456` (`DEV_PHONE_CODE`)
- **E-Mail-Verifikation:** Button „Bestätigung simulieren" **oder** `/verify-email` öffnen (synchronisiert per `localStorage`-Event mit dem Registrierungs-Tab)
- **Login:** beliebige E-Mail + Passwort (min. 4 Zeichen)

Geplante Endpunkte (in `lib/api.ts` gespiegelt): `POST /api/auth/register`, `/login`,
`/send-email-verification`, `GET /api/auth/verify-email`, `POST /api/auth/send-phone-code`,
`/verify-phone`, `GET /api/ai/profile-questions`, `POST /api/ai/answer-questions`,
`GET /api/legal/terms`, `POST /api/auth/complete-registration`.

> ⚠️ **Rechtstexte** unter `/rechtliches` sind Platzhalter und müssen anwaltlich geprüft werden.
