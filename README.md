# LernQuest

Lern-PWA für Emma (4. Klasse VS) und Hannah (2. Klasse MS) – Deutsch, Mathematik, Englisch nach österreichischem Lehrplan, mit Schularbeit-Training, KI-Aufgaben, Gamification und Eltern-Dashboard.

Aufgebaut wie **SIT-Time**: Frontend ohne Framework und ohne Build, Backend Node.js 22 mit Express als einzigem Paket, Hosting auf Azure App Service Linux, Deployment per GitHub Actions mit OIDC.

## Architektur

- **Frontend** (`public/`): `index.html`, `app.js`, `styles.css`, Service Worker und Manifest. Installierbar am iPad und Handy („Zum Home-Bildschirm“). Schriften (Baloo 2, Nunito) liegen lokal – kein Google-Fonts-Abruf.
- **Backend** (`server/`):
  - `index.js` – alle Schnittstellen, Login, Brute-Force-Schutz, Sicherheits-Header
  - `ai.js` – KI-Aufgaben über die Anthropic Messages API (Prompt wird am Server gebaut)
  - `kids.js` – Profile, Niveaus und Standard-Schulbücher der Kinder
  - `session.js` – verschlüsseltes HttpOnly-Cookie (AES-256-GCM, Schlüssel aus `SESSION_SECRET`)
  - `store.js` – JSON-Dateien in `DATA_DIR`, atomar geschrieben
- **Offline:** Der Aufgabenpool läuft ohne Internet. Fortschritt wird lokal gepuffert und beim nächsten Online-Gang hochgeladen.

## Anmeldung & Sicherheit

| Stufe | Wie | Zweck |
|---|---|---|
| Geräte-Login | Familien-Passwort (`FAMILY_PASSWORD`), danach 180 Tage angemeldet | Niemand Fremdes kommt an App, Daten oder die KI |
| Eltern-Bereich | 4-stellige PIN, am Server geprüft, sperrt sich nach 60 Min. | Kinder können Einstellungen und Schularbeiten nicht ändern |

- Kein Entra-ID-Login, weil die Kinder keine Konten im Firmen-Tenant haben.
- 10 Fehlversuche pro IP → 15 Minuten Sperre (Passwort und PIN).
- Der API-Key liegt nur am Server. Der Browser schickt nur Kind, Fach und Thema; den Prompt baut der Server.
- Tageslimit für KI-Runden pro Kind (`AI_DAILY_LIMIT`).
- CSP ohne Fremd-Domains, `frame-ancestors 'none'`, HTTPS only, TLS 1.2, FTP aus.

## Speicherung (`/home/data/lernquest`, bleibt bei jedem Deploy erhalten)

- `kids.json` – Fortschritt, Abzeichen, Statistik, Schularbeiten je Kind (mit Revisionsnummer gegen Überschreiben von zwei Geräten)
- `settings.json` – PIN-Hash (scrypt) und Schulbücher
- `ai-usage.json` – KI-Zähler pro Kind und Tag

## App-Schnittstellen

- `POST /api/login`, `/api/logout`, `GET /api/me`
- `POST /api/parent/unlock`, `/api/parent/lock`
- `GET /api/state`, `PUT /api/kids/:id`, `POST /api/kids/:id/reset` (Eltern)
- `PUT /api/settings` (Eltern: Schulbücher, PIN)
- `POST /api/ai/questions`
- `GET /healthz` – Status, Version, KI an/aus

## Konfiguration (App-Einstellungen in Azure)

| Einstellung | Bedeutung | Standard |
|---|---|---|
| `SESSION_SECRET` | Schlüssel für das Session-Cookie | – (Pflicht) |
| `FAMILY_PASSWORD` | Passwort für die Geräte-Anmeldung | – (Pflicht) |
| `PARENT_PIN` | Start-PIN Eltern-Bereich (danach in der App änderbar) | 1234 |
| `DATA_DIR` | Speicherort der Dateien | /home/data/lernquest |
| `ANTHROPIC_API_KEY` | API-Key; leer = KI aus, Aufgabenpool läuft weiter | – |
| `ANTHROPIC_MODEL` | Modell für KI-Aufgaben | claude-sonnet-5-5 |
| `ANTHROPIC_BASE_URL` | Anderer kompatibler Endpunkt (z.B. Microsoft Foundry) | https://api.anthropic.com |
| `ANTHROPIC_AUTH_HEADER` | Header-Name für den Key beim alternativen Endpunkt | x-api-key |
| `AI_DAILY_LIMIT` | KI-Runden pro Kind und Tag | 15 |
| `PARENT_MINUTES` | Wie lange der Eltern-Modus offen bleibt | 60 |
| `SESSION_DAYS` | Wie lange ein Gerät angemeldet bleibt | 180 |

Für Microsoft Foundry: Endpunkt-URL und Header laut Foundry-Portal eintragen und einmal mit einer Testaufgabe prüfen.

## Lokal starten

```bash
npm install
npm run dev        # Port 8080, Passwort "test1234", KI im Testmodus (AI_MOCK)
```

## Azure einrichten (einmalig)

```powershell
az login
cd infra
./1-setup-azure.ps1 -PlanName <Plan der SIT-Time-App> -PlanResourceGroup rg-sit-time   # läuft im bestehenden B1-Plan mit
./4-github-oidc.ps1 -SetGitHubSecrets                                                  # Deployment-Freigabe für GitHub
./2-custom-domain.ps1 -HostName lernen.schwaiger-it.at                                  # optional
```

Danach deployt jeder Push auf `main` automatisch. Für ein Deployment ohne GitHub: `./3-deploy-manual.ps1`.

Falls Azure die Web App nicht in einer anderen Ressourcengruppe als den Plan anlegen will: `-ResourceGroup rg-sit-time` mitgeben.

## Kosten

- **Hosting:** Im bestehenden B1-Plan der SIT-Time-App keine Zusatzkosten. Mit eigenem Plan (`-NewPlan`) ca. 12–13 € pro Monat.
- **KI:** Wird pro Aufgabenrunde über den Anthropic-Account abgerechnet. Das Tageslimit deckelt die Kosten.

## Grenzen

- Nur eine Instanz, weil die Daten in Dateien liegen (wie bei SIT-Time). Für mehrere Instanzen bräuchte es Azure Table Storage.
- Arbeiten zwei Geräte gleichzeitig am selben Kind, gewinnt der erste Speicherstand. Das andere Gerät übernimmt ihn und meldet das.
- Die Themenlisten folgen dem Lehrplan. Eine 1:1-Zuordnung zu den Schulbuch-Kapiteln folgt, sobald die Inhaltsverzeichnisse vorliegen.
