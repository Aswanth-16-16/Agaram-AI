import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Paperclip,
  Mic,
  MicOff,
  ArrowUp,
  Sparkles,
  Edit2,
  Trash2,
  Plus,
  X,
  Check,
  Bot,
  User,
  BookOpen,
} from 'lucide-react';
import {
  StudentProfile,
  ChatConversation,
  ChatMessage,
} from '../types.ts';

interface AITutorViewProps {
  activeProfile: StudentProfile;
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onSendMessage: (text: string) => Promise<void>;
  onRenameConversation: (chatId: string, newTitle: string) => Promise<void>;
  onDeleteConversation: (chatId: string) => Promise<void>;
  showHistoryDrawer: boolean;
  onCloseHistoryDrawer: () => void;
  soundEnabled: boolean;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  activeProfile,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onSendMessage,
  onRenameConversation,
  onDeleteConversation,
  showHistoryDrawer,
  onCloseHistoryDrawer,
  soundEnabled,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  // In-line conversation rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isSending]);

  // Read aloud response using Web Speech Synthesis matching profile voice persona
  const handleReadAloud = (textToRead: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Apply voice persona settings
    if (activeProfile.voicePersona === 'female') {
      utterance.pitch = 1.15;
      utterance.rate = 1.0;
    } else {
      utterance.pitch = 0.95;
      utterance.rate = 1.0;
    }

    // Try finding an appropriate browser voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const match = voices.find((v) =>
        activeProfile.voicePersona === 'female'
          ? /female|samantha|zira|karen|victoria/i.test(v.name)
          : /male|david|daniel|alex|george/i.test(v.name)
      );
      if (match) utterance.voice = match;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Simulated or Web Speech mic dictation
  const handleToggleVoiceInput = () => {
    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListeningVoice(true);
        recognition.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListeningVoice(false);
        };
        recognition.onerror = () => setIsListeningVoice(false);
        recognition.onend = () => setIsListeningVoice(false);
        recognition.start();
        return;
      } catch (err) {
        console.warn('SpeechRecognition failed, falling back:', err);
      }
    }

    // Fallback simulation
    setIsListeningVoice(true);
    setTimeout(() => {
      setInputText('Explain photosynthesis in simple words');
      setIsListeningVoice(false);
    }, 1500);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    const msg = inputText.trim();
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsSending(true);
    try {
      await onSendMessage(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartRename = (conv: ChatConversation) => {
    setRenamingId(conv.id);
    setRenameInput(conv.title);
  };

  const handleSaveRename = async (convId: string) => {
    if (!renameInput.trim()) return;
    await onRenameConversation(convId, renameInput.trim());
    setRenamingId(null);
  };

  return (
    <div className="flex-1 flex overflow-hidden relative bg-[#080A0D] bg-grid-pattern">
      {/* ======================================================== */}
      {/* PROFILE-SPECIFIC CHAT HISTORY SIDEBAR / DRAWER           */}
      {/* ======================================================== */}
      <div
        className={`fixed inset-y-0 right-0 z-30 w-80 bg-[#0E131B] border-l border-[#1F2737] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          showHistoryDrawer ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#1C2433] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-white">Chat History</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#1A2332] text-[10px] font-semibold text-[#8B98AD]">
              {activeProfile.name}
            </span>
          </div>
          <button
            onClick={onCloseHistoryDrawer}
            className="p-1 rounded text-[#717E91] hover:text-white hover:bg-[#1A2332] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Start New Conversation Button */}
        <div className="p-3 border-b border-[#1C2433]/60">
          <button
            onClick={() => {
              onNewConversation();
              onCloseHistoryDrawer();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#FF681F] hover:bg-[#FF7A38] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Conversation</span>
          </button>
        </div>

        {/* List of Conversations for THIS profile */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-xs text-[#6C7A8D]">
              <p>No conversations yet for {activeProfile.name}.</p>
              <p className="mt-1 text-[#8C9BB0]">
                Ask any question below to automatically generate meaningful topic titles!
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConv?.id;
              const isRenaming = renamingId === conv.id;

              if (isRenaming) {
                return (
                  <div
                    key={conv.id}
                    className="p-2.5 rounded-xl bg-[#151C28] border border-[#FF681F]/50 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                      className="flex-1 px-2 py-1 rounded bg-[#0D121A] text-white text-xs border border-[#2B364A] focus:outline-none focus:border-[#FF681F]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(conv.id);
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                    />
                    <button
                      onClick={() => handleSaveRename(conv.id)}
                      className="p-1 rounded bg-[#FF681F] text-white hover:bg-[#FF7A38] cursor-pointer"
                      title="Save Title"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setRenamingId(null)}
                      className="p-1 rounded bg-[#20293A] text-[#8694A8] hover:text-white cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onCloseHistoryDrawer();
                  }}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-[#151C28] border-[#FF681F] text-white shadow-sm'
                      : 'bg-[#10151E] border-[#1C2433] hover:border-[#2C384B] hover:bg-[#131924] text-[#A2B0C5]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate text-white">
                      {conv.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[#6E7D93] mt-0.5">
                      <span>{conv.subject}</span>
                      <span>•</span>
                      <span>{conv.messages.length} msgs</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(conv);
                      }}
                      className="p-1.5 rounded-lg text-[#8594A6] hover:text-white hover:bg-[#1E2738] cursor-pointer"
                      title="Rename Conversation"
                      aria-label="Rename Conversation"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete conversation "${conv.title}"?`)) {
                          onDeleteConversation(conv.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[#8594A6] hover:text-rose-400 hover:bg-[#1E2738] cursor-pointer"
                      title="Delete Conversation"
                      aria-label="Delete Conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {showHistoryDrawer && (
        <div
          onClick={onCloseHistoryDrawer}
          className="fixed inset-0 bg-black/60 z-20 backdrop-blur-xs"
        />
      )}

      {/* ======================================================== */}
      {/* MAIN CHAT AREA                                           */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Messages Scroll View */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          {(!activeConv || activeConv.messages.length === 0) ? (
            /* Empty State / Welcome Screen */
            <div className="max-w-2xl mx-auto my-auto text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF681F]/20 to-orange-500/10 border border-[#FF681F]/30 flex items-center justify-center text-[#FF681F] mb-4">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                AGARAM AI Tutor for {activeProfile.name}
              </h3>
              <p className="text-sm text-[#818FA3] max-w-md mx-auto mb-6">
                Ask any question on your course subjects. The AI Tutor automatically
                analyzes your query to generate concise, meaningful conversation titles.
              </p>

              {/* Sample Starters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg text-left">
                {[
                  'Explain photosynthesis in simple words',
                  'How do I solve quadratic equations?',
                  "Explain Newton's three laws",
                  'What is the difference between RAM and ROM?',
                  'Help me understand integration',
                  'Give me 10 questions on Python loops',
                ].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => {
                      setInputText(sample);
                      textareaRef.current?.focus();
                    }}
                    className="p-3 rounded-xl bg-[#10151E] border border-[#1E2636] hover:border-[#FF681F]/40 hover:bg-[#141A25] transition-all text-xs text-[#A2B1C7] hover:text-white cursor-pointer"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeConv.messages.map((message) => {
              if (message.sender === 'student') {
                return (
                  <div
                    key={message.id}
                    className="flex justify-end items-start gap-3 max-w-3xl ml-auto"
                  >
                    <div className="p-4 rounded-2xl rounded-tr-xs bg-[#192231] border border-[#26334A] text-white text-sm max-w-xl shadow-md">
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow">
                      {activeProfile.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                );
              }

              // Tutor Message
              return (
                <div
                  key={message.id}
                  className="flex flex-col gap-3 max-w-4xl mr-auto"
                >
                  {/* Tutor Card matching screenshot ai-tutor-response_41267c0b.png */}
                  <div className="p-5 md:p-6 rounded-2xl bg-[#0F141C] border border-[#1F2737] shadow-xl space-y-4">
                    {/* Card Header: AGARAM / RESPONSE + LISTEN */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#1A2230]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black tracking-widest text-[#FF681F] uppercase font-mono">
                          AGARAM / RESPONSE
                        </span>
                      </div>
                      <button
                        onClick={() => handleReadAloud(message.text)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          isSpeaking
                            ? 'bg-[#FF681F]/20 border-[#FF681F] text-[#FF681F]'
                            : 'bg-[#151C28] border-[#242F42] text-[#8E9DB0] hover:text-white hover:border-[#FF681F]/50'
                        }`}
                        title={`Listen with ${activeProfile.voicePersona} voice`}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-[#FF681F] animate-pulse" />
                            <span>STOP</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-[#FF681F]" />
                            <span>LISTEN</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Tutor Text & Code formatting */}
                    <div className="text-sm leading-relaxed text-[#D2DAE6] whitespace-pre-wrap font-sans space-y-2">
                      {message.text.split('\n\n').map((paragraph, idx) => {
                        // If paragraph starts with numbered points or code
                        if (paragraph.startsWith('1.') || paragraph.includes('```')) {
                          return (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-[#080B10] border border-[#1B2230] font-mono text-xs text-[#E1E7F0] space-y-1.5 overflow-x-auto"
                            >
                              {paragraph.split('\n').map((line, lidx) => (
                                <p key={lidx} className="leading-5">
                                  {line}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return <p key={idx}>{paragraph}</p>;
                      })}
                    </div>

                    {/* Interactive Action Suggestion Chips matching screenshot */}
                    {message.suggestedActions && message.suggestedActions.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {message.suggestedActions.map((action, aidx) => (
                          <button
                            key={aidx}
                            onClick={() => {
                              setInputText(action);
                              textareaRef.current?.focus();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#151B26] hover:bg-[#1D2636] border border-[#263145] hover:border-[#FF681F]/50 text-xs font-bold text-[#A2B1C7] hover:text-white transition-all cursor-pointer text-left uppercase tracking-tight"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Related Concepts Tags */}
                    {message.relatedConcepts && message.relatedConcepts.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-[#7A889B] border-t border-[#18202D]">
                        <span className="font-bold text-[10px] tracking-wider text-[#9EACBF] uppercase">
                          RELATED:
                        </span>
                        {message.relatedConcepts.map((rel, ridx) => (
                          <span
                            key={ridx}
                            onClick={() => {
                              setInputText(`Explain ${rel} in depth`);
                              textareaRef.current?.focus();
                            }}
                            className="px-2.5 py-0.5 rounded bg-[#131923] border border-[#212A3B] text-[11px] text-[#A6B4C8] hover:text-[#FF681F] hover:border-[#FF681F]/40 cursor-pointer transition-colors"
                          >
                            {rel}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isSending && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0F141C] border border-[#1F2737] max-w-md mr-auto">
              <div className="w-4 h-4 rounded-full border-2 border-[#FF681F] border-t-transparent animate-spin" />
              <span className="text-xs text-[#8A98AC]">
                AGARAM Tutor is synthesizing first-principles response...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ======================================================== */}
        {/* CHAT INPUT BAR matching screenshot                       */}
        {/* ======================================================== */}
        <div className="p-4 md:px-8 border-t border-[#1B2230] bg-[#0A0D12]/95 backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-center bg-[#10151E] border border-[#232B3B] focus-within:border-[#FF681F] rounded-2xl p-2 transition-all shadow-xl">
              {/* Attachment Icon */}
              <button
                type="button"
                className="p-2 rounded-xl text-[#6D7B8E] hover:text-white hover:bg-[#1A2230] transition-colors cursor-pointer"
                title="Attach Document or Image"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Microphone / Speech Dictation */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isListeningVoice
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                    : 'text-[#6D7B8E] hover:text-white hover:bg-[#1A2230]'
                }`}
                title={isListeningVoice ? 'Listening...' : 'Voice Query'}
              >
                {isListeningVoice ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question, or upload an image or PDF... (Shift+Enter for newline)"
                className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white placeholder-[#5A677B] focus:outline-none resize-none max-h-32 leading-relaxed"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim() || isSending}
                className="w-10 h-10 rounded-full bg-[#FF681F] hover:bg-[#FF7A38] disabled:opacity-40 disabled:hover:bg-[#FF681F] text-white flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 ml-1"
                aria-label="Send Message"
              >
                <ArrowUp className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Subtitle Hints matching screenshot */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#556377] mt-2 px-1 gap-1">
              <span>Enter to send • Shift+Enter for new line • Drag & drop images/PDFs</span>
              <span className="text-[#68778C]">
                Multimodal Gemini AI Vision & Document Parsing
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
