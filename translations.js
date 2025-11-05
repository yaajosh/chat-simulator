// Language translations for the UI
export const translations = {
    de: {
        'app-title': 'Stream-Präsentations-Trainer',
        'app-subtitle': 'Übe Live-Präsentationen mit KI-generiertem Chat-Feedback',
        'start-session': 'Übungssession starten',
        'stop-session': 'Session beenden',
        'ready-title': 'Bereit zum Üben?',
        'ready-subtitle': 'Starte eine Session um mit dem Training zu beginnen',
        'mic-activate': 'Mikrofon aktivieren',
        'mic-recording': 'Aufnahme läuft...',
        'tips-title': 'Übungstipps',
        'tip-1': 'Sprich klar und deutlich in dein Mikrofon',
        'tip-2': 'Beobachte die Chat-Reaktionen und reagiere darauf',
        'tip-3': 'Beantworte Fragen aus dem Chat',
        'tip-4': 'Übe verschiedene Präsentationsstile',
        'address-chatters': 'Chatter ansprechen:',
        'full-name': 'Voller Name:',
        'example-full': '"MaxMustermann, was denkst du?"',
        'first-name': 'Vorname:',
        'example-first': '"Hey Max, gute Frage!"',
        'with-space': 'Mit Leerzeichen:',
        'example-space': '"Luna Gaming hat recht"',
        'example-mention': '"Danke @TechNinja"',
        'stream-chat': 'STREAM-CHAT',
        'pause-chat': 'Chat pausieren',
        'clear-chat': 'Chat leeren',
        'chat-placeholder': 'Nachricht senden...',
        'send-button': 'Senden',
        'settings-title': 'Einstellungen',
        'api-key-label': 'Gemini API Key:',
        'api-key-placeholder': 'Dein Gemini API Key',
        'api-key-info': 'Verwendet Gemini 2.5 Flash Lite • Wird lokal gespeichert',
        'chat-activity-label': 'Chat-Aktivität (Zuschauer-Anzahl):',
        'chat-activity-info': '1 = Wenige Zuschauer, 10 = Sehr aktiver Chat',
        'auto-response-label': 'Chat reagiert auf deine Sprache',
        'how-it-works': 'So funktioniert\'s',
        'step-1': 'API Key oben eingeben',
        'step-2': '"Übungssession starten" klicken',
        'step-3': 'Mikrofon aktivieren',
        'step-4': 'Mit dem Üben beginnen!',
        // System messages
        'session-started': '🎬 Übungssession gestartet! Viel Erfolg!',
        'session-tip': '💡 Tipp: Aktiviere dein Mikrofon und fang an zu sprechen.',
        'session-ended': '✓ Session beendet! Dauer: {duration}',
        'session-done': '👏 Gut gemacht! Bereit für die nächste Runde?',
        'api-key-saved': 'API Key gespeichert! Chat-Simulator neu gestartet.',
        'no-api-key': '⚠️ Bitte gib deinen Gemini API Key in den Einstellungen ein.',
        'ready-to-practice': '✓ Bereit zum Üben! Starte eine Session um loszulegen.',
        'alert-api-key': 'Bitte gib zuerst deinen Gemini API Key in den Einstellungen ein!',
        'alert-start-session': 'Bitte starte zuerst eine Übungssession!',
        'alert-mic-denied': 'Mikrofon-Zugriff verweigert oder nicht verfügbar.'
    },
    en: {
        'app-title': 'Stream Presentation Trainer',
        'app-subtitle': 'Practice live presentations with AI-generated chat feedback',
        'start-session': 'Start Practice Session',
        'stop-session': 'End Session',
        'ready-title': 'Ready to Practice?',
        'ready-subtitle': 'Start a session to begin training',
        'mic-activate': 'Activate Microphone',
        'mic-recording': 'Recording...',
        'tips-title': 'Practice Tips',
        'tip-1': 'Speak clearly and distinctly into your microphone',
        'tip-2': 'Watch chat reactions and respond to them',
        'tip-3': 'Answer questions from the chat',
        'tip-4': 'Practice different presentation styles',
        'address-chatters': 'Address chatters:',
        'full-name': 'Full name:',
        'example-full': '"MaxMustermann, what do you think?"',
        'first-name': 'First name:',
        'example-first': '"Hey Max, good question!"',
        'with-space': 'With spaces:',
        'example-space': '"Luna Gaming is right"',
        'example-mention': '"Thanks @TechNinja"',
        'stream-chat': 'STREAM CHAT',
        'pause-chat': 'Pause chat',
        'clear-chat': 'Clear chat',
        'chat-placeholder': 'Send message...',
        'send-button': 'Send',
        'settings-title': 'Settings',
        'api-key-label': 'Gemini API Key:',
        'api-key-placeholder': 'Your Gemini API Key',
        'api-key-info': 'Uses Gemini 2.5 Flash Lite • Stored locally',
        'chat-activity-label': 'Chat Activity (Viewer Count):',
        'chat-activity-info': '1 = Few viewers, 10 = Very active chat',
        'auto-response-label': 'Chat responds to your voice',
        'how-it-works': 'How it works',
        'step-1': 'Enter API Key above',
        'step-2': 'Click "Start Practice Session"',
        'step-3': 'Activate microphone',
        'step-4': 'Start practicing!',
        // System messages
        'session-started': '🎬 Practice session started! Good luck!',
        'session-tip': '💡 Tip: Activate your microphone and start speaking.',
        'session-ended': '✓ Session ended! Duration: {duration}',
        'session-done': '👏 Well done! Ready for the next round?',
        'api-key-saved': 'API Key saved! Chat simulator restarted.',
        'no-api-key': '⚠️ Please enter your Gemini API Key in the settings.',
        'ready-to-practice': '✓ Ready to practice! Start a session to begin.',
        'alert-api-key': 'Please enter your Gemini API Key in the settings first!',
        'alert-start-session': 'Please start a practice session first!',
        'alert-mic-denied': 'Microphone access denied or unavailable.'
    }
};

export class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('app-language') || 'de';
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('app-language', lang);
        this.updateUI();
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    translate(key, replacements = {}) {
        let text = translations[this.currentLanguage][key] || key;
        
        // Replace placeholders like {duration}
        Object.keys(replacements).forEach(key => {
            text = text.replace(`{${key}}`, replacements[key]);
        });
        
        return text;
    }
    
    updateUI() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.translate(key);
        });
        
        // Update all elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.translate(key);
        });
        
        // Update all elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.translate(key);
        });
    }
}

