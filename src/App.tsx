import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Smile, 
  Trash2, 
  User, 
  Phone, 
  Video, 
  MoreVertical, 
  Download, 
  ChevronLeft,
  Plus,
  Moon,
  Sun,
  X,
  Sparkles,
  Play,
  Pause
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface Message {
  id: string;
  text?: string;
  image?: string;
  type: 'text' | 'audio' | 'image';
  sender: 'me' | 'other';
  timestamp: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Ciao! Come va?', type: 'text', sender: 'other', timestamp: '10:00' },
    { id: '2', text: 'Tutto bene, tu?', type: 'text', sender: 'me', timestamp: '10:01' },
  ]);
  const [inputText, setInputText] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'audio'>('text');
  const [sender, setSender] = useState<'me' | 'other'>('me');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatName, setChatName] = useState('Mario');
  const [chatStatus, setChatStatus] = useState('online');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of preview
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load browser voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        // Try to find an Italian voice or fallback
        const itVoice = availableVoices.find(v => v.lang.startsWith('it'));
        setSelectedVoice(itVoice ? itVoice.name : availableVoices[0].name);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const addMessage = (data: Partial<Message>) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: data.text,
      image: data.image,
      type: data.type || (data.image ? 'image' : messageType),
      sender: data.sender || sender,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addMessage({ image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  const playVoice = (message: Message) => {
    if (!message.text && message.type !== 'audio') return;
    const textToSpeak = message.text || "Messaggio vocale";
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    setIsPlaying(message.id);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    
    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => setIsPlaying(null);
    
    window.speechSynthesis.speak(utterance);
  };

  const exportChatAsHtml = () => {
    const chatHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <title>WhatsApp Chat - ${chatName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #e5ddd5;
            background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
          }
          .chat-container { max-width: 600px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }
          .message { margin-bottom: 8px; max-width: 80%; position: relative; padding: 6px 10px; border-radius: 8px; font-size: 14.5px; line-height: 1.4; display: block; clear: both; }
          .message-me { align-self: flex-end; float: right; background-color: #dcf8c6; border-top-right-radius: 0; }
          .message-other { align-self: flex-start; float: left; background-color: #ffffff; border-top-left-radius: 0; }
          .timestamp { font-size: 11px; float: right; margin-left: 8px; margin-top: 4px; color: rgba(0,0,0,0.45); }
          .header { background: #075e54; color: white; padding: 10px 16px; display: flex; align-items: center; position: sticky; top: 0; z-index: 10; }
          .wrapper { display: flex; flex-direction: column; }
          .play-btn { cursor: pointer; transition: opacity 0.2s; }
          .play-btn:hover { opacity: 0.8; }
        </style>
      </head>
      <body>
        <div class="chat-container">
          <div class="header">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: #ccc; margin-right: 12px; overflow: hidden">
              ${profilePic ? `<img src="${profilePic}" style="width:100%; height:100%; object-fit:cover;">` : '<div style="display:flex; justify-content:center; align-items:center; height:100%; font-size:20px;">👤</div>'}
            </div>
            <div>
              <div style="font-weight: 500;">${chatName}</div>
              <div style="font-size: 12px; opacity: 0.8;">${chatStatus}</div>
            </div>
          </div>
          <div style="flex: 1; padding: 20px; display: flex; flex-direction: column;">
            ${messages.map(m => {
              const safeText = (m.text || "").replace(/'/g, "\\'");
              return `
              <div class="wrapper">
                <div class="message message-${m.sender}">
                  ${m.type === 'image' && m.image ? `<img src="${m.image}" style="width:100%; border-radius: 6px; margin-bottom: 4px;">` : ''}
                  ${m.type === 'audio' ? `
                    <div style="display:flex; align-items:center; gap:10px; padding: 5px 0;">
                      <div class="play-btn" onclick="playVoice('${safeText || 'Messaggio vocale'}')" style="width:34px; height:34px; border-radius:50%; background:#00a884; display:flex; justify-content:center; align-items:center; color:white; flex-shrink:0;">▶</div>
                      <div style="flex:1; height:4px; background:rgba(0,0,0,0.08); border-radius:2px; position:relative;">
                        <div id="progress-${m.id}" style="position:absolute; left:0; top:0; height:100%; width:0%; background:#00a884; border-radius:2px; transition: width 0.1s linear;"></div>
                      </div>
                    </div>
                    <div style="font-size: 10px; color: #667781; margin-top: 2px;">Messaggio Vocale</div>
                  ` : ''}
                  ${m.type === 'text' && m.text ? `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                      <div>${m.text}</div>
                      <div class="play-btn" onclick="playVoice('${safeText}')" style="font-size:12px; color:#00a884; opacity:0.6;">▶</div>
                    </div>
                  ` : ''}
                  <span class="timestamp">${m.timestamp}</span>
                </div>
              </div>
            `}).join('')}
          </div>
        </div>

        <script>
          function playVoice(text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Try to find Italian voice or default
            const voices = window.speechSynthesis.getVoices();
            const itVoice = voices.find(v => v.lang.startsWith('it')) || voices[0];
            if (itVoice) utterance.voice = itVoice;

            window.speechSynthesis.speak(utterance);
          }
          // Pre-load voices
          window.speechSynthesis.getVoices();
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([chatHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${chatName.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
  };

  return (
    <div className={cn("flex h-screen bg-[#f0f2f5] font-sans", darkMode && "dark")}>
      {/* Sidebar Controls */}
      <div className="w-[350px] bg-white border-r border-wa-border p-6 flex flex-col gap-6 overflow-y-auto z-20 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-wa-green flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> ChatBuilder
          </h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* SECTION 1: IDENTITY */}
        <div className="space-y-4">
          <h2 className="text-[11px] font-semibold text-wa-text-light uppercase tracking-wider border-b pb-1 dark:border-zinc-800">Identità Chat</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-wa-text-light uppercase mb-1 block">Nome Contatto</label>
              <input 
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                className="w-full px-3 py-2 border border-wa-border rounded-lg focus:ring-2 focus:ring-wa-green outline-none dark:bg-zinc-800 dark:border-zinc-700 bg-[#f8f9fa]"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-wa-text-light uppercase mb-1 block">Stato</label>
              <input 
                value={chatStatus}
                onChange={(e) => setChatStatus(e.target.value)}
                className="w-full px-3 py-2 border border-wa-border rounded-lg focus:ring-2 focus:ring-wa-green outline-none dark:bg-zinc-800 dark:border-zinc-700 bg-[#f8f9fa]"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-wa-text-light uppercase mb-1 block">Foto Profilo</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setProfilePic(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-xs text-wa-text-light cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: MANUAL CREATION (Moved here for visibility) */}
        <div className="space-y-4 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
          <h2 className="text-[11px] font-semibold text-wa-text-light uppercase tracking-wider border-b pb-1 dark:border-zinc-700">Crea Messaggio</h2>
          
          <div className="flex gap-1 bg-white p-1 rounded-lg border border-wa-border dark:bg-zinc-900 dark:border-zinc-700">
            <button 
              onClick={() => setSender('other')}
              className={cn(
                "flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all",
                sender === 'other' ? "bg-wa-green text-white shadow-sm" : "text-wa-text-light"
              )}
            >
              RICEVUTO (Sx)
            </button>
            <button 
              onClick={() => setSender('me')}
              className={cn(
                "flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all",
                sender === 'me' ? "bg-wa-green text-white shadow-sm" : "text-wa-text-light"
              )}
            >
              INVIATO (Dx)
            </button>
          </div>

          <div className="flex gap-1 bg-white p-1 rounded-lg border border-wa-border dark:bg-zinc-900 dark:border-zinc-700">
            <button 
              onClick={() => setMessageType('text')}
              className={cn(
                "flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all",
                messageType === 'text' ? "bg-wa-green text-white shadow-sm" : "text-wa-text-light"
              )}
            >
              TESTO
            </button>
            <button 
              onClick={() => setMessageType('audio')}
              className={cn(
                "flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all",
                messageType === 'audio' ? "bg-wa-green text-white shadow-sm" : "text-wa-text-light"
              )}
            >
              VOCALE
            </button>
          </div>

          <div className="relative">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Scrivi il messaggio..."
              className="w-full px-3 py-2 border border-wa-border bg-white rounded-lg focus:ring-2 focus:ring-wa-green outline-none dark:bg-zinc-900 dark:border-zinc-700 min-h-[80px] text-sm"
            />
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 bottom-2 text-wa-text-light hover:text-wa-green transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <EmojiPicker 
                  onEmojiClick={(emojiData) => setInputText(prev => prev + emojiData.emoji)}
                  width={280}
                  height={350}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-wa-border rounded-lg text-xs font-semibold text-wa-text-dark hover:bg-gray-100 transition-colors dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300"
            >
              <ImageIcon className="w-4 h-4" /> Foto
            </button>
            <button 
              onClick={() => addMessage({ text: inputText })}
              disabled={!inputText}
              className="flex-[3] flex items-center justify-center gap-2 bg-wa-green text-white p-2 rounded-lg font-bold shadow-md hover:bg-wa-green/90 transition-all active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Aggiungi Messaggio
            </button>
          </div>
        </div>

        {/* SECTION 3: AUDIO & ACTIONS */}
        <div className="space-y-4">
          <h2 className="text-[11px] font-semibold text-wa-text-light uppercase tracking-wider border-b pb-1 dark:border-zinc-800">Voce & Esportazione</h2>
          
          <div className="space-y-3">
             <div>
              <label className="text-[10px] font-bold text-wa-text-light uppercase mb-1 block">Scegli Voce (Browser)</label>
              <select 
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-3 py-2 border border-wa-border rounded-lg outline-none bg-[#f8f9fa] dark:bg-zinc-800 dark:border-zinc-700 text-sm"
              >
                {voices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={exportChatAsHtml}
              className="w-full flex items-center justify-center gap-2 bg-[#111] text-white py-3 rounded-lg font-bold hover:bg-black transition-all"
            >
              <Download className="w-4 h-4" /> Esporta in HTML
            </button>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t dark:border-zinc-800">
          <p className="text-[10px] text-center text-gray-400">Trascina messaggi o usa i controlli sopra.</p>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden" 
        accept="image/*"
      />

      {/* Main Designer Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#f0f2f5] dark:bg-zinc-950">
        
        {/* Export Details Panel (Aesthetic Integration) */}
        <div className="absolute top-10 right-10 bg-white p-5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] w-60 hidden lg:block dark:bg-zinc-900 border border-wa-border dark:border-zinc-800 transition-all hover:translate-y-[-2px]">
          <div className="text-[11px] font-semibold text-wa-text-light uppercase tracking-wider mb-4">Dettagli Esportazione</div>
          <div className="space-y-2">
            <div className="flex justify-between text-[13px] text-wa-text-dark dark:text-zinc-300">
              <span>Formato</span>
              <span className="font-semibold">Standalone HTML</span>
            </div>
            <div className="flex justify-between text-[13px] text-wa-text-dark dark:text-zinc-300">
              <span>CSS Inline</span>
              <span className="text-wa-green font-semibold">Attivo</span>
            </div>
            <div className="flex justify-between text-[13px] text-wa-text-dark dark:text-zinc-300">
              <span>Assets</span>
              <span className="font-semibold">Base64</span>
            </div>
          </div>
          <div className="h-[1px] bg-wa-border dark:bg-zinc-800 my-4"></div>
          <div className="text-[11px] text-wa-text-light italic">Pronto per l'invio o l'integrazione web rapida.</div>
        </div>

        {/* WhatsApp Preview */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-[380px] h-[680px] bg-wa-bg rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.15)] relative overflow-hidden border-[12px] border-[#111] group flex flex-col">
            
            {/* Phone Notch/Speaker */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-zinc-900 rounded-b-3xl z-30" />

            {/* Mock Chat Header */}
            <div className="bg-wa-header text-white pt-6 pb-3 px-5 flex items-center gap-3 shadow-md z-10">
              <ChevronLeft className="w-5 h-5 cursor-pointer" />
              <div className="w-9 h-9 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                {profilePic ? (
                  <img src={profilePic} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full p-2 text-zinc-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{chatName}</h3>
                <p className="text-[11px] opacity-80 truncate flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block"></span>
                  {chatStatus}
                </p>
              </div>
              <div className="flex gap-4">
                <Video className="w-5 h-5 opacity-80" />
                <Phone className="w-5 h-5 opacity-80" />
                <MoreVertical className="w-5 h-5 opacity-80" />
              </div>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 relative bg-wa-bg"
              style={{
                backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
                backgroundSize: '400px',
                backgroundBlendMode: 'overlay'
              }}
            >
              <div className="text-center my-3">
                <span className="bg-[#d1d7db] text-[11px] px-2.5 py-1 rounded-md text-[#54656f] font-medium shadow-sm">OGGI</span>
              </div>
              
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      "relative max-w-[85%] px-3 py-1.5 rounded-lg text-[14px] shadow-[0_1px_0.5px_rgba(0,0,0,0.1)] select-none group transition-all",
                      msg.sender === 'me' 
                        ? "bg-wa-bubble-sent self-end rounded-tr-none text-wa-text-dark" 
                        : "bg-wa-bubble-received self-start rounded-tl-none text-wa-text-dark"
                    )}
                  >
                    {/* Tiny triangle for WhatsApp bubble */}
                    <div className={cn(
                      "absolute top-0 w-3 h-3 border-t-8 border-transparent z-0",
                      msg.sender === 'me'
                        ? "right-[-6px] border-l-8 border-l-wa-bubble-sent"
                        : "left-[-6px] border-r-8 border-r-wa-bubble-received"
                    )} />

                    {msg.type === 'image' && msg.image && (
                      <div className="relative mb-1 rounded-md overflow-hidden bg-gray-100 border border-black/5">
                        <img src={msg.image} className="max-w-full block" />
                      </div>
                    )}

                    {msg.type === 'audio' && (
                      <div className="flex items-center gap-3 py-1 pr-6 min-w-[200px]">
                        <button 
                          onClick={() => playVoice(msg)}
                          className="w-10 h-10 rounded-full bg-wa-green/10 flex items-center justify-center text-wa-green hover:bg-wa-green/20 transition-colors"
                        >
                          {isPlaying === msg.id ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="h-1.5 w-full bg-black/10 rounded-full relative overflow-hidden">
                            <motion.div 
                              className="absolute inset-y-0 left-0 bg-wa-green rounded-full"
                              initial={{ width: "0%" }}
                              animate={{ width: isPlaying === msg.id ? "100%" : "0%" }}
                              transition={{ duration: 10, ease: "linear" }}
                            />
                          </div>
                          <div className="flex justify-between items-center px-0.5">
                            <span className="text-[9px] text-wa-text-light font-medium uppercase tracking-tighter">Messaggio Vocale</span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                           {profilePic ? <img src={profilePic} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-gray-400" />}
                           <div className="absolute top-0 right-0 w-2 h-2 bg-wa-green rounded-full border border-white" />
                        </div>
                      </div>
                    )}
                    
                    {msg.type === 'text' && msg.text && <p className="mb-1 leading-normal break-words pr-12">{msg.text}</p>}
                    
                    <div className="absolute bottom-1 right-2 flex items-center gap-1.5">
                      {msg.type === 'text' && msg.text && (
                        <button 
                          onClick={() => playVoice(msg)}
                          className={cn(
                            "p-0.5 rounded-full hover:bg-black/5 transition-colors",
                            isPlaying === msg.id ? "text-wa-green animate-pulse" : "text-wa-text-light opacity-50 hover:opacity-100"
                          )}
                        >
                          {isPlaying === msg.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                      )}
                      <span className="text-[10px] text-wa-text-light">
                        {msg.timestamp}
                      </span>
                    </div>

                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-lg transition-opacity z-20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bottom Input Area (Mock - visual only) */}
            <div className="bg-[#f0f2f5] p-3 flex items-center gap-2">
              <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-sm border border-black/5">
                <Smile className="w-5 h-5 text-gray-400" />
                <div className="flex-1 text-gray-300 text-sm italic py-0.5">Usa i comandi a sinistra...</div>
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="bg-wa-green p-2.5 rounded-full shadow-md text-white">
                <div className="w-5 h-5 flex items-center justify-center text-xs">🎤</div>
              </div>
            </div>
          </div>
        </div>

        {/* Removed redundant Bottom Editor Toolbar */}
      </div>
    </div>
  );
}
