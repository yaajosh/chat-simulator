// Chat Simulator with Gemini API Integration
export class ChatSimulator {
    constructor(apiKey, language = 'de') {
        this.apiKey = apiKey;
        this.language = language;
        this.activityLevel = 5;
        this.autoResponse = true;
        this.isPaused = false;
        this.messageCallback = null;
        this.intervalId = null;
        
        this.chatters = this.generateChatters();
        this.conversationHistory = [];
        
        // Rate limiting
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.minRequestInterval = 4000; // Minimum 4 seconds between API calls
        this.lastRequestTime = 0;
        this.maxRetries = 3;
    }
    
    generateChatters() {
        const germanNames = [
            'MaxMustermann', 'LunaGaming', 'TechNinja92', 'StreamFan_DE', 
            'GamerGirl_23', 'ProPlayer_X', 'ChatMaster', 'NiceVibes', 
            'PixelKing', 'RetroGamer', 'ZockerPro', 'KaffeeJunkie'
        ];
        
        const englishNames = [
            'CoolGamer123', 'StreamLover', 'TechWizard', 'PixelPro',
            'ChatKing', 'NightOwl', 'ProViewer', 'GamingFan',
            'RetroStyle', 'ModernGamer', 'StreamSniper', 'ViewerOne'
        ];
        
        const names = this.language === 'de' ? germanNames : englishNames;
        
        return names.map((name, index) => ({
            username: name,
            colorId: (index % 10) + 1,
            personality: this.getRandomPersonality()
        }));
    }
    
    getRandomPersonality() {
        const personalities = [
            'enthusiastic', 'curious', 'funny', 'supportive', 
            'critical', 'technical', 'casual', 'excited'
        ];
        return personalities[Math.floor(Math.random() * personalities.length)];
    }
    
    onMessage(callback) {
        this.messageCallback = callback;
    }
    
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
    
    setActivityLevel(level) {
        this.activityLevel = level;
        // Restart with new interval if already running
        if (this.intervalId) {
            this.start();
        }
    }
    
    setAutoResponse(enabled) {
        this.autoResponse = enabled;
    }
    
    setLanguage(language) {
        this.language = language;
        this.chatters = this.generateChatters();
    }
    
    start() {
        if (!this.apiKey) return;
        
        // Stop any existing interval
        this.stop();
        
        const baseInterval = 25000; // 25 seconds base (slower to avoid rate limits)
        const interval = Math.max(8000, baseInterval / this.activityLevel);
        
        this.isPaused = false;
        
        this.intervalId = setInterval(() => {
            if (!this.isPaused) {
                this.generateRandomMessage();
            }
        }, interval);
        
        // Send initial welcome messages
        this.sendWelcomeMessages();
        
        // Start queue processor
        this.processQueue();
        
        // Also generate first random message
        setTimeout(() => {
            this.generateRandomMessage();
        }, 5000);
    }
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
    }
    
    sendWelcomeMessages() {
        const welcomes = this.language === 'de' 
            ? ['Hey! 👋', 'Moin!', 'Hallo zusammen!']
            : ['Hey! 👋', 'Hello!', 'Hi everyone!'];
        
        setTimeout(() => {
            this.sendMessage(
                this.chatters[0],
                welcomes[Math.floor(Math.random() * welcomes.length)]
            );
        }, 1000);
    }
    
    async generateRandomMessage() {
        if (!this.apiKey) return;
        
        const chatter = this.chatters[Math.floor(Math.random() * this.chatters.length)];
        
        const prompt = this.buildRandomMessagePrompt(chatter);
        this.queueAPICall(prompt, chatter);
    }
    
    queueAPICall(prompt, chatter) {
        this.requestQueue.push({ prompt, chatter });
        if (!this.isProcessingQueue) {
            this.processQueue();
        }
    }
    
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }
        
        this.isProcessingQueue = true;
        
        while (this.requestQueue.length > 0) {
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            
            if (timeSinceLastRequest < this.minRequestInterval) {
                await this.sleep(this.minRequestInterval - timeSinceLastRequest);
            }
            
            const { prompt, chatter } = this.requestQueue.shift();
            
            try {
                const message = await this.callGeminiAPI(prompt);
                
                if (message) {
                    this.sendMessage(chatter, message);
                }
                
                this.lastRequestTime = Date.now();
            } catch (error) {
                console.error('Error generating message:', error);
                // If it's a rate limit error, add a longer delay
                if (error.message.includes('429')) {
                    await this.sleep(10000); // Wait 10 seconds on rate limit
                }
            }
        }
        
        this.isProcessingQueue = false;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    buildRandomMessagePrompt(chatter) {
        const context = this.conversationHistory.slice(-10).join('\n');
        
        const prompts = {
            de: `Du bist ${chatter.username}, ein Twitch-Chat-Nutzer mit einer ${chatter.personality} Persönlichkeit.
Generiere eine kurze, authentische Chat-Nachricht (max. 100 Zeichen).
Die Nachricht sollte zur aktuellen Unterhaltung passen oder ein neues Thema einbringen.

Bisheriger Chat-Verlauf:
${context || 'Der Chat hat gerade erst begonnen.'}

Regeln:
- Schreibe nur die Chat-Nachricht, keine Erklärungen
- Verwende gelegentlich Twitch-Emotes wie PogChamp, Kappa, LUL
- Sei natürlich und authentisch
- Maximal 1-2 Sätze

Nachricht:`,
            
            en: `You are ${chatter.username}, a Twitch chat user with a ${chatter.personality} personality.
Generate a short, authentic chat message (max 100 characters).
The message should fit the current conversation or introduce a new topic.

Previous chat:
${context || 'Chat just started.'}

Rules:
- Write only the chat message, no explanations
- Occasionally use Twitch emotes like PogChamp, Kappa, LUL
- Be natural and authentic
- Max 1-2 sentences

Message:`
        };
        
        return prompts[this.language];
    }
    
    async respondToSpeech(transcript) {
        if (!this.apiKey || !transcript) return;
        
        try {
            // Generate 1-2 responses to avoid rate limits
            const numResponses = Math.min(
                Math.floor(this.activityLevel / 5) + 1,
                2
            );
            
            for (let i = 0; i < numResponses; i++) {
                const chatter = this.chatters[Math.floor(Math.random() * this.chatters.length)];
                const prompt = this.buildResponsePrompt(chatter, transcript);
                
                // Queue the request instead of calling directly
                setTimeout(() => {
                    this.queueAPICall(prompt, chatter);
                }, i * 1000);
            }
        } catch (error) {
            console.error('Error responding to speech:', error);
        }
    }
    
    buildResponsePrompt(chatter, transcript) {
        const prompts = {
            de: `Du bist ${chatter.username}, ein Twitch-Chat-Nutzer.
Der Streamer hat gerade gesagt: "${transcript}"

Generiere eine passende, kurze Reaktion (max. 100 Zeichen).
Die Reaktion sollte ${chatter.personality} sein.

Mögliche Reaktionen:
- Stelle eine Frage zum Gesagten
- Kommentiere das Gesagte
- Zeige Zustimmung oder stelle es in Frage
- Bringe verwandte Themen ein

Schreibe nur die Chat-Nachricht, keine Erklärungen.

Nachricht:`,
            
            en: `You are ${chatter.username}, a Twitch chat user.
The streamer just said: "${transcript}"

Generate an appropriate, short response (max 100 characters).
The response should be ${chatter.personality}.

Possible reactions:
- Ask a question about what was said
- Comment on it
- Show agreement or question it
- Bring up related topics

Write only the chat message, no explanations.

Message:`
        };
        
        return prompts[this.language];
    }
    
    async sendUserMessage(message) {
        // User's own message appears in chat
        this.sendMessage({
            username: 'Du',
            colorId: 5
        }, message);
        
        // AI might respond to user's message
        if (this.autoResponse && this.apiKey) {
            setTimeout(() => {
                const chatter = this.chatters[Math.floor(Math.random() * this.chatters.length)];
                const prompt = this.buildResponsePrompt(chatter, message);
                this.queueAPICall(prompt, chatter);
            }, 1500);
        }
    }
    
    sendMessage(chatter, text) {
        const message = {
            username: chatter.username,
            text: text,
            colorId: chatter.colorId,
            timestamp: Date.now()
        };
        
        this.conversationHistory.push(`${chatter.username}: ${text}`);
        
        // Keep only last 50 messages in history
        if (this.conversationHistory.length > 50) {
            this.conversationHistory.shift();
        }
        
        if (this.messageCallback) {
            this.messageCallback(message);
        }
    }
    
    async callGeminiAPI(prompt, retryCount = 0) {
        if (!this.apiKey) {
            throw new Error('API key not set');
        }
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        maxOutputTokens: 100,
                        topP: 0.95,
                    }
                })
            });
            
            if (!response.ok) {
                // Handle rate limit with exponential backoff
                if (response.status === 429 && retryCount < this.maxRetries) {
                    const waitTime = Math.pow(2, retryCount) * 5000; // 5s, 10s, 20s
                    console.log(`Rate limit hit, waiting ${waitTime/1000}s before retry...`);
                    await this.sleep(waitTime);
                    return this.callGeminiAPI(prompt, retryCount + 1);
                }
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text.trim();
            }
            
            return null;
        } catch (error) {
            if (retryCount < this.maxRetries && error.message.includes('429')) {
                const waitTime = Math.pow(2, retryCount) * 5000;
                await this.sleep(waitTime);
                return this.callGeminiAPI(prompt, retryCount + 1);
            }
            console.error('Gemini API error:', error);
            throw error;
        }
    }
}

