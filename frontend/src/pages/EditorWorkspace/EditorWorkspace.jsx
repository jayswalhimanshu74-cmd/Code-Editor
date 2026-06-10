import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { snapshotService } from '../../api/snapshotService';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { IndexeddbPersistence } from 'y-indexeddb';
import { yjsService } from '../../api/yjsService';
import useAuthStore from '../../store/authStore';
import useRoomStore from '../../store/roomStore';
import api from '../../api/axios';
import { EXTENSIONS, FILE_ICONS, getFileIcon, languageColor } from '../../utils/fileUtils';
import FileTree from './components/FileTree';
import TerminalPanel from './components/TerminalPanel';
import PreviewPanel from './components/PreviewPanel';
import GitPanel from './components/GitPanel';
import MetricsPanel from './components/MetricsPanel';

import { wsService } from '../../api/websocketService';
import { fileService } from '../../api/fileService';
import { executionService } from '../../api/executionService';
import { roomService } from '../../api/roomService';

// ── Constants ─────────────────────────────────────────────────────────────────
const MONACO_LANGUAGE_MAP = {
  javascript: 'javascript', typescript: 'typescript', python: 'python',
  java: 'java', cpp: 'cpp', c: 'c', go: 'go',
  rust: 'rust', kotlin: 'kotlin', csharp: 'csharp',
};

const LANGUAGE_LABELS = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  java: 'Java', cpp: 'C++', c: 'C', go: 'Go',
  rust: 'Rust', kotlin: 'Kotlin', csharp: 'C#',
};



const STARTER_CODE = {
  javascript: '// Welcome to your room!\nconsole.log("Hello, World!");\n',
  typescript: '// Welcome to your room!\nconst greet = (name: string): string => `Hello, ${name}!`;\nconsole.log(greet("World"));\n',
  python: '# Welcome to your room!\nprint("Hello, World!")\n',
  java: '// Welcome to your room!\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}\n',
  cpp: '// Welcome to your room!\n#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}\n',
  c: '// Welcome to your room!\n#include <stdio.h>\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}\n',
  go: '// Welcome to your room!\npackage main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, World!")\n}\n',
  rust: '// Welcome to your room!\nfn main() {\n  println!("Hello, World!");\n}\n',
  kotlin: '// Welcome to your room!\nfun main() {\n  println("Hello, World!")\n}\n',
  csharp: '// Welcome to your room!\nusing System;\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello, World!");\n  }\n}\n',
};


// ── User Avatar ───────────────────────────────────────────────────────────────
const UserAvatar = ({ user, isCurrentUser = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: isCurrentUser
          ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
          : 'rgba(99,102,241,0.2)',
        border: `2px solid ${isCurrentUser ? '#6366f1' : 'rgba(99,102,241,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700,
        color: isCurrentUser ? '#fff' : '#818cf8',
        flexShrink: 0, position: 'relative',
        cursor: 'default',
      }}>
        {user?.username?.[0]?.toUpperCase() || 'U'}

        {/* Green dot */}
        <span style={{
          position: 'absolute', bottom: -1, right: -1,
          width: 8, height: 8, borderRadius: '50%',
          background: '#22c55e',
          border: '1.5px solid #0a0a0f',
        }} />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div style={{
          position: 'absolute', bottom: '110%', left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '5px 10px',
          fontSize: 11, color: '#e8e8f0', whiteSpace: 'nowrap',
          zIndex: 100, pointerEvents: 'none',
        }}>
          {user?.username}
          {isCurrentUser && (
            <span style={{ color: '#818cf8', marginLeft: 4 }}>(you)</span>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            marginTop: 3, fontSize: 9, color: '#4ade80',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            Online
          </div>
        </div>
      )}
    </div>
  );
};



// ── Output Panel ──────────────────────────────────────────────────────────────
const OutputPanel = ({ output, isRunning, onClear, stdin, setStdin, showStdin, setShowStdin, onRun }) => (
  <div className="h-full flex flex-col overflow-hidden">

    {/* Header */}
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-outline-variant/20 flex-shrink-0">
      <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label-sm">Terminal</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowStdin(v => !v)}
          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-all ${showStdin ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          title="Toggle stdin input"
        >
          <span className="material-symbols-outlined text-[12px]">input</span>
          stdin
        </button>
        {output && (
          <button onClick={onClear} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[13px]">clear_all</span>
          </button>
        )}
      </div>
    </div>

    {/* Stdin input */}
    {showStdin && (
      <div className="flex-shrink-0 border-b border-outline-variant/20 p-2">
        <div className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1 px-1">
          Program Input (stdin)
        </div>
        <textarea
          value={stdin}
          onChange={e => setStdin(e.target.value)}
          placeholder="Enter input for your program..."
          rows={3}
          className="w-full bg-black/30 border border-outline-variant/30 rounded-lg px-2 py-1.5 text-on-surface text-[11px] font-code-md placeholder:text-outline focus:border-primary/40 focus:outline-none transition-all resize-none"
        />
      </div>
    )}

    {/* Output */}
    <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-black/30">
      {isRunning ? (
        <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-code-md">
          <span className="material-symbols-outlined text-[13px] animate-spin">progress_activity</span>
          Executing...
        </div>
      ) : output ? (
        <pre className="text-on-surface text-[11px] font-code-md whitespace-pre-wrap leading-relaxed">
          {output}
        </pre>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-2 opacity-40">
          <span className="material-symbols-outlined text-[28px] text-on-surface-variant">terminal</span>
          <p className="text-on-surface-variant text-[11px] font-body-md">
            Press Run or Ctrl+Enter to execute
          </p>
        </div>
      )}
    </div>
  </div>
);



// ── AI Chat Panel ─────────────────────────────────────────────────────────────
const AIPanel = ({ code, language }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const trimmed = text?.trim() || input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post(`/ai/chat`, {
        messages: updatedMessages,
        code,
        language,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Failed to reach AI: ' + (err.response?.data?.message || err.message),
        },]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickPrompts = [
    'Explain this code',
    'Find bugs',
    'Optimize it',
    'Add comments',
  ];

  const clearChat = () => setMessages([]);

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-outline-variant/20 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[14px]">smart_toy</span>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
            Gemini AI
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            title="Clear chat"
          >
            <span className="material-symbols-outlined text-[13px]">clear_all</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[22px]">smart_toy</span>
            </div>
            <p className="text-on-surface-variant text-[11px]">
              Ask AI about your code
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-1">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="px-2 py-1 bg-surface-variant/30 border border-outline-variant/30 rounded-full text-on-surface-variant text-[10px] hover:border-primary/30 hover:text-primary transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mr-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-[11px]">smart_toy</span>
                </div>
              )}
              <div
                className={`max-w-[88%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${msg.role === 'user'
                    ? 'bg-primary/20 text-on-surface rounded-br-sm'
                    : 'bg-surface-variant/30 text-on-surface rounded-bl-sm'
                  }`}
              >
                <pre className="whitespace-pre-wrap font-body-md" style={{ fontFamily: 'inherit' }}>
                  {msg.content}
                </pre>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[11px]">smart_toy</span>
            </div>
            <div className="bg-surface-variant/30 rounded-xl rounded-bl-sm px-3 py-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-outline-variant/20 p-2 flex gap-2">
        <input
          ref={inputRef}
          className="flex-1 bg-black/20 border border-outline-variant/40 rounded-lg px-3 py-1.5 text-on-surface text-[11px] placeholder:text-outline focus:border-primary/50 focus:outline-none transition-all"
          placeholder="Ask AI about your code..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="bg-primary/20 hover:bg-primary/30 text-primary rounded-lg px-2 transition-all disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[15px]">send</span>
        </button>
      </div>
    </div>
  );
};

// ── Team Chat Panel ───────────────────────────────────────────────────────────
const ChatPanel = ({ roomId, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Receive messages
  useEffect(() => {
    if (!roomId) return;
    const unsub = wsService.subscribe(
      `/topic/room/${roomId}/chat`,
      (msg) => {
        setMessages((prev) => [...prev, msg]);
      }
    );

    return () => unsub?.();
  }, [roomId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  // Send message
  const sendChat = () => {
    if (!input.trim()) return;

    wsService.publish(
      `/app/room/${roomId}/chat`,
      {
        roomId,
        userId: user?.id,
        username: user?.username,
        content: input.trim(),
      }
    );

    setInput('');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">

      <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2">

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-40">
            <span className="material-symbols-outlined text-[28px] text-on-surface-variant">
              forum
            </span>

            <p className="text-on-surface-variant text-[11px] font-body-md">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe =
              msg.userId === user?.id;

            return (
              <div
                key={i}
                className={`flex flex-col gap-0.5 ${isMe
                    ? 'items-end'
                    : 'items-start'
                  }`}
              >

                {!isMe && (
                  <span className="text-[9px] text-on-surface-variant px-1">
                    {msg.username}
                  </span>
                )}

                <div
                  className={`max-w-[90%] rounded-xl px-3 py-1.5 text-[11px] font-body-md ${isMe
                      ? 'bg-primary/20 text-on-surface'
                      : 'bg-surface-variant/30 text-on-surface-variant'
                    }`}
                >
                  {msg.content}
                </div>

              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 border-t border-outline-variant/20 p-2 flex gap-2">

        <input
          className="flex-1 bg-black/20 border border-outline-variant/40 rounded-lg px-3 py-1.5 text-on-surface text-[11px] placeholder:text-outline focus:border-primary/50 focus:outline-none transition-all font-body-md"
          placeholder="Message teammates..."
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendChat();
            }
          }}
        />

        <button
          onClick={sendChat}
          disabled={!input.trim()}
          className="bg-primary/20 hover:bg-primary/30 text-primary rounded-lg px-2 transition-all disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[15px]">
            send
          </span>
        </button>

      </div>
    </div>
  );
};

// ── Snapshot Panel ────────────────────────────────────────────────────────────
const SnapshotPanel = ({
    snapshots, loading, label, setLabel,
    showInput, setShowInput,
    onSave, onRestore, onDelete
}) => {
    const formatTime = (dateVal) => {
        if (!dateVal) return '—';
        const date = Array.isArray(dateVal)
            ? new Date(dateVal[0], dateVal[1]-1, dateVal[2], dateVal[3]||0, dateVal[4]||0)
            : new Date(dateVal);
        const diff = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
        return `${Math.floor(diff/86400)}d ago`;
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant/20 flex-shrink-0">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label-sm">
                    Snapshots
                </span>
                <button
                    onClick={() => setShowInput(v => !v)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary rounded text-[10px] font-label-sm transition-all"
                    title="Save snapshot"
                >
                    <span className="material-symbols-outlined text-[12px]">add_a_photo</span>
                    Save
                </button>
            </div>

            {/* Save input */}
            {showInput && (
                <div className="px-3 py-2 border-b border-outline-variant/20 flex flex-col gap-1.5 flex-shrink-0 bg-primary/5">
                    <input
                        autoFocus
                        value={label}
                        onChange={e => setLabel(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') onSave();
                            if (e.key === 'Escape') setShowInput(false);
                        }}
                        placeholder="Label (e.g. before refactor)"
                        className="bg-black/20 border border-outline-variant/40 rounded px-2 py-1 text-on-surface text-[11px] focus:outline-none focus:border-primary/60 font-code-md"
                    />
                    <div className="flex gap-1">
                        <button
                            onClick={onSave}
                            disabled={loading}
                            className="flex-1 py-1 bg-primary text-on-primary rounded text-[10px] font-bold hover:brightness-110 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Saving...' : 'Save snapshot'}
                        </button>
                        <button
                            onClick={() => setShowInput(false)}
                            className="px-2 py-1 border border-outline-variant/40 text-on-surface-variant rounded text-[10px] hover:bg-surface-variant/20 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Snapshot list */}
            <div className="flex-1 min-h-0 overflow-y-auto py-1">
                {snapshots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-40">
                        <span className="material-symbols-outlined text-[28px] text-on-surface-variant">history</span>
                        <p className="text-on-surface-variant text-[10px]">No snapshots yet</p>
                        <p className="text-on-surface-variant text-[9px]">Click Save to create one</p>
                    </div>
                ) : (
                    snapshots.map((snap) => (
                        <div
                            key={snap.id}
                            className="group px-3 py-2 hover:bg-surface-variant/20 transition-all border-b border-outline-variant/10"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[11px] text-primary">commit</span>
                                        <span className="text-on-surface text-[11px] font-medium truncate">
                                            {snap.label || 'snapshot'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-on-surface-variant text-[9px]">
                                            {formatTime(snap.createdAt)}
                                        </span>
                                        <span className="text-outline text-[9px]">·</span>
                                        <span className="text-on-surface-variant text-[9px] truncate">
                                            {snap.savedBy?.username || 'unknown'}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                                    <button
                                        onClick={() => onRestore(snap.id, snap.content)}
                                        className="p-0.5 rounded text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all"
                                        title="Restore"
                                    >
                                        <span className="material-symbols-outlined text-[12px]">restore</span>
                                    </button>
                                    <button
                                        onClick={() => onDelete(snap.id)}
                                        className="p-0.5 rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
                                        title="Delete"
                                    >
                                        <span className="material-symbols-outlined text-[12px]">delete</span>
                                    </button>
                                </div>
                            </div>

                            {/* Code preview */}
                            <pre className="mt-1.5 text-[9px] font-code-md text-on-surface-variant bg-black/20 rounded px-2 py-1 overflow-hidden max-h-10 leading-relaxed opacity-60">
                                {snap.content?.split('\n')[0]?.slice(0, 60) || '—'}
                            </pre>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
// ── Workspace ─────────────────────────────────────────────────────────────────
const EditorWorkspace = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { rooms } = useRoomStore();

  const [currentRoom, setCurrentRoom] = useState(rooms.find((r) => r.id === roomId));
  const [roomLoading, setRoomLoading] = useState(!currentRoom);

  useEffect(() => {
    if (!currentRoom) {
      roomService.getRoom(roomId)
        .then(res => {
          setCurrentRoom(res.data);
          setRoomLoading(false);
        })
        .catch(err => {
          console.error("Failed to load room:", err);
          setRoomLoading(false);
        });
    }
  }, [roomId, currentRoom]);

  const language = currentRoom?.language || 'javascript';

  // Editor / file state
  const defaultContent = STARTER_CODE[language] || '// Start coding...\n';
  const initialFile = {
    id: null,
    name: `main.${EXTENSIONS[language]}`,
    content: defaultContent
  };
  const [files, setFiles] = useState([initialFile]);
  const [openFiles, setOpenFiles] = useState([initialFile]);
  const [activeFile, setActiveFile] = useState(initialFile);
  const selectedFileRef = useRef(initialFile);
  const [code, setCode] = useState(defaultContent);


  // UI state
  const [rightTab, setRightTab] = useState('ai');
  const [showFileTree, setShowFileTree] = useState(true);
  
  // --- Diff State ---
  const [diffOriginalContent, setDiffOriginalContent] = useState('');
  const [isDiffLoading, setIsDiffLoading] = useState(false);

  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeExecId, setActiveExecId] = useState(null);
  const activeExecIdRef = useRef(null);
  const [connectedUsers, setConnectedUsers] = useState(user ? [user] : []);
  const [copied, setCopied] = useState(false);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [editorReady, setEditorReady] = useState(false);

  // Snapshot state
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [showSnapshotInput, setShowSnapshotInput] = useState(false);

  // Panel widths (desktop)
  const [fileTreeWidth, setFileTreeWidth] = useState(210);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);

  // Refs
  const editorRef = useRef(null);
  const activeFileRef = useRef(activeFile);
  const userRef = useRef(user);
  const codeRef = useRef(code);
  const ydocRef = useRef(null);
  const bindingRef = useRef(null);
  const handleRunRef = useRef();

  useEffect(() => {
    handleRunRef.current = handleRun;
  });

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // =========================
  // Snapshot handlers
  // =========================
  const fetchSnapshots = async () => {
    if (!activeFile?.id) return;
    try {
      const { data } = await snapshotService.getSnapshots(roomId, activeFile.id);
      setSnapshots(data);
    } catch (err) {
      console.error('Failed to fetch snapshots:', err);
    }
  };

  const handleSaveSnapshot = async () => {
    if (!activeFile?.id) return;
    setSnapshotLoading(true);
    try {
      const lbl = snapshotLabel.trim() || 'snapshot';
      await snapshotService.saveSnapshot(roomId, activeFile.id, lbl);
      setSnapshotLabel('');
      setShowSnapshotInput(false);
      await fetchSnapshots();
    } catch (err) {
      console.error('Failed to save snapshot:', err);
    } finally {
      setSnapshotLoading(false);
    }
  };

  const handleRestoreSnapshot = async (snapshotId, content) => {
    if (!window.confirm('Restore this snapshot? Current content will be overwritten.')) return;
    try {
      await snapshotService.restoreSnapshot(roomId, activeFile.id, snapshotId);
      if (editorRef.current) {
        editorRef.current.setValue(content);
      }
      setCode(content);
      codeRef.current = content;
      await fetchSnapshots();
    } catch (err) {
      console.error('Failed to restore snapshot:', err);
    }
  };

  const handleDeleteSnapshot = async (snapshotId) => {
    try {
      await snapshotService.deleteSnapshot(roomId, activeFile.id, snapshotId);
      setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
    } catch (err) {
      console.error('Failed to delete snapshot:', err);
    }
  };

  useEffect(() => {
    if (activeFile?.id) {
      fetchSnapshots();
    }
  }, [activeFile?.id]);

  // =========================
  // Load files
  // =========================
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const { data } = await fileService.getFiles(roomId);

        if (!data || data.length === 0) {
          const created = await fileService.createFile(
            roomId,
            `main.${EXTENSIONS[language] || 'js'}`,
            defaultContent
          );

          const file = created.data;
          setFiles([file]);
          setOpenFiles([file]);
          setActiveFile(file);
          selectedFileRef.current = file;
          setCode(file.content || "");
          codeRef.current = file.content || "";
          return;
        }

        const findFirstFile = (nodes) => {
          for (const node of nodes) {
            if (!node.isFolder) return node;
            if (node.children) {
              const found = findFirstFile(node.children);
              if (found) return found;
            }
          }
          return null;
        };

        const firstFile = findFirstFile(data) || data[0];

        setFiles(data);
        if (firstFile) {
          setOpenFiles([firstFile]);
          setActiveFile(firstFile);
          selectedFileRef.current = firstFile;
          setCode(firstFile.content || "");
          codeRef.current = firstFile.content || "";
        }

      } catch (err) {
        console.error(
          "Failed loading files:",
          err
        );
      }
    };

    loadFiles();

  }, [roomId]);


  // =========================
  // STOMP websocket connect
  // =========================
  useEffect(() => {

    if (wsService.isConnected()) return;

    setWsStatus("connecting");

    wsService.connect(
      () => setWsStatus("connected"),
      () => setWsStatus("disconnected")
    );

    return () => {

      if (wsService.isConnected()) {
        wsService.publish(
          `/app/room/${roomId}/leave`,
          {
            username: user?.username,
            userId: user?.id,
            email: user?.email
          }
        );
      }

      wsService.disconnect();
    };
  }, [roomId]);

  // =========================
  // Stream Execution Output
  // =========================
  useEffect(() => {
    let unsubscribe = null;
    
    if (wsStatus === "connected") {
        unsubscribe = wsService.subscribe(`/topic/room/${roomId}/execution`, (msg) => {
            // Ignore messages from other executions to prevent interleaving streams!
            if (msg.execId && msg.execId !== activeExecIdRef.current) {
                return;
            }

            if (msg.type === "stdout" || msg.type === "stderr" || msg.type === "system" || msg.type === "error") {
                setOutput(prev => prev + msg.data);
                setRightTab('output');
                setIsRunning(false); 
            }
        });
    }

    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, [roomId, wsStatus]);

  // =========================
  // Yjs Sync per active file
  // =========================
  useEffect(() => {
    if (!activeFile?.id || wsStatus !== 'connected' || !editorReady || !editorRef.current) return;

    let binding;
    let ydoc;
    const fileId = activeFile.id; // capture for cleanup

    const setupYjs = async () => {
      // Do NOT bind Yjs if this is a diff tab
      if (activeFile?.type === 'diff') return;

      try {
        console.log('[Yjs] Connecting to file:', fileId);
        ydoc = await yjsService.connect(roomId, fileId);
        ydocRef.current = ydoc;

        const ytext = ydoc.getText('monaco');
        const editor = editorRef.current;

        if (ytext.length === 0) {
          const initial = editor.getValue();
          if (initial) {
            ydoc.transact(() => ytext.insert(0, initial));
          }
        }
        
        const awareness = yjsService.getAwarenessForRoom(roomId, fileId);
        if (awareness) {
          awareness.setLocalStateField('user', {
            name: user?.username || 'Anonymous',
            color: `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`,
          });
        }

        binding = new MonacoBinding(
          ytext,
          editor.getModel(),
          new Set([editor]),
          awareness ?? null
        );
        bindingRef.current = binding;

        // Offline Persistence
        const indexeddbProvider = new IndexeddbPersistence(fileId, ydoc);
        indexeddbProvider.on('synced', () => {
          console.log('[Yjs] Local content loaded from IndexedDB for file', fileId);
        });

        console.log('[Yjs] Bound to Monaco successfully for file', fileId);
      } catch (err) {
        console.error('[Yjs] Failed to bind:', err);
      }
    };

    setupYjs();

    return () => {
      if (binding) {
        binding.destroy();
        bindingRef.current = null;
      }
      if (ydoc) {
        ydoc.destroy();
        ydocRef.current = null;
      }
      yjsService.disconnect(roomId, fileId);
      console.log('[Yjs] Disconnected from file', fileId);
    };
  }, [activeFile?.id, wsStatus, roomId, user, editorReady]);

  
  // =========================
  // Presence
  // =========================
  useEffect(() => {

    if (wsStatus !== "connected") return;

    wsService.publish(
      `/app/room/${roomId}/join`,
      {
        username: user?.username,
        userId: user?.id,
        email: user?.email
      }
    );

    const unsub =
      wsService.subscribe(
        `/topic/room/${roomId}/presence`,
        (event) => {
          if (event.type === "JOIN") {

            setConnectedUsers(
              prev =>
                prev.find(
                  u => u.id === event.userId
                )
                  ? prev
                  : [
                    ...prev,
                    {
                      id: event.userId,
                      username: event.username
                    }
                  ]
            );
          }
          if (event.type === "LEAVE") {

            setConnectedUsers(
              prev =>
                prev.filter(
                  u => u.id !== event.userId
                )
            );

          }

        });

    return () => unsub?.();

  }, [roomId, user]);


  // =========================
  // Receive realtime code
  // =========================
  useEffect(() => {

    if (!roomId) return;

    const unsub = wsService.subscribe(
      `/topic/room/${roomId}/code`,
      (event) => {

        setFiles(prev => recursiveUpdate(prev, event.fileId, { content: event.content }));
        setOpenFiles(prev => prev.map(f => f.id === event.fileId ? { ...f, content: event.content } : f));

        if (
          activeFileRef.current?.id === event.fileId &&
          event.senderEmail !== userRef.current?.email
        ) {
          // Do NOT call setCode(event.content) here! 
          // Yjs and y-monaco are already handling the live text synchronization perfectly.
          // Calling setCode here would overwrite the Monaco model and cause the cursor to jump.
        }

      }
    );

    return () => unsub?.();

  }, [roomId]);


  // ── Resize handles ──
  const startResize = useCallback(
    (side) => (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = side === 'left' ? fileTreeWidth : rightPanelWidth;

      const onMove = (ev) => {
        const delta = ev.clientX - startX;
        if (side === 'left') {
          setFileTreeWidth(Math.max(150, Math.min(380, startWidth + delta)));
        } else {
          setRightPanelWidth(Math.max(220, Math.min(500, startWidth - delta)));
        }
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [fileTreeWidth, rightPanelWidth]
  );

  // ── Helpers for recursive tree operations ──
  const recursiveUpdate = (nodes, id, updates) => nodes.map(node => {
    if (node.id === id) return { ...node, ...updates };
    if (node.children) return { ...node, children: recursiveUpdate(node.children, id, updates) };
    return node;
  });

  const recursiveDelete = (nodes, id) => nodes.filter(node => node.id !== id).map(node => {
    if (node.children) return { ...node, children: recursiveDelete(node.children, id) };
    return node;
  });

  const recursiveAdd = (nodes, file, parentId) => {
    if (!parentId) return [...nodes, file];
    return nodes.map(node => {
      if (node.id === parentId) return { ...node, children: [...(node.children || []), file] };
      if (node.children) return { ...node, children: recursiveAdd(node.children, file, parentId) };
      return node;
    });
  };

  // ── Handlers ──
  const handleCodeChange = (value = '') => {
    if (!activeFile) return;
    codeRef.current = value;
    setCode(value);
    setFiles(prev => recursiveUpdate(prev, activeFile.id, { content: value }));
    setOpenFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, content: value } : f));
    // Broadcast change to all users in the room via WebSocket
    wsService.publish(`/app/room/${roomId}/code`, {
      fileId: activeFile?.id,
      content: value,
      senderEmail: user?.email,
      username: user?.username,
    });
  };

  const handleFileSelect = (file) => {
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveFile(file);
    selectedFileRef.current = file;
    setCode(file.content || "");
    codeRef.current = file.content || "";
  };

  const handleFileDiff = async (file) => {
    const targetFile = files.find(f => f.name === file);
    if (!targetFile) return;

    const diffTabId = targetFile.id + '-diff';
    const diffTab = { ...targetFile, id: diffTabId, type: 'diff', originalId: targetFile.id };

    if (!openFiles.find(f => f.id === diffTabId)) {
      setOpenFiles(prev => [...prev, diffTab]);
    }
    setActiveFile(diffTab);
    
    setIsDiffLoading(true);
    try {
      const response = await api.get(`/git/${roomId}/file/head?path=${targetFile.name}`);
      setDiffOriginalContent(response.data);
    } catch (err) {
      console.error('Failed to load original content', err);
      setDiffOriginalContent('');
    } finally {
      setIsDiffLoading(false);
    }
  };

  const handleFileCreate = async (rawFilename, isFolder = false, parentId = null) => {
    let filename = rawFilename.trim();
    if (!isFolder) {
      const ext = EXTENSIONS[language] || 'js';
      if (!filename.includes('.')) {
        filename = `${filename}.${ext}`;
      }
    }
    try {
      const { data: file } =
        await fileService.createFile(
          roomId,
          filename,
          isFolder ? null : (STARTER_CODE[language] || ''),
          isFolder,
          parentId
        );
      setFiles(prev => recursiveAdd(prev, file, parentId));
      if (!isFolder) {
        handleFileSelect(file);
      }
    } catch (err) {
      console.error(
        "Create file failed",
        err
      );
    }
  };
  const handleFileDelete = async (fileId) => {
    console.log('[Delete] fileId:', fileId, 'roomId:', roomId);

    setFiles(prev => recursiveDelete(prev, fileId));
    setOpenFiles(prev => {
      const next = prev.filter(f => f.id !== fileId);
      if (activeFile?.id === fileId) {
        if (next.length) {
          handleFileSelect(next[0]);
        } else {
          setActiveFile(null);
          selectedFileRef.current = null;
          setCode('');
        }
      }
      return next;
    });

    // Call API
    try {
      await fileService.deleteFile(roomId, fileId);
    } catch (err) {
      console.error('Delete failed', err);
      // Revert on failure
      const { data } = await fileService.getFiles(roomId);
      setFiles(data);
    }
  };
  const handleFileRename = async (fileId, newName) => {
    setFiles(prev => recursiveUpdate(prev, fileId, { name: newName }));
    setOpenFiles(prev => prev.map(f => f.id === fileId ? { ...f, name: newName } : f));
    if (activeFile?.id === fileId) {
      setActiveFile(prev => {
        const updated = { ...prev, name: newName };
        selectedFileRef.current = updated;
        return updated;
      });
    }
    try {
      await fileService.updateFile(roomId, fileId, { name: newName });
    } catch (err) {
      console.error('Rename failed', err);
      const { data } = await fileService.getFiles(roomId);
      setFiles(data);
    }
  };

  const handleRunWithCode = async (currentCode) => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput(''); // Clear output for the new stream
    setRightTab('output');

    try {
      const { data } = await executionService.execute(
        roomId,
        currentCode,
        fileLanguage,
        stdin
      );
      // Store the active execId so our WebSocket subscription knows what to listen for
      setActiveExecId(data.execId);
      activeExecIdRef.current = data.execId;
    } catch (err) {
      setOutput('Failed to trigger execution: ' + (err.response?.data?.message || err.message));
      setIsRunning(false);
    }
    // Note: setIsRunning(false) is handled when the stream starts or via timeout
  };

  // ✅ Single handleRun — always reads from editor directly
  const handleRun = () => {
    const currentCode = editorRef.current
      ? editorRef.current.getValue()
      : codeRef.current;
    handleRunWithCode(currentCode);
  };
  const copyInviteCode = () => {
    if (currentRoom?.inviteCode) {
      navigator.clipboard.writeText(currentRoom.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Derive language dynamically from the active file extension
  const fileExt = activeFile?.name?.split('.')?.pop()?.toLowerCase();
  const fileLanguage = Object.keys(EXTENSIONS).find(key => EXTENSIONS[key] === fileExt) || currentRoom?.language || 'javascript';

  const monacoLanguage = MONACO_LANGUAGE_MAP[fileLanguage] || 'javascript';

  const wsColor = {
    connected: 'bg-green-400',
    connecting: 'bg-yellow-400 animate-pulse',
    disconnected: 'bg-red-400',
  }[wsStatus];

  return (
    <div className="flex flex-col h-screen bg-background text-on-surface overflow-hidden select-none">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-11 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline-variant/30 flex items-center px-3 gap-3 z-30">

        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-variant/30 flex-shrink-0"
          title="Back to Dashboard"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </button>

        {/* File tree toggle */}
        <button
          onClick={() => setShowFileTree((v) => !v)}
          className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-variant/30 flex-shrink-0"
          title="Toggle file tree"
        >
          <span className="material-symbols-outlined text-[18px]">
            {showFileTree ? 'folder_open' : 'folder'}
          </span>
        </button>

        <div className="w-px h-5 bg-outline-variant/30 flex-shrink-0" />

        {/* Room name + language */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="font-headline-md text-headline-md text-on-surface truncate text-[13px] font-semibold">
            {currentRoom?.name || 'Loading...'}
          </h1>
          {currentRoom?.language && (
            <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full text-[10px] flex-shrink-0 ${languageColor(currentRoom.language)}`}>
              {LANGUAGE_LABELS[currentRoom.language]}
            </span>
          )}
        </div>

        {/* Invite code */}
        {currentRoom?.inviteCode && (
          <button
            onClick={copyInviteCode}
            className="hidden sm:flex items-center gap-1.5 bg-black/20 border border-outline-variant/20 rounded-lg px-3 py-1 hover:border-primary/40 transition-all group"
            title="Copy invite code"
          >
            <span className="material-symbols-outlined text-[12px] text-on-surface-variant group-hover:text-primary transition-colors">
              link
            </span>
            <span className="font-code-md text-[11px] text-on-surface-variant tracking-widest group-hover:text-on-surface transition-colors">
              {currentRoom.inviteCode}
            </span>
            <span className="material-symbols-outlined text-[12px] text-on-surface-variant">
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
        )}

        {/* Connected users */}
        {/* Connected users */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Show count badge */}
          {connectedUsers.length > 0 && (
            <span style={{
              fontSize: 10, color: 'rgba(255,255,255,0.4)',
              marginRight: 4,
            }}>
              {connectedUsers.length} online
            </span>
          )}

          <div className="flex items-center" style={{ gap: -4 }}>
            {connectedUsers.slice(0,5).map((u) => (
              <UserAvatar
                key={u.id}
                user={u}
                isCurrentUser={u.id === user?.id}
              />
            ))}
            {connectedUsers.length > 5 && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700,
              }}>
                +{connectedUsers.length - 5}
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-5 bg-outline-variant/30 flex-shrink-0" />

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 bg-gradient-to-b from-[#22c55e] to-[#16a34a] text-white px-3 py-1 rounded-lg font-label-sm text-[11px] font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 shadow-lg flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[14px]">
            {isRunning ? 'progress_activity' : 'play_arrow'}
          </span>
          {isRunning ? 'Running...' : 'Run'}
        </button>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── File Tree Panel ── */}
        {showFileTree && (
          <>
            <aside
              style={{ width: fileTreeWidth }}
              className="flex-shrink-0 h-full bg-surface-container-lowest/70 border-r border-outline-variant/20 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-hidden">
                <FileTree
                  files={files}
                  activeFileId={activeFile?.type === 'diff' ? activeFile.originalId : activeFile?.id}
                  onFileSelect={handleFileSelect}
                  onFileCreate={handleFileCreate}
                  onFileDelete={handleFileDelete}
                  onFileRename={handleFileRename}
                  language={language}
                />
              </div>
              <div className="h-[40%] flex-shrink-0 border-t border-outline-variant/20">
                <GitPanel roomId={roomId} onFileDiff={handleFileDiff} />
              </div>
            </aside>

            {/* Left resize handle */}
            <div
              onMouseDown={startResize('left')}
              className="w-0.5 cursor-col-resize bg-outline-variant/10 hover:bg-primary/40 transition-colors flex-shrink-0 group relative"
            >
              <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-primary/10 transition-colors" />
            </div>
          </>
        )}

        {/* ── Editor Panel ── */}
        <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">

          {/* File tabs */}
          <div className="flex-shrink-0 flex items-center bg-surface-container-low/40 border-b border-outline-variant/20 overflow-x-auto scrollbar-none">
            {openFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileSelect(file)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-code-md border-r border-outline-variant/15 flex-shrink-0 transition-all hover:bg-surface-variant/20 relative cursor-pointer ${activeFile?.id === file.id
                    ? 'bg-background text-on-surface'
                    : 'text-on-surface-variant'
                  }`}
              >
                {activeFile?.id === file.id && (
                  <span className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
                )}
                <span className="material-symbols-outlined text-[11px] opacity-60">
                  {file.type === 'diff' ? 'difference' : getFileIcon(file.name).icon}
                </span>
                {file.name} {file.type === 'diff' && '(Diff)'}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFiles(prev => {
                      const next = prev.filter(f => f.id !== file.id);
                      if (activeFile?.id === file.id) {
                        if (next.length) handleFileSelect(next[0]);
                        else { setActiveFile(null); setCode(''); }
                      }
                      return next;
                    });
                  }}
                  className="ml-1 opacity-0 group-hover:opacity-100 hover:text-error hover:bg-error/10 rounded p-0.5 transition-all"
                  style={{ opacity: activeFile?.id === file.id ? 1 : undefined }}
                >
                  <span className="material-symbols-outlined text-[10px]">close</span>
                </button>
              </div>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden select-text relative">
            {activeFile?.type === 'diff' ? (
              <>
                {isDiffLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                  </div>
                )}
                <DiffEditor
                  height="100%"
                  language={monacoLanguage}
                  original={diffOriginalContent}
                  modified={code}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    renderSideBySide: true,
                    minimap: { enabled: false },
                    fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace",
                    fontSize: 13,
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                  }}
                />
              </>
            ) : (
              <Editor
                height="100%"
                language={monacoLanguage}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                onMount={(editor, monaco) => {

                  editorRef.current = editor;

                  // ── Existing keybinding ──────────────────────────────────────────────
                  editor.addCommand(
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                    () => {
                      if (handleRunRef.current) {
                        handleRunRef.current();
                      }
                    }
                  );

                  editor.onDidChangeCursorPosition((e) => {
                    setCursor({
                      line: e.position.lineNumber,
                      col: e.position.column,
                    });
                  });
                  
                  setEditorReady(true);
                }}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace",
                  fontLigatures: true,
                  lineHeight: 1.7,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'line',
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                wordWrap: 'on',
                tabSize: 2,
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
                suggest: { showStatusBar: true },
                quickSuggestions: { other: true, comments: false, strings: false },
                formatOnPaste: true,
                formatOnType: false,
                automaticLayout: true,
              }}
              />
            )}
          </div>
        </main>

        {/* Right resize handle */}
        <div
          onMouseDown={startResize('right')}
          className="w-0.5 cursor-col-resize bg-outline-variant/10 hover:bg-primary/40 transition-colors flex-shrink-0 hidden md:block group relative"
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-primary/10 transition-colors" />
        </div>

        {/* ── Right Panel ── */}
        <aside
          style={{ width: rightPanelWidth }}
          className="flex-shrink-0 h-full bg-surface-container-lowest/70 border-l border-outline-variant/20 flex flex-col overflow-hidden hidden md:flex"
        >
          {/* Right panel tab buttons — add snapshot tab */}
            <button
                onClick={() => setRightTab('snapshots')}
                className={`px-3 py-1.5 text-[10px] font-label-sm uppercase tracking-widest transition-all ${
                    rightTab === 'snapshots'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                }`}
            >
                Snapshots
            </button>
          {/* Tabs */}
          <div className="flex-shrink-0 flex border-b border-outline-variant/20 bg-surface-container-low/30">
            {[
              { id: 'ai', icon: 'smart_toy', label: 'AI' },
              { id: 'output', icon: 'data_object', label: 'Output' },
              { id: 'preview', icon: 'web', label: 'Preview' },
              { id: 'terminal', icon: 'terminal', label: 'Terminal' },
              { id: 'chat', icon: 'forum', label: 'Chat' },
              { id: 'metrics', icon: 'monitoring', label: 'Metrics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-label-sm transition-all border-b-2 relative ${rightTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20'
                  }`}
              >
                <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {rightTab === 'ai' && (
              <AIPanel code={code} language={language} />
            )}
            {rightTab === 'output' && (
              <OutputPanel
                output={output}
                isRunning={isRunning}
                onClear={() => setOutput('')}
                stdin={stdin}
                setStdin={setStdin}
                showStdin={showStdin}
                setShowStdin={setShowStdin}
                onRun={handleRun}
              />
            )}
            {rightTab === 'preview' && (
              <PreviewPanel roomId={roomId} />
            )}
            {rightTab === 'chat' && (
              <ChatPanel
                roomId={roomId}
                user={user}
              />
            )}
            {rightTab === 'terminal' && (
              <TerminalPanel roomId={roomId} />
            )}
            {rightTab === 'metrics' && (
              <MetricsPanel roomId={roomId} />  
            )}
          </div>
        </aside>
      </div>

      {/* ── Status Bar ───────────────────────────────────────────────────────── */}
      <footer className="flex-shrink-0 h-5 bg-[#4f46e5] flex items-center px-3 gap-4 text-[10px] font-code-md text-white/80">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${wsColor}`} />
          <span className="capitalize">{wsStatus}</span>
        </div>

        <span>
          Ln {cursor.line}, Col {cursor.col}
        </span>

        <span>{LANGUAGE_LABELS[language] || 'JavaScript'}</span>

        <span className="ml-auto opacity-60">UTF-8</span>


        <button
          onClick={handleRun}
          disabled={isRunning}
          className="ml-2 flex items-center gap-1 hover:text-white transition-colors disabled:opacity-50"
          title="Run (Ctrl+Enter)"
        >
          <span className="material-symbols-outlined text-[12px]">play_arrow</span>
          Run
        </button>
      </footer>
    </div>
  );
};

export default EditorWorkspace;