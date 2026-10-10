import { useEffect, useRef, useState } from 'react';
import api from '../api';

const initialMessages = [
  {
    id: 1,
    role: 'bot',
    content: 'Hi! I’m AudienSense AI. Ask me about movies, genres, or recommendations.'
  }
];

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakResponse = (text) => {
    if (!window.speechSynthesis || isMuted) return;

    const preferredLang = localStorage.getItem('preferredLanguage') || 'English';
    const langMap = { 'Hindi': 'hi-IN', 'Telugu': 'te-IN', 'Tamil': 'ta-IN', 'English': 'en-US', 'All Languages': 'en-US' };

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[preferredLang] || 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (event, messageOverride) => {
    if (event) event.preventDefault();
    const message = (messageOverride ?? input).trim();
    if (!message || isLoading) return;

    const userMessage = { id: Date.now(), role: 'user', content: message };
    setMessages(current => [...current, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', { 
        message,
        language: localStorage.getItem('preferredLanguage') || 'English'
      });
      const reply = response.data?.response;

      if (typeof reply !== 'string' || !reply.trim()) {
        throw new Error('The recommendation service returned an empty response.');
      }

      const botMessage = { id: Date.now() + 1, role: 'bot', content: reply };
      setMessages(current => [...current, botMessage]);
      speakResponse(reply);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      const description = backendMessage && typeof backendMessage === 'string'
        ? backendMessage
        : 'I couldn’t reach the recommendation service. Please try again later.';

      setMessages(current => [...current, {
        id: Date.now() + 1,
        role: 'bot',
        content: description
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceInput = () => {
    if (!SpeechRecognition) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    const preferredLang = localStorage.getItem('preferredLanguage') || 'English';
    const langMap = { 'Hindi': 'hi-IN', 'Telugu': 'te-IN', 'Tamil': 'ta-IN', 'English': 'en-US', 'All Languages': 'en-US' };
    recognition.lang = langMap[preferredLang] || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript.trim();
      setInput(transcript);
      setIsListening(false);
      sendMessage(null, transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {isOpen && (
        <section className="mb-3 flex h-[500px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-blue-900/20">
          <header className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div><h2 className="font-black">AudienSense AI</h2><p className="text-xs text-blue-100">Movie recommendations</p></div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setIsMuted(current => !current)} className="rounded-full px-2.5 py-1 text-xs font-bold transition hover:bg-blue-500" aria-label={isMuted ? 'Unmute voice responses' : 'Mute voice responses'}>{isMuted ? '🔇' : '🔊'}</button>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-full p-1 text-xl transition hover:bg-blue-500" aria-label="Close chat">×</button>
            </div>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-sm bg-blue-600 text-white' : 'rounded-bl-sm border border-slate-200 bg-white text-slate-700 shadow-sm'}`}>{message.content}</div>
              </div>
            ))}
            {isLoading && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm"><span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" /><span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" /><span className="ml-1">AudienSense AI is typing...</span></div></div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 p-3">
            <input type="text" value={input} onChange={event => setInput(event.target.value)} placeholder="Ask for a movie recommendation..." className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" aria-label="Chat message" />
            <button type="button" onClick={toggleVoiceInput} disabled={isLoading} className={`rounded-xl px-3 py-2.5 text-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${isListening ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} aria-label={isListening ? 'Stop listening' : 'Listen to your message'} title={SpeechRecognition ? 'Use voice input' : 'Voice input is not supported'}>🎤</button>
            <button type="submit" disabled={!input.trim() || isLoading} className="rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Send</button>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setIsOpen(current => !current)} className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-xl shadow-blue-900/20 transition hover:scale-105 hover:bg-blue-700" aria-label={isOpen ? 'Close chat' : 'Open chat'}>{isOpen ? '×' : '💬'}</button>
    </div>
  );
}
