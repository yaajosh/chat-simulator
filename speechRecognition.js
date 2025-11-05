// Speech Recognition Handler
export class SpeechRecognitionHandler {
    constructor(language = 'de') {
        this.language = language;
        this.isRecording = false;
        this.recognition = null;
        this.transcriptCallback = null;
        this.finalTranscriptCallback = null;
        this.errorCallback = null;
        this.currentTranscript = '';
        
        this.initRecognition();
    }
    
    initRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('Speech recognition not supported in this browser');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.getLanguageCode();
        
        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Accumulate for display
            if (finalTranscript.trim()) {
                this.currentTranscript += finalTranscript;
            }
            
            // Show current accumulated + interim in UI
            const displayText = (this.currentTranscript + ' ' + interimTranscript).trim();
            if (displayText && this.transcriptCallback) {
                this.transcriptCallback(displayText);
            }
            
            // Only trigger AI responses on final results with ONLY the new sentence
            if (finalTranscript.trim() && this.finalTranscriptCallback) {
                // Send only the NEW sentence, not the accumulated transcript
                this.finalTranscriptCallback(finalTranscript.trim());
                
                // Clear transcript after a short delay to prepare for next input
                setTimeout(() => {
                    this.currentTranscript = '';
                }, 5000); // Clear after 5 seconds
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (this.errorCallback) {
                this.errorCallback(event.error);
            }
        };
        
        this.recognition.onend = () => {
            // Restart if still recording
            if (this.isRecording) {
                this.recognition.start();
            }
        };
    }
    
    getLanguageCode() {
        const codes = {
            'de': 'de-DE',
            'en': 'en-US'
        };
        return codes[this.language] || 'de-DE';
    }
    
    setLanguage(language) {
        this.language = language;
        if (this.recognition) {
            this.recognition.lang = this.getLanguageCode();
        }
    }
    
    onTranscript(callback) {
        this.transcriptCallback = callback;
    }
    
    onFinalTranscript(callback) {
        this.finalTranscriptCallback = callback;
    }
    
    onError(callback) {
        this.errorCallback = callback;
    }
    
    async start() {
        if (!this.recognition) {
            throw new Error('Speech recognition not supported');
        }
        
        try {
            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.currentTranscript = '';
            this.isRecording = true;
            this.recognition.start();
        } catch (error) {
            this.isRecording = false;
            throw error;
        }
    }
    
    stop() {
        if (this.recognition && this.isRecording) {
            this.isRecording = false;
            this.currentTranscript = '';
            this.recognition.stop();
        }
    }
    
    clearTranscript() {
        this.currentTranscript = '';
    }
}

