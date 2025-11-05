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
        const germanChatters = [
            { name: 'MaxMustermann', personality: 'helpful', traits: 'asks thoughtful questions' },
            { name: 'LunaGaming', personality: 'enthusiastic', traits: 'very supportive and positive' },
            { name: 'TechNinja92', personality: 'technical', traits: 'knows a lot about tech' },
            { name: 'StreamFan_DE', personality: 'curious', traits: 'always interested in learning' },
            { name: 'GamerGirl_23', personality: 'funny', traits: 'makes jokes and uses emotes' },
            { name: 'ProPlayer_X', personality: 'competitive', traits: 'gives tips and advice' },
            { name: 'ChatMaster', personality: 'talkative', traits: 'likes to chat with others' },
            { name: 'NiceVibes', personality: 'supportive', traits: 'always encouraging' },
            { name: 'PixelKing', personality: 'creative', traits: 'shares ideas and suggestions' },
            { name: 'RetroGamer', personality: 'nostalgic', traits: 'references old things' },
            { name: 'ZockerPro', personality: 'critical', traits: 'asks challenging questions' },
            { name: 'KaffeeJunkie', personality: 'casual', traits: 'relaxed and chill' }
        ];
        
        const englishChatters = [
            { name: 'CoolGamer123', personality: 'enthusiastic', traits: 'very excited about everything' },
            { name: 'StreamLover', personality: 'supportive', traits: 'loves the content' },
            { name: 'TechWizard', personality: 'technical', traits: 'expert in technology' },
            { name: 'PixelPro', personality: 'creative', traits: 'artistic and imaginative' },
            { name: 'ChatKing', personality: 'talkative', traits: 'engages with everyone' },
            { name: 'NightOwl', personality: 'curious', traits: 'asks deep questions' },
            { name: 'ProViewer', personality: 'helpful', traits: 'gives good advice' },
            { name: 'GamingFan', personality: 'funny', traits: 'makes everyone laugh' },
            { name: 'RetroStyle', personality: 'nostalgic', traits: 'loves old school' },
            { name: 'ModernGamer', personality: 'competitive', traits: 'always up to date' },
            { name: 'StreamSniper', personality: 'critical', traits: 'questions everything' },
            { name: 'ViewerOne', personality: 'casual', traits: 'just here to chill' }
        ];
        
        const chatters = this.language === 'de' ? germanChatters : englishChatters;
        
        return chatters.map((chatter, index) => ({
            username: chatter.name,
            colorId: (index % 10) + 1,
            personality: chatter.personality,
            traits: chatter.traits,
            lastInteraction: 0
        }));
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
        
        // Decide what type of message to generate
        const messageType = Math.random();
        
        if (messageType < 0.3 && this.conversationHistory.length > 2) {
            // 30% chance: Chatter reacts to another chatter
            this.generateChatterToChatterMessage();
        } else if (messageType < 0.5) {
            // 20% chance: Chatter asks streamer a question
            this.generateStreamerQuestion();
        } else {
            // 50% chance: Random comment
            const chatter = this.chatters[Math.floor(Math.random() * this.chatters.length)];
            const prompt = this.buildRandomMessagePrompt(chatter);
            this.queueAPICall(prompt, chatter);
        }
    }
    
    generateChatterToChatterMessage() {
        const chatter = this.chatters[Math.floor(Math.random() * this.chatters.length)];
        const recentMessages = this.conversationHistory.slice(-3);
        
        if (recentMessages.length === 0) return;
        
        const prompt = this.buildChatterInteractionPrompt(chatter, recentMessages);
        this.queueAPICall(prompt, chatter);
    }
    
    generateStreamerQuestion() {
        const chatter = this.chatters[Math.floor(Math.random() * this.chatters.length)];
        const prompt = this.buildStreamerQuestionPrompt(chatter);
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
        const context = this.conversationHistory.slice(-5).join('\n');
        
        const prompts = {
            de: `Du bist ${chatter.username}, ein Twitch-Chat-Nutzer.
Persönlichkeit: ${chatter.personality}
Charakter: ${chatter.traits}

Generiere eine kurze, authentische Chat-Nachricht (max. 100 Zeichen).

${context ? `Chat-Verlauf:\n${context}\n` : 'Der Chat hat gerade erst begonnen.'}

Regeln:
- Schreibe nur die Chat-Nachricht, keine Erklärungen
- Verwende gelegentlich Emotes: PogChamp, Kappa, LUL, ResidentSleeper
- Sei deinem Charakter treu (${chatter.personality})
- Maximal 1-2 Sätze

Nachricht:`,
            
            en: `You are ${chatter.username}, a Twitch chat user.
Personality: ${chatter.personality}
Character: ${chatter.traits}

Generate a short, authentic chat message (max 100 characters).

${context ? `Chat history:\n${context}\n` : 'Chat just started.'}

Rules:
- Write only the chat message, no explanations
- Occasionally use emotes: PogChamp, Kappa, LUL, ResidentSleeper
- Stay true to your character (${chatter.personality})
- Max 1-2 sentences

Message:`
        };
        
        return prompts[this.language];
    }
    
    buildChatterInteractionPrompt(chatter, recentMessages) {
        const context = recentMessages.join('\n');
        
        const prompts = {
            de: `Du bist ${chatter.username} (${chatter.personality}, ${chatter.traits}).

Neueste Chat-Nachrichten:
${context}

Reagiere auf eine dieser Nachrichten oder starte eine Diskussion mit einem anderen Chatter.
Verwende @username um jemanden direkt anzusprechen.

Beispiele:
- "@MaxMustermann das stimmt, ich denke auch..."
- "@LunaGaming hast du das schon ausprobiert?"
- "Ich bin bei @TechNinja92, das ist eine gute Idee"

Schreibe NUR die Chat-Nachricht (max. 100 Zeichen):`,
            
            en: `You are ${chatter.username} (${chatter.personality}, ${chatter.traits}).

Recent chat messages:
${context}

React to one of these messages or start a discussion with another chatter.
Use @username to address someone directly.

Examples:
- "@MaxMustermann I agree, I think..."
- "@LunaGaming have you tried that?"
- "I'm with @TechNinja92, that's a good idea"

Write ONLY the chat message (max 100 characters):`
        };
        
        return prompts[this.language];
    }
    
    buildStreamerQuestionPrompt(chatter) {
        const prompts = {
            de: `Du bist ${chatter.username} (${chatter.personality}, ${chatter.traits}).

Du möchtest den Streamer etwas fragen.
Die Frage sollte zu deiner Persönlichkeit passen.

Beispiele je nach Persönlichkeit:
- Technical: "Welche Software benutzt du dafür?"
- Curious: "Wie lange machst du das schon?"
- Supportive: "Können wir irgendwie helfen?"
- Funny: "Hast du schon mal XY versucht? Kappa"

Schreibe NUR die Frage an den Streamer (max. 100 Zeichen):`,
            
            en: `You are ${chatter.username} (${chatter.personality}, ${chatter.traits}).

You want to ask the streamer a question.
The question should match your personality.

Examples by personality:
- Technical: "What software are you using?"
- Curious: "How long have you been doing this?"
- Supportive: "Can we help somehow?"
- Funny: "Have you tried XY? Kappa"

Write ONLY the question to the streamer (max 100 characters):`
        };
        
        return prompts[this.language];
    }
    
    async respondToSpeech(transcript) {
        if (!this.apiKey || !transcript) return;
        
        try {
            // Check if streamer is addressing a specific chatter
            const addressedChatter = this.findAddressedChatter(transcript);
            
            if (addressedChatter) {
                console.log(`🎯 Detected address to chatter: ${addressedChatter.username}`);
                console.log(`📝 Transcript: "${transcript}"`);
                
                // The addressed chatter MUST respond
                const prompt = this.buildDirectResponsePrompt(addressedChatter, transcript);
                this.queueAPICall(prompt, addressedChatter);
                addressedChatter.lastInteraction = Date.now();
            } else {
                console.log(`💬 General statement (no specific chatter addressed)`);
            }
            
            // Generate 1-2 general responses from other chatters
            const numResponses = Math.min(
                Math.floor(this.activityLevel / 5) + 1,
                addressedChatter ? 1 : 2
            );
            
            for (let i = 0; i < numResponses; i++) {
                let chatter;
                // Don't pick the same chatter that was directly addressed
                do {
                    chatter = this.chatters[Math.floor(Math.random() * this.chatters.length)];
                } while (addressedChatter && chatter.username === addressedChatter.username);
                
                const prompt = this.buildResponsePrompt(chatter, transcript);
                
                setTimeout(() => {
                    this.queueAPICall(prompt, chatter);
                }, (i + (addressedChatter ? 1 : 0)) * 1500);
            }
        } catch (error) {
            console.error('Error responding to speech:', error);
        }
    }
    
    findAddressedChatter(transcript) {
        const lowerTranscript = transcript.toLowerCase();
        
        for (const chatter of this.chatters) {
            const lowerName = chatter.username.toLowerCase();
            
            // 1. Check for exact username match
            if (lowerTranscript.includes(lowerName)) {
                return chatter;
            }
            
            // 2. Check for @mention
            if (lowerTranscript.includes('@' + lowerName)) {
                return chatter;
            }
            
            // 3. Handle names with spaces (e.g., "Retro Style" for "RetroStyle")
            const nameWithSpaces = this.addSpacesToCamelCase(chatter.username).toLowerCase();
            if (nameWithSpaces !== lowerName && lowerTranscript.includes(nameWithSpaces)) {
                return chatter;
            }
            
            // 4. Check for first part of username (e.g., "Max" for "MaxMustermann")
            const firstPart = this.getFirstPartOfName(chatter.username).toLowerCase();
            if (firstPart.length >= 3) { // Only match if first part is 3+ characters
                // Use word boundary to avoid false matches
                const regex = new RegExp(`\\b${this.escapeRegex(firstPart)}\\b`, 'i');
                if (regex.test(lowerTranscript)) {
                    return chatter;
                }
            }
            
            // 5. Handle common German/English name variations
            const nameParts = this.splitUsername(chatter.username);
            for (const part of nameParts) {
                if (part.length >= 4 && lowerTranscript.includes(part.toLowerCase())) {
                    return chatter;
                }
            }
        }
        
        return null;
    }
    
    addSpacesToCamelCase(name) {
        // Convert "RetroStyle" to "Retro Style"
        // Convert "MaxMustermann" to "Max Mustermann"
        return name.replace(/([a-z])([A-Z])/g, '$1 $2')
                   .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
    }
    
    getFirstPartOfName(name) {
        // Extract first part: "MaxMustermann" -> "Max"
        // "LunaGaming" -> "Luna"
        // "TechNinja92" -> "Tech"
        
        // Split on capital letters
        const match = name.match(/^[A-Z][a-z]+/);
        if (match) {
            return match[0];
        }
        
        // If no camel case, split on numbers or special chars
        const parts = name.split(/[\d_-]/);
        return parts[0];
    }
    
    splitUsername(name) {
        // Split username into meaningful parts
        const parts = [];
        
        // Split by capital letters (CamelCase)
        const camelParts = name.split(/(?=[A-Z])/);
        parts.push(...camelParts.filter(p => p.length > 0));
        
        // Split by numbers and special characters
        const specialParts = name.split(/[\d_-]/);
        parts.push(...specialParts.filter(p => p.length > 0));
        
        return [...new Set(parts)]; // Remove duplicates
    }
    
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    buildDirectResponsePrompt(chatter, transcript) {
        const prompts = {
            de: `Du bist ${chatter.username} (${chatter.personality}, ${chatter.traits}).

Der Streamer hat DICH direkt angesprochen: "${transcript}"

Du wurdest direkt genannt oder angesprochen! Antworte auf den Streamer.
Die Antwort sollte zu deiner Persönlichkeit passen.

Wichtig:
- Reagiere direkt auf das was der Streamer zu DIR gesagt hat
- Sei deinem Charakter treu (${chatter.personality})
- Maximal 100 Zeichen

Schreibe NUR deine Antwort:`,
            
            en: `You are ${chatter.username} (${chatter.personality}, ${chatter.traits}).

The streamer has addressed YOU directly: "${transcript}"

You were directly mentioned or addressed! Respond to the streamer.
The response should match your personality.

Important:
- React directly to what the streamer said to YOU
- Stay true to your character (${chatter.personality})
- Max 100 characters

Write ONLY your response:`
        };
        
        return prompts[this.language];
    }
    
    buildResponsePrompt(chatter, transcript) {
        // Get only the last 3 messages from chat for minimal context
        const recentContext = this.conversationHistory.slice(-3).join('\n');
        
        const prompts = {
            de: `Du bist ${chatter.username} (${chatter.personality}, ${chatter.traits}).

Der Streamer hat GERADE EBEN gesagt: "${transcript}"

${recentContext ? `Chat-Kontext:\n${recentContext}\n` : ''}

Generiere eine passende Reaktion (max. 100 Zeichen), die zu deiner Persönlichkeit passt.

Wichtig: 
- Reagiere NUR auf die aktuelle Aussage!
- Sei deinem Charakter treu (${chatter.personality})
- Verwende gelegentlich Emotes

Mögliche Reaktionen:
- Stelle eine Frage zum Gesagten
- Kommentiere die Aussage
- Zeige Zustimmung oder Zweifel
- Teile deine Meinung

Schreibe nur die Chat-Nachricht:`,
            
            en: `You are ${chatter.username} (${chatter.personality}, ${chatter.traits}).

The streamer JUST said: "${transcript}"

${recentContext ? `Chat context:\n${recentContext}\n` : ''}

Generate an appropriate response (max 100 characters) that matches your personality.

Important:
- React ONLY to the current statement!
- Stay true to your character (${chatter.personality})
- Occasionally use emotes

Possible reactions:
- Ask a question about what was said
- Comment on the statement
- Show agreement or doubt
- Share your opinion

Write only the chat message:`
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
        
        // Keep only last 10 messages in history for better recency
        if (this.conversationHistory.length > 10) {
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
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${this.apiKey}`, {
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

