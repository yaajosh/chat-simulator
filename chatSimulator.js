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
            { name: 'MaxMustermann', personality: 'casual', traits: 'chill and friendly' },
            { name: 'LunaGaming', personality: 'casual', traits: 'supportive and laid-back' },
            { name: 'TechNinja92', personality: 'casual', traits: 'knows tech but keeps it simple' },
            { name: 'StreamFan_DE', personality: 'casual', traits: 'curious but relaxed' },
            { name: 'GamerGirl_23', personality: 'casual', traits: 'funny and uses emotes' },
            { name: 'ProPlayer_X', personality: 'casual', traits: 'helpful without being pushy' },
            { name: 'ChatMaster', personality: 'casual', traits: 'likes to chat casually' },
            { name: 'NiceVibes', personality: 'casual', traits: 'chill and encouraging' },
            { name: 'PixelKing', personality: 'casual', traits: 'creative but relaxed' },
            { name: 'RetroGamer', personality: 'casual', traits: 'nostalgic and chill' },
            { name: 'ZockerPro', personality: 'casual', traits: 'asks questions casually' },
            { name: 'KaffeeJunkie', personality: 'casual', traits: 'super relaxed and chill' }
        ];
        
        const englishChatters = [
            { name: 'CoolGamer123', personality: 'casual', traits: 'excited but chill' },
            { name: 'StreamLover', personality: 'casual', traits: 'supportive and relaxed' },
            { name: 'TechWizard', personality: 'casual', traits: 'techy but not nerdy' },
            { name: 'PixelPro', personality: 'casual', traits: 'creative and laid-back' },
            { name: 'ChatKing', personality: 'casual', traits: 'friendly and talkative' },
            { name: 'NightOwl', personality: 'casual', traits: 'curious in a chill way' },
            { name: 'ProViewer', personality: 'casual', traits: 'helpful but relaxed' },
            { name: 'GamingFan', personality: 'casual', traits: 'funny and easy-going' },
            { name: 'RetroStyle', personality: 'casual', traits: 'nostalgic and chill' },
            { name: 'ModernGamer', personality: 'casual', traits: 'up to date but casual' },
            { name: 'StreamSniper', personality: 'casual', traits: 'asks questions casually' },
            { name: 'ViewerOne', personality: 'casual', traits: 'just here to hang out' }
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
        
        // Clear old conversation history periodically to avoid topic loops
        if (this.conversationHistory.length > 3) {
            // Remove oldest message to keep things fresh
            this.conversationHistory.shift();
        }
        
        // Decide what type of message to generate
        const messageType = Math.random();
        
        if (messageType < 0.7) {
            // 70% chance: Ask streamer a question (more focus on streamer)
            this.generateStreamerQuestion();
        } else {
            // 30% chance: Random observation/comment (no chatter-to-chatter!)
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
        const prompts = {
            de: `Du bist ${chatter.username}, ein casual Twitch-Zuschauer.

Schreibe eine kurze, lockere Bemerkung oder Frage (max. 60 Zeichen).

Themen: Gaming, Technik, was auch immer gerade interessant ist.
Sei entspannt und freundlich.
Verwende manchmal ein Emote: PogChamp, Kappa, LUL

WICHTIG: Beziehe dich NICHT auf alte Themen! Sei frisch und aktuell.

Beispiele:
- "Läuft gut hier!"
- "Was kommt als nächstes?"
- "Cool! PogChamp"

Nachricht:`,
            
            en: `You are ${chatter.username}, a casual Twitch viewer.

Write a short, relaxed remark or question (max 60 characters).

Topics: Gaming, tech, whatever seems interesting.
Be chill and friendly.
Sometimes use an emote: PogChamp, Kappa, LUL

IMPORTANT: Do NOT reference old topics! Be fresh and current.

Examples:
- "Going well here!"
- "What's next?"
- "Cool! PogChamp"

Message:`
        };
        
        return prompts[this.language];
    }
    
    buildChatterInteractionPrompt(chatter, recentMessages) {
        // Only use the LAST message for interaction
        const lastMessage = recentMessages[recentMessages.length - 1];
        
        const prompts = {
            de: `Du bist ${chatter.username}, ein entspannter Twitch-Chatter.

Letzte Nachricht im Chat:
${lastMessage}

Reagiere casual auf diese Nachricht. Verwende @username wenn du willst.

Sei locker und entspannt, kurz halten (max. 80 Zeichen).

Nachricht:`,
            
            en: `You are ${chatter.username}, a relaxed Twitch chatter.

Last message in chat:
${lastMessage}

React casually to this message. Use @username if you want.

Be chill and relaxed, keep it short (max 80 characters).

Message:`
        };
        
        return prompts[this.language];
    }
    
    buildStreamerQuestionPrompt(chatter) {
        const prompts = {
            de: `Du bist ${chatter.username}, ein entspannter Twitch-Zuschauer.

Stelle dem Streamer eine einfache, kurze Frage (max. 60 Zeichen).

WICHTIG: Erfinde eine NEUE Frage, beziehe dich NICHT auf alte Themen!

Sei freundlich und interessiert.

Beispiele:
- "Was machst du da?"
- "Wie geht's?"
- "Zeigst du uns was Neues?"
- "Was ist dein Tipp dazu?"
- "Magst du XY?"

Frage:`,
            
            en: `You are ${chatter.username}, a relaxed Twitch viewer.

Ask the streamer a simple, short question (max 60 characters).

IMPORTANT: Come up with a NEW question, do NOT reference old topics!

Be friendly and interested.

Examples:
- "What are you doing?"
- "How's it going?"
- "Showing us something new?"
- "What's your tip on this?"
- "Do you like XY?"

Question:`
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
            de: `Du bist ${chatter.username}, ein entspannter Twitch-Zuschauer.

Der Streamer hat dich angesprochen: "${transcript}"

Antworte casual und direkt (max. 80 Zeichen).

Sei freundlich und locker in deiner Antwort.

Beispiele:
- "Ja klar, mach ich!"
- "Danke! Freut mich"
- "Haha, gute Frage"
- "Ja genau, das stimmt"

Deine Antwort:`,
            
            en: `You are ${chatter.username}, a relaxed Twitch viewer.

The streamer addressed you: "${transcript}"

Respond casually and directly (max 80 characters).

Be friendly and chill in your response.

Examples:
- "Yeah sure, will do!"
- "Thanks! Appreciate it"
- "Haha, good question"
- "Yeah exactly, that's right"

Your response:`
        };
        
        return prompts[this.language];
    }
    
    buildResponsePrompt(chatter, transcript) {
        const prompts = {
            de: `Du bist ${chatter.username}, ein entspannter Twitch-Chatter.

Der Streamer hat gerade gesagt: "${transcript}"

Reagiere casual darauf (max. 80 Zeichen).

Sei locker und freundlich, wie ein normaler Zuschauer.
Manchmal ein Emote verwenden (PogChamp, Kappa, LUL).

Beispiele:
- "Cool! Mach weiter so"
- "Interessant, erzähl mehr"
- "Hab ich auch schon probiert"
- "Nice! PogChamp"

Nachricht:`,
            
            en: `You are ${chatter.username}, a relaxed Twitch chatter.

The streamer just said: "${transcript}"

React casually to it (max 80 characters).

Be chill and friendly, like a normal viewer.
Sometimes use an emote (PogChamp, Kappa, LUL).

Examples:
- "Cool! Keep going"
- "Interesting, tell more"
- "I tried that too"
- "Nice! PogChamp"

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
        
        // Only store streamer responses in history, not all chat messages
        // This prevents chatters from looping on their own conversations
        if (chatter.username === 'Du' || message.text.length < 120) {
            this.conversationHistory.push(`${chatter.username}: ${text}`);
        }
        
        // Keep only last 3 messages for maximum recency
        if (this.conversationHistory.length > 3) {
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

