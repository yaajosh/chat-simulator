// Chat Simulator App
import { ChatSimulator } from './chatSimulator.js';
import { SpeechRecognitionHandler } from './speechRecognition.js';
import { LanguageManager } from './translations.js';

class App {
    constructor() {
        this.chatSimulator = null;
        this.speechHandler = null;
        this.isPaused = false;
        this.sessionActive = false;
        this.sessionStartTime = null;
        this.timerInterval = null;
        this.languageManager = new LanguageManager();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.initializeChatSimulator();
    }
    
    setupEventListeners() {
        // Language switch
        document.getElementById('langDE').addEventListener('click', () => {
            this.switchLanguage('de');
        });
        
        document.getElementById('langEN').addEventListener('click', () => {
            this.switchLanguage('en');
        });
        
        // Session Controls
        document.getElementById('startSessionButton').addEventListener('click', () => {
            this.startSession();
        });
        
        document.getElementById('stopSessionButton').addEventListener('click', () => {
            this.stopSession();
        });
        
        // Mikrofon Button
        document.getElementById('micButton').addEventListener('click', () => {
            this.toggleMicrophone();
        });
        
        // Chat Input
        document.getElementById('sendButton').addEventListener('click', () => {
            this.sendMessage();
        });
        
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Chat Controls
        document.getElementById('pauseButton').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('clearButton').addEventListener('click', () => {
            this.clearChat();
        });
        
        // Settings
        document.getElementById('apiKey').addEventListener('change', (e) => {
            this.saveApiKey(e.target.value);
        });
        
        document.getElementById('chatActivity').addEventListener('input', (e) => {
            document.getElementById('activityValue').textContent = e.target.value;
            if (this.chatSimulator) {
                this.chatSimulator.setActivityLevel(parseInt(e.target.value));
            }
        });
        
        document.getElementById('autoResponse').addEventListener('change', (e) => {
            if (this.chatSimulator) {
                this.chatSimulator.setAutoResponse(e.target.checked);
            }
        });
        
        document.getElementById('language').addEventListener('change', (e) => {
            if (this.chatSimulator) {
                this.chatSimulator.setLanguage(e.target.value);
            }
            if (this.speechHandler) {
                this.speechHandler.setLanguage(e.target.value);
            }
            localStorage.setItem('chat-sim-language', e.target.value);
        });
    }
    
    loadSettings() {
        // Load API Key
        const apiKey = localStorage.getItem('gemini-api-key');
        if (apiKey) {
            document.getElementById('apiKey').value = apiKey;
        }
        
        // Load and apply language
        const language = this.languageManager.getCurrentLanguage();
        this.updateLanguageButtons(language);
        this.languageManager.updateUI();
    }
    
    switchLanguage(lang) {
        this.languageManager.setLanguage(lang);
        this.updateLanguageButtons(lang);
        
        // Update chat simulator language
        if (this.chatSimulator) {
            this.chatSimulator.setLanguage(lang);
        }
        
        // Update speech recognition language
        if (this.speechHandler) {
            this.speechHandler.setLanguage(lang);
        }
    }
    
    updateLanguageButtons(lang) {
        document.getElementById('langDE').classList.toggle('active', lang === 'de');
        document.getElementById('langEN').classList.toggle('active', lang === 'en');
    }
    
    saveApiKey(apiKey) {
        localStorage.setItem('gemini-api-key', apiKey);
        if (this.chatSimulator) {
            this.chatSimulator.setApiKey(apiKey);
            // Restart chat simulator with new API key
            this.chatSimulator.start();
            this.displaySystemMessage(this.languageManager.translate('api-key-saved'));
        }
    }
    
    initializeChatSimulator() {
        const apiKey = localStorage.getItem('gemini-api-key');
        const language = this.languageManager.getCurrentLanguage();
        
        this.chatSimulator = new ChatSimulator(apiKey, language);
        this.chatSimulator.onMessage((message) => {
            this.displayMessage(message);
        });
        
        // Check if API key is set
        if (!apiKey) {
            this.displaySystemMessage(this.languageManager.translate('no-api-key'));
        } else {
            this.displaySystemMessage(this.languageManager.translate('ready-to-practice'));
        }
    }
    
    startSession() {
        const apiKey = localStorage.getItem('gemini-api-key');
        if (!apiKey) {
            alert(this.languageManager.translate('alert-api-key'));
            return;
        }
        
        this.sessionActive = true;
        this.sessionStartTime = Date.now();
        
        // Update UI
        document.getElementById('startSessionButton').style.display = 'none';
        document.getElementById('stopSessionButton').style.display = 'flex';
        document.getElementById('sessionTimer').style.display = 'flex';
        document.getElementById('practicePlaceholder').style.display = 'none';
        document.getElementById('micControls').style.display = 'flex';
        document.getElementById('liveIndicator').style.display = 'flex';
        
        // Start timer
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
        
        // Clear and start chat
        this.clearChat();
        this.displaySystemMessage(this.languageManager.translate('session-started'));
        this.displaySystemMessage(this.languageManager.translate('session-tip'));
        
        if (this.chatSimulator) {
            this.chatSimulator.start();
        }
    }
    
    stopSession() {
        this.sessionActive = false;
        
        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Calculate session duration
        const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        
        // Stop microphone if active
        if (this.speechHandler && this.speechHandler.isRecording) {
            this.speechHandler.stop();
            document.getElementById('micButton').classList.remove('recording');
            document.getElementById('micStatus').textContent = this.languageManager.translate('mic-activate');
        }
        
        // Update UI
        document.getElementById('startSessionButton').style.display = 'flex';
        document.getElementById('stopSessionButton').style.display = 'none';
        document.getElementById('sessionTimer').style.display = 'none';
        document.getElementById('practicePlaceholder').style.display = 'flex';
        document.getElementById('micControls').style.display = 'none';
        document.getElementById('liveIndicator').style.display = 'none';
        document.getElementById('timerDisplay').textContent = '00:00';
        document.getElementById('transcription').textContent = '';
        
        // Stop chat simulator
        if (this.chatSimulator) {
            this.chatSimulator.stop();
        }
        
        this.displaySystemMessage(this.languageManager.translate('session-ended', {
            duration: `${minutes}m ${seconds}s`
        }));
        this.displaySystemMessage(this.languageManager.translate('session-done'));
    }
    
    updateTimer() {
        if (!this.sessionStartTime) return;
        
        const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = display;
    }
    
    async toggleMicrophone() {
        if (!this.sessionActive) {
            alert(this.languageManager.translate('alert-start-session'));
            return;
        }
        
        const button = document.getElementById('micButton');
        const status = document.getElementById('micStatus');
        
        if (!this.speechHandler) {
            const apiKey = localStorage.getItem('gemini-api-key');
            if (!apiKey) {
                alert(this.languageManager.translate('alert-api-key'));
                return;
            }
            
            const language = this.languageManager.getCurrentLanguage();
            this.speechHandler = new SpeechRecognitionHandler(language);
            
            // Display transcript as it's being spoken
            this.speechHandler.onTranscript((text) => {
                document.getElementById('transcription').textContent = text;
            });
            
            // Only respond to complete sentences
            this.speechHandler.onFinalTranscript((text) => {
                if (this.chatSimulator && document.getElementById('autoResponse').checked) {
                    console.log('Responding to speech:', text); // Debug log
                    this.chatSimulator.respondToSpeech(text);
                }
            });
            
            this.speechHandler.onError((error) => {
                console.error('Speech recognition error:', error);
                this.displaySystemMessage('Fehler bei der Spracherkennung: ' + error);
            });
        }
        
        if (this.speechHandler.isRecording) {
            this.speechHandler.stop();
            button.classList.remove('recording');
            status.textContent = this.languageManager.translate('mic-activate');
        } else {
            try {
                await this.speechHandler.start();
                button.classList.add('recording');
                status.textContent = this.languageManager.translate('mic-recording');
            } catch (error) {
                alert(this.languageManager.translate('alert-mic-denied'));
            }
        }
    }
    
    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message && this.chatSimulator) {
            this.chatSimulator.sendUserMessage(message);
            input.value = '';
        }
    }
    
    displayMessage(message) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        const username = document.createElement('span');
        username.className = `username color-${message.colorId}`;
        username.textContent = message.username + ':';
        
        const content = document.createElement('span');
        content.className = 'message-content';
        content.textContent = message.text;
        
        messageElement.appendChild(username);
        messageElement.appendChild(content);
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    displaySystemMessage(text) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.style.fontStyle = 'italic';
        messageElement.style.color = '#adadb8';
        messageElement.textContent = text;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const button = document.getElementById('pauseButton');
        
        if (this.isPaused) {
            this.chatSimulator.pause();
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
            `;
        } else {
            this.chatSimulator.resume();
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
            `;
        }
    }
    
    clearChat() {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = '';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

