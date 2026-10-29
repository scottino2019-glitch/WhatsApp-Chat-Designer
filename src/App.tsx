import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Smile, 
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
  Pause,
  Users,
  Check,
  CheckCheck,
  Camera,
  Trash2
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export interface Participant {
  id: string;
  name: string;
  avatar: string | null;
  color: string;
  isMe: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  image?: string;
  type: 'text' | 'audio' | 'image';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const WA_COLORS = [
  '#029676', // Smeraldo
  '#1f7aec', // Blu reale
  '#df7000', // Arancione
  '#e542a3', // Magenta / Fucsia
  '#8d39ec', // Viola
  '#a62c2b', // Rosso scuro
  '#008069', // Verde scuro
  '#d64d00', // Rame
];

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
];

export default function App() {
  // Chat Type: 'single' (1 a 1) or 'group' (Chat di gruppo)
  const [chatType, setChatType] = useState<'single' | 'group'>('group');
  
  // Single Chat Details
  const [singleContactName, setSingleContactName] = useState('Mario Rossi');
  const [singleContactStatus, setSingleContactStatus] = useState('online');
  const [singleContactAvatar, setSingleContactAvatar] = useState<string | null>(DEFAULT_AVATARS[0]);
  
  // Group Chat Details
  const [groupName, setGroupName] = useState('Gruppo Calcetto ⚽🍕');
  const [groupAvatar, setGroupAvatar] = useState<string | null>(
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80'
  );

  // Avatar Display Setting
  const [showAvatarsInChat, setShowAvatarsInChat] = useState(true);

  // Participants list
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'p-me',
      name: 'Tu',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      color: '#075e54',
      isMe: true,
    },
    {
      id: 'p-mario',
      name: 'Mario',
      avatar: DEFAULT_AVATARS[0],
      color: '#1f7aec',
      isMe: false,
    },
    {
      id: 'p-laura',
      name: 'Laura',
      avatar: DEFAULT_AVATARS[1],
      color: '#e542a3',
      isMe: false,
    },
    {
      id: 'p-marco',
      name: 'Marco',
      avatar: DEFAULT_AVATARS[2],
      color: '#df7000',
      isMe: false,
    },
  ]);

  const [activeSenderId, setActiveSenderId] = useState<string>('p-mario');

  // Messages list
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'p-mario',
      text: 'Ragazzi, ci siamo per giovedì alle 20:00 al campo?',
      type: 'text',
      timestamp: '19:42',
      status: 'read'
    },
    {
      id: '2',
      senderId: 'p-laura',
      text: 'Io porto le maglie e i palloni!',
      type: 'text',
      timestamp: '19:43',
      status: 'read'
    },
    {
      id: '3',
      senderId: 'p-me',
      text: 'Perfetto, ho appena confermato la prenotazione!',
      type: 'text',
      timestamp: '19:44',
      status: 'read'
    },
    {
      id: '4',
      senderId: 'p-marco',
      text: 'Grande! Arrivo puntuale stavolta',
      type: 'audio',
      timestamp: '19:45',
      status: 'read'
    }
  ]);

  // Form Controls
  const [inputText, setInputText] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'audio'>('text');
  const [messageStatus, setMessageStatus] = useState<'sent' | 'delivered' | 'read'>('read');
  const [customTimestamp, setCustomTimestamp] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  // New Participant Form Modal/Section
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantAvatar, setNewParticipantAvatar] = useState<string | null>(null);

  // Speech Synthesis
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatImageInputRef = useRef<HTMLInputElement>(null);
  const singleAvatarInputRef = useRef<HTMLInputElement>(null);
  const groupAvatarInputRef = useRef<HTMLInputElement>(null);
  const memberAvatarInputRef = useRef<HTMLInputElement>(null);
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);

  // Auto-scroll on new messages
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
        const itVoice = availableVoices.find(v => v.lang.startsWith('it'));
        setSelectedVoice(itVoice ? itVoice.name : availableVoices[0].name);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const getSender = (senderId: string): Participant => {
    if (chatType === 'single') {
      if (senderId === 'p-me') {
        return participants.find(p => p.isMe) || {
          id: 'p-me',
          name: 'Tu',
          avatar: null,
          color: '#075e54',
          isMe: true
        };
      }
      return {
        id: 'p-single',
        name: singleContactName,
        avatar: singleContactAvatar,
        color: '#1f7aec',
        isMe: false
      };
    }
    return (
      participants.find(p => p.id === senderId) || {
        id: senderId,
        name: 'Utente',
        avatar: null,
        color: '#029676',
        isMe: false
      }
    );
  };

  const addMessage = (data: Partial<Message>) => {
    const now = new Date();
    const defaultTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: data.senderId || activeSenderId,
      text: data.text,
      image: data.image,
      type: data.type || (data.image ? 'image' : messageType),
      timestamp: customTimestamp.trim() || defaultTime,
      status: messageStatus,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addMessage({ image: reader.result as string, type: 'image' });
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const playVoice = (message: Message) => {
    if (!message.text && message.type !== 'audio') return;
    const textToSpeak = message.text || "Messaggio vocale";
    
    window.speechSynthesis.cancel();
    
    setIsPlaying(message.id);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    
    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => setIsPlaying(null);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;
    const nextColor = WA_COLORS[participants.length % WA_COLORS.length];
    const newParticipant: Participant = {
      id: `p-${Date.now()}`,
      name: newParticipantName.trim(),
      avatar: newParticipantAvatar || DEFAULT_AVATARS[participants.length % DEFAULT_AVATARS.length],
      color: nextColor,
      isMe: false,
    };
    setParticipants(prev => [...prev, newParticipant]);
    setActiveSenderId(newParticipant.id);
    setNewParticipantName('');
    setNewParticipantAvatar(null);
    setShowAddParticipantModal(false);
  };

  const handleUpdateParticipantAvatar = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setParticipants(prev => prev.map(p => p.id === id ? { ...p, avatar: reader.result as string } : p));
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteParticipant = (id: string) => {
    if (participants.length <= 2) return;
    setParticipants(prev => prev.filter(p => p.id !== id));
    if (activeSenderId === id) {
      setActiveSenderId(participants[0].id);
    }
  };

  const currentGroupSubtitle = () => {
    const names = participants.map(p => p.isMe ? 'Tu' : p.name);
    return names.join(', ');
  };

  const exportChatAsHtml = () => {
    const headerTitle = chatType === 'group' ? groupName : singleContactName;
    const headerSubtitle = chatType === 'group' ? currentGroupSubtitle() : singleContactStatus;
    const headerAvatar = chatType === 'group' ? groupAvatar : singleContactAvatar;

    const chatHtml = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhatsApp - ${headerTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #efeae2;
      background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
      background-blend-mode: overlay;
      display: flex;
      justify-content: center;
      min-height: 100vh;
      color: #111b21;
    }
    .phone-container {
      width: 100%;
      max-width: 480px;
      min-height: 100vh;
      background-color: #efeae2;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      position: relative;
    }
    .header {
      background-color: #008069;
      color: #ffffff;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .header-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #dfe5e7;
      overflow: hidden;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .header-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .header-info { flex: 1; min-width: 0; }
    .header-title { font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .header-subtitle { font-size: 12px; opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .messages-container {
      flex: 1;
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .date-badge {
      align-self: center;
      background-color: rgba(255, 255, 255, 0.9);
      color: #54656f;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 12px;
      border-radius: 8px;
      box-shadow: 0 1px 1px rgba(11,20,26,0.12);
      margin: 8px 0;
      text-transform: uppercase;
    }
    .message-row {
      display: flex;
      gap: 8px;
      margin-bottom: 4px;
      max-width: 85%;
    }
    .row-me { align-self: flex-end; justify-content: flex-end; }
    .row-other { align-self: flex-start; justify-content: flex-start; }
    .msg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #dfe5e7;
      overflow: hidden;
      flex-shrink: 0;
      align-self: flex-start;
      margin-top: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .msg-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .bubble {
      padding: 6px 9px 8px 9px;
      border-radius: 8px;
      position: relative;
      font-size: 14.2px;
      line-height: 1.35;
      box-shadow: 0 1px 0.5px rgba(11,20,26,0.13);
      word-break: break-word;
      min-width: 80px;
    }
    .bubble-me {
      background-color: #d9fdd3;
      border-top-right-radius: 0;
    }
    .bubble-other {
      background-color: #ffffff;
      border-top-left-radius: 0;
    }
    .sender-name {
      font-size: 12.5px;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .text-content {
      padding-right: 50px;
    }
    .time-status {
      float: right;
      margin-top: 4px;
      margin-left: 8px;
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 11px;
      color: #667781;
    }
    .audio-player {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 0;
      min-width: 210px;
    }
    .play-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #00a884;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      font-size: 14px;
    }
    .audio-wave {
      flex: 1;
      height: 4px;
      background: rgba(0,0,0,0.1);
      border-radius: 2px;
      position: relative;
    }
    .audio-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 1.5px solid #00a884;
    }
    .audio-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .tick-blue { color: #53bdeb; font-weight: bold; }
    .tick-gray { color: #8696a0; }
  </style>
</head>
<body>
  <div class="phone-container">
    <div class="header">
      <div class="header-avatar">
        ${headerAvatar ? `<img src="${headerAvatar}" alt="avatar">` : '👥'}
      </div>
      <div class="header-info">
        <div class="header-title">${headerTitle}</div>
        <div class="header-subtitle">${headerSubtitle}</div>
      </div>
    </div>
    
    <div class="messages-container">
      <div class="date-badge">OGGI</div>
      ${messages.map(m => {
        const sender = getSender(m.senderId);
        const isMe = sender.isMe;
        const safeText = (m.text || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        let tickHtml = '';
        if (isMe) {
          if (m.status === 'read') {
            tickHtml = '<span class="tick-blue">✓✓</span>';
          } else if (m.status === 'delivered') {
            tickHtml = '<span class="tick-gray">✓✓</span>';
          } else {
            tickHtml = '<span class="tick-gray">✓</span>';
          }
        }

        return `
        <div class="message-row ${isMe ? 'row-me' : 'row-other'}">
          ${!isMe && showAvatarsInChat ? `
            <div class="msg-avatar" title="${sender.name}">
              ${sender.avatar ? `<img src="${sender.avatar}" alt="${sender.name}">` : '👤'}
            </div>
          ` : ''}
          <div class="bubble ${isMe ? 'bubble-me' : 'bubble-other'}">
            ${chatType === 'group' && !isMe ? `
              <div class="sender-name" style="color: ${sender.color};">${sender.name}</div>
            ` : ''}
            
            ${m.type === 'image' && m.image ? `
              <img src="${m.image}" style="width: 100%; border-radius: 6px; margin-bottom: 4px; display: block;">
            ` : ''}

            ${m.type === 'audio' ? `
              <div class="audio-player">
                <div class="play-circle" onclick="speakText('${safeText || 'Messaggio vocale'}')">▶</div>
                <div class="audio-wave"></div>
                <div class="audio-avatar">
                  ${sender.avatar ? `<img src="${sender.avatar}">` : '<div style="background:#ddd;width:100%;height:100%"></div>'}
                </div>
              </div>
              <div style="font-size:10px; color:#667781; margin-top:2px;">Messaggio vocale (${m.timestamp})</div>
            ` : ''}

            ${m.type === 'text' && m.text ? `
              <div class="text-content">
                ${m.text}
                <button onclick="speakText('${safeText}')" style="background:none; border:none; cursor:pointer; color:#00a884; font-size:12px; margin-left:4px;" title="Ascolta">▶</button>
              </div>
            ` : ''}

            <div class="time-status">
              <span>${m.timestamp}</span>
              ${tickHtml}
            </div>
          </div>
        </div>
        `;
      }).join('')}
    </div>
  </div>

  <script>
    function speakText(text) {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const itVoice = voices.find(v => v.lang.startsWith('it')) || voices[0];
      if (itVoice) utterance.voice = itVoice;
      window.speechSynthesis.speak(utterance);
    }
    window.speechSynthesis.getVoices();
  </script>
</body>
</html>`;

    const blob = new Blob([chatHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-${headerTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
    a.click();
  };

  return (
    <div className={cn("flex h-screen bg-[#f0f2f5] font-sans text-zinc-900 overflow-hidden", darkMode && "dark bg-zinc-950 text-zinc-100")}>
      
      {/* Hidden file input for member avatar change */}
      <input 
        type="file" 
        ref={memberAvatarInputRef}
        onChange={(e) => {
          if (editingParticipantId) {
            handleUpdateParticipantAvatar(editingParticipantId, e);
          }
        }}
        accept="image/*"
        className="hidden"
      />

      {/* Hidden file input for chat image */}
      <input 
        type="file" 
        ref={chatImageInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* LEFT SIDEBAR: CREATOR CONTROLS */}
      <div className="w-[410px] bg-white border-r border-wa-border flex flex-col h-full overflow-y-auto z-20 shadow-md dark:bg-zinc-900 dark:border-zinc-800">
        
        {/* App Bar */}
        <div className="p-4 border-b border-wa-border dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">WhatsApp Studio</h1>
              <p className="text-[11px] text-zinc-500">Creatore Chat & Gruppi</p>
            </div>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title="Cambia tema"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>
        </div>

        <div className="p-4 space-y-5 flex-1">
          
          {/* TAB: CHAT SINGOLA VS CHAT DI GRUPPO */}
          <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => {
                setChatType('single');
                setActiveSenderId('p-mario');
              }}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                chatType === 'single'
                  ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <User className="w-3.5 h-3.5" /> Chat Singola
            </button>
            <button
              onClick={() => {
                setChatType('group');
                setActiveSenderId('p-mario');
              }}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                chatType === 'group'
                  ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <Users className="w-3.5 h-3.5" /> Chat di Gruppo
            </button>
          </div>

          {/* CHAT IDENTITY SETTINGS */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                {chatType === 'group' ? 'Impostazioni Gruppo' : 'Contatto'}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                {chatType === 'group' ? 'Multiplo' : '1 a 1'}
              </span>
            </div>

            {chatType === 'group' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center border-2 border-emerald-500">
                      {groupAvatar ? (
                        <img src={groupAvatar} alt="Gruppo" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-6 h-6 text-zinc-500" />
                      )}
                    </div>
                    <button 
                      onClick={() => groupAvatarInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Cambia foto gruppo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input 
                      type="file"
                      ref={groupAvatarInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setGroupAvatar(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Nome Gruppo</label>
                    <input 
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Nome del gruppo..."
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center border-2 border-emerald-500">
                      {singleContactAvatar ? (
                        <img src={singleContactAvatar} alt="Contatto" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-zinc-500" />
                      )}
                    </div>
                    <button 
                      onClick={() => singleAvatarInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Cambia foto profilo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input 
                      type="file"
                      ref={singleAvatarInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setSingleContactAvatar(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Nome</label>
                      <input 
                        value={singleContactName}
                        onChange={(e) => setSingleContactName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Stato</label>
                      <input 
                        value={singleContactStatus}
                        onChange={(e) => setSingleContactStatus(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AVATAR TOGGLE */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block">Foto profilo nei messaggi</span>
                <span className="text-[10px] text-zinc-500">Mostra l'avatar rotondo accanto ai fumetti ricevuti</span>
              </div>
              <input 
                type="checkbox"
                checked={showAvatarsInChat}
                onChange={(e) => setShowAvatarsInChat(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* PARTECIPANTI (Disponibile in modalità gruppo, ma visualizzabile anche per modificare il proprio avatar) */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Partecipanti alla chat ({participants.length})
              </span>
              <button 
                onClick={() => setShowAddParticipantModal(!showAddParticipantModal)}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Nuovo
              </button>
            </div>

            {/* Modal / Quick form to add new member */}
            {showAddParticipantModal && (
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-300 dark:border-emerald-700 space-y-2">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Aggiungi nuovo membro</div>
                <div className="flex gap-2">
                  <input 
                    value={newParticipantName}
                    onChange={(e) => setNewParticipantName(e.target.value)}
                    placeholder="Nome persona..."
                    className="flex-1 px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                  />
                  <button 
                    onClick={handleAddParticipant}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                  >
                    Salva
                  </button>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-1">Oppure seleziona una foto avatar rapida:</span>
                  <div className="flex gap-1.5">
                    {DEFAULT_AVATARS.map((url, i) => (
                      <img 
                        key={i} 
                        src={url} 
                        onClick={() => setNewParticipantAvatar(url)}
                        className={cn(
                          "w-7 h-7 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-110",
                          newParticipantAvatar === url ? "border-emerald-500 scale-105" : "border-transparent"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Participants list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {participants.map((p) => (
                <div 
                  key={p.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg border transition-all text-xs",
                    activeSenderId === p.id 
                      ? "bg-emerald-50/80 border-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-700"
                      : "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
                  )}
                >
                  <div 
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                    onClick={() => setActiveSenderId(p.id)}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                        {p.avatar ? (
                          <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 m-2 text-zinc-500" />
                        )}
                      </div>
                      <span 
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900" 
                        style={{ backgroundColor: p.color }}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold flex items-center gap-1.5">
                        <span className="truncate">{p.name}</span>
                        {p.isMe && (
                          <span className="text-[9px] bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-1 rounded">Tu</span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 block truncate" style={{ color: p.color }}>
                        {p.isMe ? 'Mittente predefinito (Dx)' : 'Destinatario (Sx)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setEditingParticipantId(p.id);
                        memberAvatarInputRef.current?.click();
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      title="Cambia foto avatar"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    {!p.isMe && participants.length > 2 && (
                      <button 
                        onClick={() => deleteParticipant(p.id)}
                        className="p-1 rounded text-zinc-400 hover:text-red-500"
                        title="Rimuovi partecipante"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CREA MESSAGGIO */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-1.5 flex justify-between items-center">
              <span>Nuovo Messaggio</span>
              <span className="text-[10px] text-zinc-400">Clicca sul mittente</span>
            </div>

            {/* SELEZIONE MITTENTE (CHI SCRIVE?) */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Chi sta parlando?</label>
              <div className="grid grid-cols-2 gap-1.5">
                {participants.map((p) => {
                  const isSelected = activeSenderId === p.id;
                  return (
                    <button 
                      key={p.id}
                      onClick={() => setActiveSenderId(p.id)}
                      className={cn(
                        "flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all",
                        isSelected 
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm font-semibold" 
                          : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                      )}
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex-shrink-0">
                        {p.avatar ? (
                          <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-3 h-3 m-1.5 text-zinc-500" />
                        )}
                      </div>
                      <span className="text-xs truncate flex-1">{p.name}</span>
                      {p.isMe && <span className="text-[9px] opacity-80">(Dx)</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TIPO DI MESSAGGIO */}
            <div className="grid grid-cols-2 gap-1.5">
              <button 
                onClick={() => setMessageType('text')}
                className={cn(
                  "py-1.5 rounded-lg text-xs font-semibold border transition-all",
                  messageType === 'text' 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700" 
                    : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                )}
              >
                💬 Messaggio Testo
              </button>
              <button 
                onClick={() => setMessageType('audio')}
                className={cn(
                  "py-1.5 rounded-lg text-xs font-semibold border transition-all",
                  messageType === 'audio' 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700" 
                    : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                )}
              >
                🎤 Nota Vocale
              </button>
            </div>

            {/* INPUT TESTO */}
            <div className="relative">
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={messageType === 'audio' ? "Testo da riprodurre vocalmente..." : "Scrivi cosa dice il personaggio..."}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 min-h-[75px]"
              />
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-2 bottom-2 text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Inserisci emoji"
              >
                <Smile className="w-4 h-4" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-50">
                  <EmojiPicker 
                    onEmojiClick={(emojiData) => setInputText(prev => prev + emojiData.emoji)}
                    width={290}
                    height={320}
                  />
                </div>
              )}
            </div>

            {/* OPZIONI: ORARIO & SPUNTE */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Orario (opzionale)</label>
                <input 
                  type="text"
                  value={customTimestamp}
                  onChange={(e) => setCustomTimestamp(e.target.value)}
                  placeholder="Es: 19:46"
                  className="w-full px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Spunta Ricevuta</label>
                <select 
                  value={messageStatus}
                  onChange={(e) => setMessageStatus(e.target.value as any)}
                  className="w-full px-2 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                >
                  <option value="read">✓✓ Doppia Blu</option>
                  <option value="delivered">✓✓ Doppia Grigia</option>
                  <option value="sent">✓ Singola</option>
                </select>
              </div>
            </div>

            {/* PULSANTI AZIONE */}
            <div className="flex gap-2 pt-1">
              <button 
                onClick={() => chatImageInputRef.current?.click()}
                className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                title="Invia immagine nella chat"
              >
                <ImageIcon className="w-4 h-4 text-emerald-600" /> Foto
              </button>
              
              <button 
                onClick={() => addMessage({ text: inputText })}
                disabled={!inputText.trim()}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Invia Messaggio
              </button>
            </div>
          </div>

          {/* SINTESI VOCALE & ESPORTAZIONE */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block border-b border-zinc-200 dark:border-zinc-700 pb-1.5">
              Voce & Download
            </span>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Voce del Browser</label>
              <select 
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
              >
                {voices.map((voice, idx) => (
                  <option key={`${voice.name}-${voice.lang}-${idx}`} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={exportChatAsHtml}
              className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-zinc-100 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" /> Esporta Chat Standalone (.HTML)
            </button>
          </div>
        </div>
      </div>

      {/* MAIN PREVIEW AREA */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#e5ddd5]/30 dark:bg-zinc-950">
        
        {/* Floating Quick Helper Badge */}
        <div className="absolute top-4 right-6 hidden xl:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs text-zinc-600 dark:text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>WhatsApp Live Preview • {chatType === 'group' ? 'Modalità Gruppo' : 'Chat Diretta'}</span>
        </div>

        {/* Realistic Smartphone Shell */}
        <div className="w-[390px] h-[720px] bg-[#efeae2] rounded-[44px] shadow-[0_25px_60px_rgba(0,0,0,0.25)] relative overflow-hidden border-[10px] border-[#1c1c1e] flex flex-col">
          
          {/* Phone Dynamic Island / Speaker */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#1c1c1e] rounded-full z-40 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-zinc-800/80 mr-3"></div>
            <div className="w-10 h-1 bg-zinc-800 rounded-full"></div>
          </div>

          {/* WhatsApp Header Bar */}
          <div className="bg-[#008069] text-white pt-7 pb-2.5 px-3 flex items-center gap-2.5 shadow-md z-30 select-none">
            <ChevronLeft className="w-5 h-5 cursor-pointer -ml-1 text-white/90 hover:text-white" />
            
            {/* Header Avatar */}
            <div className="w-9 h-9 rounded-full bg-zinc-300 dark:bg-zinc-700 overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/20">
              {chatType === 'group' ? (
                groupAvatar ? (
                  <img src={groupAvatar} alt="Gruppo" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-5 h-5 text-zinc-600" />
                )
              ) : (
                singleContactAvatar ? (
                  <img src={singleContactAvatar} alt="Contatto" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-zinc-600" />
                )
              )}
            </div>

            {/* Header Info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm leading-tight truncate">
                {chatType === 'group' ? groupName : singleContactName}
              </h2>
              <p className="text-[11px] text-emerald-100 truncate">
                {chatType === 'group' ? currentGroupSubtitle() : singleContactStatus}
              </p>
            </div>

            {/* Header Action Icons */}
            <div className="flex items-center gap-3 text-white/90 pr-1">
              <Video className="w-4 h-4 cursor-pointer hover:text-white" />
              <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
              <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* Chat Message Scrollable Canvas */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2 relative"
            style={{
              backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
              backgroundSize: '360px',
              backgroundBlendMode: 'overlay'
            }}
          >
            {/* Date Badge */}
            <div className="self-center my-1">
              <span className="bg-white/90 text-[#54656f] text-[10px] font-semibold px-2.5 py-0.5 rounded-md shadow-sm uppercase">
                Oggi
              </span>
            </div>

            <AnimatePresence>
              {messages.map((msg) => {
                const sender = getSender(msg.senderId);
                const isMe = sender.isMe;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      "flex items-start gap-1.5 group max-w-[85%] relative",
                      isMe ? "self-end flex-row-reverse" : "self-start flex-row"
                    )}
                  >
                    {/* SENDER AVATAR (Left of received messages) */}
                    {!isMe && showAvatarsInChat && (
                      <div 
                        className="w-7 h-7 rounded-full overflow-hidden bg-zinc-300 flex-shrink-0 mt-0.5 shadow-sm border border-white"
                        title={sender.name}
                      >
                        {sender.avatar ? (
                          <img src={sender.avatar} alt={sender.name} className="w-full h-full object-cover" />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: sender.color }}
                          >
                            {sender.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* WhatsApp Chat Bubble */}
                    <div 
                      className={cn(
                        "relative px-2.5 py-1.5 rounded-lg text-[13.5px] leading-[1.3] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]",
                        isMe 
                          ? "bg-[#d9fdd3] text-[#111b21] rounded-tr-none" 
                          : "bg-white text-[#111b21] rounded-tl-none"
                      )}
                    >
                      {/* Triangle Tail */}
                      <div 
                        className={cn(
                          "absolute top-0 w-2.5 h-2.5 border-t-[8px] border-t-transparent",
                          isMe 
                            ? "right-[-5px] border-l-[8px] border-l-[#d9fdd3]" 
                            : "left-[-5px] border-r-[8px] border-r-white"
                        )} 
                      />

                      {/* Group Sender Name in authentic WhatsApp color */}
                      {chatType === 'group' && !isMe && (
                        <div 
                          className="font-bold text-[11.5px] mb-0.5 cursor-default truncate max-w-[200px]"
                          style={{ color: sender.color }}
                        >
                          {sender.name}
                        </div>
                      )}

                      {/* Image Message */}
                      {msg.type === 'image' && msg.image && (
                        <div className="relative mb-1 rounded-md overflow-hidden bg-black/5">
                          <img src={msg.image} alt="Inviata" className="w-full object-cover max-h-56 block rounded-md" />
                        </div>
                      )}

                      {/* Voice Note Bubble */}
                      {msg.type === 'audio' && (
                        <div className="flex items-center gap-2.5 py-1 pr-2 min-w-[210px]">
                          <button 
                            onClick={() => playVoice(msg)}
                            className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-transform active:scale-95 flex-shrink-0"
                            title="Riproduci messaggio vocale"
                          >
                            {isPlaying === msg.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                          </button>

                          <div className="flex-1 flex flex-col gap-1">
                            {/* Realistic WhatsApp sound bars */}
                            <div className="h-4 flex items-center gap-[2px]">
                              {[40, 70, 30, 90, 50, 80, 60, 100, 40, 75, 55, 95, 30, 85, 65, 45, 90, 35].map((h, i) => (
                                <div 
                                  key={i} 
                                  className={cn(
                                    "w-[2px] rounded-full transition-all",
                                    isPlaying === msg.id ? "bg-emerald-600" : "bg-zinc-400"
                                  )}
                                  style={{ height: `${h}%` }}
                                />
                              ))}
                            </div>
                            <span className="text-[9px] text-[#667781] font-medium uppercase tracking-tight">Nota Vocale</span>
                          </div>

                          {/* Mini Avatar inside audio bubble */}
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-200 border border-emerald-500/50 flex-shrink-0">
                            {sender.avatar ? (
                              <img src={sender.avatar} alt={sender.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-800">
                                {sender.name.slice(0, 1)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Text Message */}
                      {msg.type === 'text' && msg.text && (
                        <div className="flex items-start justify-between gap-3">
                          <p className="break-words select-text">{msg.text}</p>
                          <button 
                            onClick={() => playVoice(msg)}
                            className={cn(
                              "text-zinc-400 hover:text-emerald-600 transition-colors pt-0.5 flex-shrink-0",
                              isPlaying === msg.id && "text-emerald-600 animate-pulse"
                            )}
                            title="Ascolta con sintesi vocale"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Timestamp & Read Ticks */}
                      <div className="flex items-center justify-end gap-1 mt-0.5 -mb-0.5 text-[10px] text-[#667781]">
                        <span>{msg.timestamp}</span>
                        {isMe && (
                          <span className="inline-flex items-center">
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-[#8696a0]" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Delete on hover */}
                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded-full transition-opacity shadow-sm self-center hover:bg-red-600"
                      title="Elimina messaggio"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* WhatsApp Bottom Input Bar (Simulated UI) */}
          <div className="bg-[#f0f2f5] px-2 py-2 flex items-center gap-1.5 z-20">
            <div className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm border border-black/5">
              <Smile className="w-4 h-4 text-zinc-400" />
              <div className="flex-1 text-zinc-400 text-xs italic truncate">Messaggio...</div>
              <ImageIcon className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="w-8 h-8 rounded-full bg-[#008069] flex items-center justify-center text-white shadow-sm">
              <div className="text-xs">🎤</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
