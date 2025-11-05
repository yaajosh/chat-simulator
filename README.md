# Stream-Präsentations-Trainer

Ein professionelles Übungstool für Praktikanten und angehende Streamer, um sicheres Sprechen vor der Kamera zu trainieren. Simuliert einen Twitch-Livestream-Chat mit KI-generierten Chattern, angetrieben durch Gemini 2.5 Flash Lite.

## Features

- 🎓 **Lerntool für Praktikanten** - Strukturierte Übungssessions mit Timer
- 🎮 **Authentisches Twitch-Chat Design** - Sieht aus wie ein echter Twitch-Stream
- 🤖 **KI-generierte Chatter** - Gemini 2.5 Flash Lite erstellt realistische Chat-Nachrichten
- 🎤 **Mikrofon-Integration** - Spreche in dein Mikrofon und die KI-Chatter reagieren auf das Gesagte
- ⏱️ **Session-Timer** - Verfolge die Dauer deiner Übungseinheiten
- 🌍 **Mehrsprachig** - Unterstützt Deutsch und Englisch
- ⚙️ **Anpassbare Chat-Aktivität** - Simuliere wenige oder viele Zuschauer
- 👥 **Verschiedene Persönlichkeiten** - Chatter mit unterschiedlichen Charakteren

## Installation & Start

1. **Repository klonen oder herunterladen**

2. **Gemini API Key besorgen**
   - Gehe zu [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Erstelle einen neuen API Key
   - Notiere dir den Key

3. **Server starten**
   ```bash
   # Mit Python (empfohlen)
   python3 -m http.server 8000
   
   # Oder mit Node.js (falls installiert)
   npx http-server -p 8000
   ```

4. **App öffnen**
   - Öffne deinen Browser
   - Navigiere zu `http://localhost:8000`

5. **API Key eingeben**
   - Gib deinen Gemini API Key in den Einstellungen rechts ein
   - Der Key wird lokal im Browser gespeichert

## Verwendung

### Übungssession starten
1. **"Übungssession starten"** klicken
2. Der Timer startet automatisch und zeigt die Übungsdauer an
3. Die "ÜBUNG LÄUFT" Anzeige erscheint
4. Der simulierte Chat wird aktiviert

### Mikrofon verwenden
1. Klicke auf **"Mikrofon aktivieren"** (nur während aktiver Session)
2. Erlaube den Mikrofon-Zugriff im Browser
3. Spreche ins Mikrofon - deine Worte werden transkribiert
4. Die KI-Chatter reagieren automatisch auf komplette Sätze (wenn aktiviert)

### Session beenden
- Klicke auf **"Session beenden"**
- Du erhältst eine Zusammenfassung mit der Übungsdauer
- Alle Daten werden für die nächste Session zurückgesetzt

### Eigene Nachrichten senden
- Schreibe eine Nachricht im Chat-Input-Feld
- Drücke Enter oder klicke auf "Senden"
- Die KI-Chatter können auf deine Nachrichten antworten

## Einstellungen

- **Gemini API Key**: Dein API-Schlüssel für Gemini 2.5 Flash Lite
- **Chat-Aktivität (Zuschauer-Anzahl)**: Simuliert unterschiedliche Zuschauerzahlen (1 = wenige Zuschauer, 10 = sehr aktiver Chat)
- **Chat reagiert auf deine Sprache**: An/Aus für automatische Reaktionen auf Mikrofon-Input
- **Sprache**: Deutsch oder Englisch (beeinflusst Chat-Nachrichten und Spracherkennung)

## Technologie

- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **KI**: Google Gemini 2.5 Flash Lite API
- **Spracherkennung**: Web Speech API
- **Styling**: Custom CSS (Twitch-inspiriert)

## Browser-Kompatibilität

- Chrome/Edge: ✅ Volle Unterstützung
- Firefox: ⚠️ Spracherkennung eingeschränkt
- Safari: ⚠️ Spracherkennung eingeschränkt

**Empfohlen**: Chrome oder Edge für die beste Erfahrung

## Datenschutz

- Alle Daten werden lokal im Browser gespeichert
- Der API Key verlässt niemals deinen Browser (außer für API-Anfragen an Google)
- Keine Datenbank oder Backend-Speicherung
- Spracheingaben werden über die Web Speech API verarbeitet

## Tipps für Praktikanten

1. **Starte mit kurzen Sessions** - Beginne mit 5-10 Minuten und steigere dich
2. **Übe deine Stream-Präsentation** - Sprich so, als würdest du wirklich streamen
3. **Reagiere auf Chat** - Die KI-Chatter stellen Fragen und machen Kommentare - beantworte sie!
4. **Verschiedene Szenarien** - Teste verschiedene Themen und Präsentationsstile
5. **Chat-Aktivität anpassen** - Beginne mit weniger Aktivität (Level 2-3) und steigere graduell
6. **Regelmäßig üben** - Tägliche kurze Sessions sind effektiver als lange seltene Übungen

## Vorteile von Gemini 2.5 Flash Lite

- ⚡ **Schnelle Antworten** - Minimale Latenz für realistische Chat-Interaktion
- 💰 **Kosteneffizient** - Günstiger als Standard-Modelle
- 🎯 **Optimiert für Chat** - Speziell für kurze, prägnante Nachrichten
- 📊 **Bessere Rate Limits** - Mehr Anfragen möglich = aktiverer Chat

## Troubleshooting

**Chat generiert keine Nachrichten:**
- Prüfe, ob dein API Key korrekt eingegeben ist
- Öffne die Browser-Konsole (F12) für Fehler-Details
- Stelle sicher, dass du eine Internet-Verbindung hast

**Mikrofon funktioniert nicht:**
- Stelle sicher, dass du Chrome oder Edge verwendest
- Erlaube Mikrofon-Zugriff in den Browser-Einstellungen
- Prüfe, ob dein Mikrofon in anderen Apps funktioniert

**API-Fehler:**
- Prüfe ob dein API Key noch gültig ist
- Bei Rate-Limit-Fehlern: Reduziere die Chat-Aktivität oder warte kurz
- Gemini 2.5 Flash Lite hat großzügige Rate Limits

**Session startet nicht:**
- Stelle sicher, dass der API Key eingegeben ist
- Lade die Seite neu und versuche es erneut

## Für Ausbilder / Trainer

Dieses Tool eignet sich hervorragend für:
- **Praktikanten-Training** - Vorbereitung auf Live-Präsentationen
- **Streaming-Workshops** - Übung für angehende Content-Creator  
- **Präsentations-Coaching** - Sicheres Sprechen vor Publikum trainieren
- **Remote-Training** - Jeder kann von zu Hause aus üben

Die Session-Timer und strukturierten Übungseinheiten ermöglichen messbare Fortschritte.

## Lizenz

MIT License - Frei verwendbar für persönliche und kommerzielle Zwecke
