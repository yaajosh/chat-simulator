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
        // Disabled: Welcome messages caused chatters to respond to each other
        // Now chat starts clean and waits for streamer input
    }
    
    async generateRandomMessage() {
        if (!this.apiKey) return;
        
        // Decide what type of message to generate
        const messageType = Math.random();
        
        if (messageType < 0.7) {
            // 70% chance: Ask streamer a question (main focus on streamer)
            this.generateStreamerQuestion();
        } else {
            // 30% chance: Random observation/comment
            const chatter = this.chatters[Math.floor(Math.random() * this.chatters.length)];
            const prompt = this.buildRandomMessagePrompt(chatter);
            this.queueAPICall(prompt, chatter);
        }
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
            de: `Du bist ${chatter.username}, ein Twitch-Zuschauer.

Schreibe EINE kurze Bemerkung über den Stream (max. 40 Zeichen).

STRENGE REGELN:
- Sprich NUR über den aktuellen Stream
- ABSOLUT KEINE anderen Chatter erwähnen oder ansprechen!
- KEINE Namen von anderen Zuschauern!
- KEINE @mentions!
- KEINE Fragen an andere Chatter!
- NUR Kommentare zum Stream selbst

Manchmal ein Emote: PogChamp, Kappa, LUL

Gute Beispiele:
- "Läuft smooth!"
- "Geile Sache!"
- "Spannend! PogChamp"
- "Nice Stream!"
- "Gut erklärt!"
- "Interessant!"

VERBOTEN:
- "@Max..." (NIEMALS!)
- "Luna hat Recht..." (NIEMALS!)
- Jede Erwähnung anderer Chatter

Nachricht:`,
            
            en: `You are ${chatter.username}, a Twitch viewer.

Write ONE short remark about the stream (max 40 characters).

STRICT RULES:
- Talk ONLY about the current stream
- ABSOLUTELY NO mentioning or addressing other chatters!
- NO names of other viewers!
- NO @mentions!
- NO questions to other chatters!
- ONLY comments about the stream itself

Sometimes an emote: PogChamp, Kappa, LUL

Good examples:
- "Running smooth!"
- "Great stuff!"
- "Exciting! PogChamp"
- "Nice stream!"
- "Well explained!"
- "Interesting!"

FORBIDDEN:
- "@Max..." (NEVER!)
- "Luna is right..." (NEVER!)
- Any mention of other chatters

Message:`
        };
        
        return prompts[this.language];
    }
    
    buildStreamerQuestionPrompt(chatter) {
        const prompts = {
            de: `Du bist ${chatter.username}, ein Twitch-Zuschauer.

Stelle dem STREAMER eine kurze Frage (max. 40 Zeichen).

STRENGE REGELN:
- Frage NUR den STREAMER!
- KEINE Namen anderer Chatter erwähnen!
- KEINE @mentions!
- Komplett neue, frische Frage!

Viele verschiedene Beispiele:
- "Was machst du da?"
- "Wie funktioniert das?"
- "Zeigst du mehr davon?"
- "Welches Tool nutzt du?"
- "Wie lange schon?"
- "Was kommt noch?"
- "Macht das Spaß?"
- "Kannst du XY zeigen?"
- "Wo hast du das gelernt?"
- "Hast du Tipps für uns?"
- "Was ist dein Favorit?"
- "Wie geht's dir?"

Wähle eine UNTERSCHIEDLICHE Frage aus oder erfinde eine neue!

Frage:`,
            
            en: `You are ${chatter.username}, a Twitch viewer.

Ask the STREAMER a short question (max 40 characters).

STRICT RULES:
- Ask ONLY the STREAMER!
- NO names of other chatters!
- NO @mentions!
- Completely new, fresh question!

Many different examples:
- "What are you doing?"
- "How does that work?"
- "Will you show more?"
- "Which tool are you using?"
- "How long have you been at this?"
- "What's coming next?"
- "Is this fun?"
- "Can you show XY?"
- "Where did you learn this?"
- "Got tips for us?"
- "What's your favorite?"
- "How are you doing?"

Choose a DIFFERENT question or invent a new one!

Question:`
        };
        
        return prompts[this.language];
    }
    
    async respondToSpeech(transcript) {
        if (!this.apiKey || !transcript) return;
        
        try {
            // CLEAR ALL HISTORY before responding to new input
            // This prevents chatters from referencing old topics
            console.log(`🧹 Clearing conversation history for fresh response`);
            this.conversationHistory = [];
            
            // Store ONLY the current streamer input
            this.conversationHistory.push(`STREAMER: ${transcript}`);
            
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
            de: `Du bist ${chatter.username}, ein Twitch-Zuschauer.

Der STREAMER hat DICH angesprochen: "${transcript}"

Antworte direkt (max. 40 Zeichen).

VERBOTEN:
- Andere Chatter erwähnen
- @mentions
- Namen von Zuschauern

Verschiedene Antwort-Beispiele:
- "Ja klar!"
- "Danke dir!"
- "Haha, stimmt!"
- "Gerne!"
- "Kein Problem!"
- "Alles gut!"
- "Ja genau!"
- "Freut mich!"
- "Logo!"
- "Sicher!"

Wähle eine passende Antwort!

Antwort:`,
            
            en: `You are ${chatter.username}, a Twitch viewer.

The STREAMER addressed YOU: "${transcript}"

Respond directly (max 40 characters).

FORBIDDEN:
- Mentioning other chatters
- @mentions
- Names of viewers

Different response examples:
- "Yeah sure!"
- "Thanks!"
- "Haha, right!"
- "You're welcome!"
- "No problem!"
- "All good!"
- "Yeah exactly!"
- "Appreciate it!"
- "For sure!"
- "Definitely!"

Choose a fitting response!

Response:`
        };
        
        return prompts[this.language];
    }
    
    buildResponsePrompt(chatter, transcript) {
        const prompts = {
            de: `Du bist ${chatter.username}, ein Twitch-Zuschauer.

Der STREAMER hat gesagt: "${transcript}"

WICHTIG: Das ist der STREAMER, nicht ein anderer Zuschauer!

Reagiere auf DEN STREAMER (max. 40 Zeichen).

STRENG VERBOTEN:
- Andere Chatter erwähnen
- @mentions verwenden
- Namen anderer Zuschauer sagen

Viele verschiedene Antwort-Beispiele:
- "Verstehe!"
- "Gut erklärt!"
- "Ah ok, cool!"
- "Macht Sinn!"
- "Sehr nice!"
- "Spannend!"
- "Danke für Info!"
- "Weiter so! PogChamp"
- "Interessant!"
- "Haha, nice!"

Wähle eine passende Reaktion oder erfinde eine neue!

Nachricht:`,
            
            en: `You are ${chatter.username}, a Twitch viewer.

The STREAMER said: "${transcript}"

IMPORTANT: This is the STREAMER, not another viewer!

React to THE STREAMER (max 40 characters).

STRICTLY FORBIDDEN:
- Mentioning other chatters
- Using @mentions
- Saying names of other viewers

Many different response examples:
- "Got it!"
- "Well explained!"
- "Ah ok, cool!"
- "Makes sense!"
- "Very nice!"
- "Interesting!"
- "Thanks for info!"
- "Keep going! PogChamp"
- "Nice!"
- "Haha, cool!"

Choose a fitting reaction or invent a new one!

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
        
        // ONLY store streamer messages in history
        // This prevents chatters from looping on their own conversations
        if (chatter.username === 'Du') {
            // Clear old history and keep only this streamer message
            this.conversationHistory = [`STREAMER: ${text}`];
        }
        // Don't store chatter messages in history at all
        
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
                        temperature: 0.7,
                        maxOutputTokens: 60,
                        topP: 0.8,
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

