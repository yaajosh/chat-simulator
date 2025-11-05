# Twitch Chat Simulator

Eine Web-App zum Simulieren eines Twitch-Livestream-Chats mit KI-generierten Chattern, die durch Gemini 2.0 Flash angetrieben werden.

## Features

- 🎮 **Authentisches Twitch-Chat Design** - Sieht aus wie ein echter Twitch-Stream
- 🤖 **KI-generierte Chatter** - Gemini 2.0 Flash erstellt realistische Chat-Nachrichten
- 🎤 **Mikrofon-Integration** - Spreche in dein Mikrofon und die KI-Chatter reagieren auf das Gesagte
- 🌍 **Mehrsprachig** - Unterstützt Deutsch und Englisch
- ⚙️ **Anpassbare Chat-Aktivität** - Stelle ein, wie aktiv der Chat sein soll
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

### Chat-Simulation starten
- Der Chat startet automatisch nach Eingabe des API Keys
- Stelle die Chat-Aktivität (1-10) ein, um zu kontrollieren, wie häufig Nachrichten erscheinen
- Pausiere den Chat mit dem Pause-Button
- Lösche alle Nachrichten mit dem Papierkorb-Button

### Mikrofon verwenden
1. Klicke auf "Mikrofon aktivieren"
2. Erlaube den Mikrofon-Zugriff im Browser
3. Spreche ins Mikrofon - deine Worte werden transkribiert
4. Die KI-Chatter reagieren automatisch auf das Gesagte (wenn aktiviert)

### Eigene Nachrichten senden
- Schreibe eine Nachricht im Chat-Input-Feld
- Drücke Enter oder klicke auf "Senden"
- Die KI-Chatter können auf deine Nachrichten antworten

## Einstellungen

- **Gemini API Key**: Dein API-Schlüssel für die Gemini AI
- **Chat-Aktivität**: Wie häufig Nachrichten generiert werden (1 = selten, 10 = sehr aktiv)
- **Automatische Antworten auf Sprache**: An/Aus für Sprach-Reaktionen
- **Sprache**: Deutsch oder Englisch

## Technologie

- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **KI**: Google Gemini 2.0 Flash API
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

## Tipps für die Verwendung

1. **Übe deine Stream-Präsentation** - Sprich so, als würdest du wirklich streamen
2. **Reagiere auf Chat** - Die KI-Chatter stellen Fragen und machen Kommentare
3. **Verschiedene Szenarien** - Teste verschiedene Themen und Situationen
4. **Chat-Aktivität anpassen** - Beginne mit weniger Aktivität und steigere sie graduell

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
- Google AI Studio hat möglicherweise Rate Limits

## Lizenz

MIT License - Frei verwendbar für persönliche und kommerzielle Zwecke

# chat-simulator
