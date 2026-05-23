import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import useAuthStore from '../../store/authStore';
import useRoomStore from '../../store/roomStore';
import api from '../../api/axios';

import { wsService } from '../../api/websocketService';
import { fileService } from '../../api/fileService';
import { executionService } from '../../api/executionService';

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
const EXTENSIONS = {
  javascript:"js",
  typescript:"ts",
  python:"py",
  java:"java",
  cpp:"cpp",
  c:"c",
  go:"go",
  rust:"rs",
  kotlin:"kt",
  csharp:"cs"
};


const languageColor = (lang) => {
  const map = {
    javascript: 'text-yellow-400 bg-yellow-400/10',
    typescript: 'text-blue-400 bg-blue-400/10',
    python: 'text-green-400 bg-green-400/10',
    java: 'text-orange-400 bg-orange-400/10',
    cpp: 'text-purple-400 bg-purple-400/10',
    c: 'text-purple-300 bg-purple-300/10',
    go: 'text-cyan-400 bg-cyan-400/10',
    rust: 'text-orange-300 bg-orange-300/10',
    kotlin: 'text-violet-400 bg-violet-400/10',
    csharp: 'text-green-300 bg-green-300/10',
  };
  return map[lang] || 'text-on-surface-variant bg-surface-variant/30';
};

// ── User Avatar ───────────────────────────────────────────────────────────────
const UserAvatar = ({ user }) => (
  <div
    className="w-6 h-6 rounded-full bg-primary/20 border-2 border-surface-container-lowest flex items-center justify-center text-primary font-bold text-xs relative flex-shrink-0"
    title={user?.username}
  >
    {user?.username?.[0]?.toUpperCase() || 'U'}
    <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full border border-surface-container-lowest" />
  </div>
);

// ── File Tree ─────────────────────────────────────────────────────────────────
const FileTree = ({ files, activeFileId, onFileSelect, onFileCreate, onFileDelete }) => {
  const [newFileName, setNewFileName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = () => {
    if (!newFileName.trim()) return;
    onFileCreate(newFileName.trim());
    setNewFileName('');
    setCreating(false);
  };


  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant/20 flex-shrink-0">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-[10px]">
          Explorer
        </span>
        <button
          onClick={() => setCreating(true)}
          className="p-0.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-all"
          title="New file"
        >
          <span className="material-symbols-outlined text-[15px]">add</span>
        </button>
      </div>

      {/* New file input */}
      {creating && (
        <div className="px-3 py-1.5 border-b border-outline-variant/20 flex items-center gap-1 flex-shrink-0">
          <span className="material-symbols-outlined text-[13px] text-on-surface-variant">description</span>
          <input
            autoFocus
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') { setCreating(false); setNewFileName(''); }
            }}
            placeholder="filename.js"
            className="flex-1 bg-transparent border-b border-primary/60 text-on-surface text-[11px] focus:outline-none font-code-md py-0.5"
          />
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-y-auto py-1">
        {files.length === 0 ? (
          <p className="text-center text-on-surface-variant text-[11px] px-3 py-6 opacity-50">
            No files yet
          </p>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              onClick={() => onFileSelect(file)}
              className={`group flex items-center justify-between px-3 py-1 cursor-pointer transition-all hover:bg-surface-variant/20 ${
                activeFileId === file.id
                  ? 'bg-primary/10 text-primary border-r-2 border-primary'
                  : 'text-on-surface-variant'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[13px] flex-shrink-0 opacity-70">description</span>
                <span className="font-code-md text-[11px] truncate">{file.name}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onFileDelete(file.id); }}
                className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all p-0.5 flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[12px]">close</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── Output Panel ──────────────────────────────────────────────────────────────
const OutputPanel = ({ output, isRunning, onClear }) => (
  <div className="h-full flex flex-col overflow-hidden">
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-outline-variant/20 flex-shrink-0">
      <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label-sm">Terminal</span>
      {output && (
        <button onClick={onClear} className="text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-[13px]">clear_all</span>
        </button>
      )}
    </div>
    <div className="flex-1 overflow-y-auto p-3 bg-black/30">
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
            Press Run to execute your code
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
            },            ]);
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
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
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
                                className={`max-w-[88%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                                    msg.role === 'user'
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
     if(!roomId) return;
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

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">

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
                className={`flex flex-col gap-0.5 ${
                  isMe
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
                  className={`max-w-[90%] rounded-xl px-3 py-1.5 text-[11px] font-body-md ${
                    isMe
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
          onChange={(e)=>
            setInput(e.target.value)
          }
          onKeyDown={(e)=>{
            if(e.key==="Enter"){
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

// ── Workspace ─────────────────────────────────────────────────────────────────
const EditorWorkspace = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { rooms } = useRoomStore();

  const room = rooms.find((r) => r.id === roomId);
  const language = room?.language || 'javascript';

  // Editor / file state
  const defaultContent = STARTER_CODE[language] || '// Start coding...\n';
  const initialFile = {
  id:'1',
  name:`main.${EXTENSIONS[language]}`,
  content:defaultContent
};
  const [files,setFiles]=useState([initialFile]);
  const [activeFile, setActiveFile] = useState(initialFile);
  const [code, setCode] = useState(defaultContent);


  // UI state
  const [rightTab, setRightTab] = useState('ai');
  const [showFileTree, setShowFileTree] = useState(true);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(user ? [user] : []);
  const [copied, setCopied] = useState(false);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [cursor, setCursor] = useState({ line: 1, col: 1 });

  // Panel widths (desktop)
  const [fileTreeWidth, setFileTreeWidth] = useState(210);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);

 // Refs
 const editorRef = useRef(null);
const activeFileRef = useRef(activeFile);
const userRef = useRef(user);

useEffect(()=>{
   activeFileRef.current=activeFile;
},[activeFile]);

useEffect(()=>{
   userRef.current=user;
},[user]);
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
          "main.js",
          "// Start coding!"
        );

        const file = created.data;

        setFiles([file]);
        setActiveFile(file);
        setCode(file.content || "");

        return;
      }

      setFiles(data);
      setActiveFile(data[0]);
      setCode(data[0].content || "");

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

  if(wsService.isConnected()) return;

  setWsStatus("connecting");

  wsService.connect(
    () => setWsStatus(  "connected"),
    () => setWsStatus("disconnected")
  );

  return () => {

      if (wsService.isConnected()){
      wsService.publish(
        `/app/room/${roomId}/leave`,
        {
          username:user?.username,
          userId:user?.id
        }
      );
      }

    wsService.disconnect();

  };

}, [roomId]);



// =========================
// Presence
// =========================
useEffect(() => {

   if(wsStatus!=="connected") return;

  wsService.publish(
    `/app/room/${roomId}/join`,
    {
      username:user?.username,
      userId:user?.id
    }
  );

  const unsub =
    wsService.subscribe(
      `/topic/room/${roomId}/presence`,
      (event)=>{
      if(event.type==="JOIN"){

        setConnectedUsers(
          prev=>
            prev.find(
              u=>u.id===event.userId
            )
            ? prev
            : [
                ...prev,
                {
                  id:event.userId,
                  username:event.username
                }
            ]
        );
      }
      if(event.type==="LEAVE"){

        setConnectedUsers(
          prev=>
            prev.filter(
              u=>u.id!==event.userId
            )
        );

      }

    });

 return ()=>unsub?.();

},[roomId,user]);


// =========================
// Receive realtime code
// =========================
useEffect(()=>{

    if(!roomId) return;

    const unsub=wsService.subscribe(
        `/topic/room/${roomId}/code`,
        (event)=>{

            setFiles(prev=>
                prev.map(file=>
                    file.id===event.fileId
                    ?{
                        ...file,
                        content:event.content
                    }
                    :file
                )
            );

            if(
                activeFileRef.current?.id===event.fileId &&
                event.senderEmail!==userRef.current?.email
            ){

                setCode(
                    event.content
                );

            }

        }
    );

    return ()=>unsub?.();

},[roomId]);


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

  // ── Handlers ──
  const handleCodeChange = (value = '') => {
      if (!activeFile) return;
    setCode(value);
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFile?.id ? { ...f, content: value } : f))
    );
   // Broadcast change to all users in the room via WebSocket
    wsService.publish(`/app/room/${roomId}/code`, {
    fileId: activeFile?.id,
    content: value,
    senderEmail: user?.email,
    username: user?.username,
   });
};

  const handleFileSelect = (file) => {
    setActiveFile(file);
    setCode(file.content);
  };

 const handleFileCreate = async (filename) => {
 
    try{  
      const {data:file} =
          await fileService.createFile(
            roomId,
            filename,
            STARTER_CODE[language]
          );
      setFiles(prev=>[
          ...prev,
          file
      ]);
      handleFileSelect(file);
    }catch(err){
      console.error(
          "Create file failed",
          err
      );
    }
  };
  const handleFileDelete = async(fileId) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== fileId);
     if(activeFile?.id===fileId){
        if(next.length){
            handleFileSelect(next[0]);
        }else{
            setActiveFile(null);
            setCode('');
        }
      }
      return next;
    });
    try{
      await fileService.deleteFile(
          roomId,
          fileId
      );
      }catch(err){
      console.error(
          "Delete failed",
          err
      );
      }
  };

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput('');
    setRightTab('output');
  
   try {
    const { data } = await executionService.execute(
    roomId,
    code,
    room?.language || 'javascript'
    );
    // data = { stdout, stderr, exitCode, status }

    const result = data.stdout || data.stderr || 'No output';
    setOutput(result);
    // Show error styling if exit code != 0
    if (data.exitCode !== 0 && data.stderr) {
        console.warn('Program exited with error:', data.exitCode);
    }
} catch (err) {
    setOutput('Failed to run: ' + (err.response?.data?.message || err.message));
} finally {
    setIsRunning(false);
}
};

  const copyInviteCode = () => {
    if (room?.inviteCode) {
      navigator.clipboard.writeText(room.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  

  const monacoLanguage = MONACO_LANGUAGE_MAP[language] || 'javascript';

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
            {room?.name || 'Loading...'}
          </h1>
          {room?.language && (
            <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full text-[10px] flex-shrink-0 ${languageColor(room.language)}`}>
              {LANGUAGE_LABELS[room.language]}
            </span>
          )}
        </div>

        {/* Invite code */}
        {room?.inviteCode && (
          <button
            onClick={copyInviteCode}
            className="hidden sm:flex items-center gap-1.5 bg-black/20 border border-outline-variant/20 rounded-lg px-3 py-1 hover:border-primary/40 transition-all group"
            title="Copy invite code"
          >
            <span className="material-symbols-outlined text-[12px] text-on-surface-variant group-hover:text-primary transition-colors">
              link
            </span>
            <span className="font-code-md text-[11px] text-on-surface-variant tracking-widest group-hover:text-on-surface transition-colors">
              {room.inviteCode}
            </span>
            <span className="material-symbols-outlined text-[12px] text-on-surface-variant">
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
        )}

        {/* Connected users */}
        <div className="flex items-center -space-x-1.5 flex-shrink-0">
          {connectedUsers.slice(0, 5).map((u) => (
            <UserAvatar key={u.id} user={u} />
          ))}
          {connectedUsers.length > 5 && (
            <div className="w-6 h-6 rounded-full bg-surface-variant border-2 border-surface-container-lowest flex items-center justify-center text-[9px] text-on-surface-variant font-bold">
              +{connectedUsers.length - 5}
            </div>
          )}
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
              <FileTree
                files={files}
                activeFileId={activeFile?.id}
                onFileSelect={handleFileSelect}
                onFileCreate={handleFileCreate}
                onFileDelete={handleFileDelete}
              />
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
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => handleFileSelect(file)}
                className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-code-md border-r border-outline-variant/15 flex-shrink-0 transition-all hover:bg-surface-variant/20 relative ${
                  activeFile?.id === file.id
                    ? 'bg-background text-on-surface'
                    : 'text-on-surface-variant'
                }`}
              >
                {activeFile?.id === file.id && (
                  <span className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
                )}
                <span className="material-symbols-outlined text-[11px] opacity-60">description</span>
                {file.name}
              </button>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden select-text">
            <Editor
              height="100%"
              language={monacoLanguage}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              onMount={(editor) => {
                editorRef.current = editor;
                editor.onDidChangeCursorPosition((e) => {
                  setCursor({
                    line: e.position.lineNumber,
                    col: e.position.column,
                  });
                });
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
          {/* Tabs */}
          <div className="flex-shrink-0 flex border-b border-outline-variant/20 bg-surface-container-low/30">
            {[
              { id: 'ai', icon: 'smart_toy', label: 'AI' },
              { id: 'output', icon: 'terminal', label: 'Output' },
              { id: 'chat', icon: 'forum', label: 'Chat' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-label-sm transition-all border-b-2 relative ${
                  rightTab === tab.id
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
          <div className="flex-1 overflow-hidden">
            {rightTab === 'ai' && (
              <AIPanel code={code} language={language} />
            )}
            {rightTab === 'output' && (
              <OutputPanel
                output={output}
                isRunning={isRunning}
                onClear={() => setOutput('')}
              />
            )}
            {rightTab === 'chat' && (
              <ChatPanel
                roomId={roomId}
                user={user}
              />
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