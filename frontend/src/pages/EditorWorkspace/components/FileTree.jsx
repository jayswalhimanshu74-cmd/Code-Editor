import React, { useState } from 'react';
import ContextMenu from './ContextMenu';
import { EXTENSIONS, getFileIcon } from '../../../utils/fileUtils';

const FileNode = ({ file, depth = 0, activeFileId, onFileSelect, onFileDelete, onFileRename, language, onCreateContext }) => {
  const [expanded, setExpanded] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(file.name);
  const [hovered, setHovered] = useState(false);

  const isActive = activeFileId === file.id;
  const isFolder = file.isFolder;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isFolder) setExpanded(!expanded);
    else onFileSelect(file);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== file.name) onFileRename(file.id, trimmed);
    setRenaming(false);
  };

  return (
    <div>
      <div
        onClick={handleToggle}
        onContextMenu={e => onCreateContext(e, file)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`group flex items-center justify-between px-2 py-1 cursor-pointer transition-all ${
          isActive && !isFolder ? 'bg-primary/15 border-r-2 border-primary' : hovered ? 'bg-surface-variant/20' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
          {isFolder ? (
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant flex-shrink-0">
              {expanded ? 'folder_open' : 'folder'}
            </span>
          ) : (
            <span className="material-symbols-outlined text-[14px] flex-shrink-0" style={{ color: isActive ? '#818cf8' : getFileIcon(file.name).color }}>
              {getFileIcon(file.name).icon}
            </span>
          )}

          {renaming ? (
            <input
              autoFocus
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
                if (e.key === 'Escape') setRenaming(false);
              }}
              onBlur={commitRename}
              onClick={e => e.stopPropagation()}
              className="flex-1 bg-surface-container border border-primary/60 rounded px-1.5 text-on-surface text-[11px] focus:outline-none font-code-md py-0.5 min-w-0"
            />
          ) : (
            <span className={`font-code-md text-[11px] truncate ${isActive && !isFolder ? 'text-primary' : 'text-on-surface-variant'}`}>
              {file.name}
            </span>
          )}
        </div>

        {!renaming && hovered && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {!isFolder && (
              <button title="Rename" onClick={e => { e.stopPropagation(); setRenaming(true); setRenameValue(file.name); }} className="p-0.5 rounded text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all">
                <span className="material-symbols-outlined text-[11px]">edit</span>
              </button>
            )}
            <button title="Delete" onClick={e => { e.stopPropagation(); onFileDelete(file.id); }} className="p-0.5 rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-all">
              <span className="material-symbols-outlined text-[11px]">delete</span>
            </button>
          </div>
        )}
      </div>

      {isFolder && expanded && file.children && (
        <div>
          {file.children.map(child => (
            <FileNode key={child.id} file={child} depth={depth + 1} activeFileId={activeFileId} onFileSelect={onFileSelect} onFileDelete={onFileDelete} onFileRename={onFileRename} language={language} onCreateContext={onCreateContext} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree = ({ files, activeFileId, onFileSelect, onFileCreate, onFileDelete, onFileRename, language }) => {
  const [creating, setCreating] = useState(false);
  const [creatingType, setCreatingType] = useState('file'); // 'file' or 'folder'
  const [creatingParentId, setCreatingParentId] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  const handleCreate = () => {
    if (!newFileName.trim()) return;
    onFileCreate(newFileName.trim(), creatingType === 'folder', creatingParentId);
    setNewFileName('');
    setCreating(false);
  };

  const startCreate = (type, parentId = null) => {
    setCreating(true);
    setCreatingType(type);
    setCreatingParentId(parentId);
    setNewFileName('');
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden select-none" onContextMenu={e => handleContextMenu(e, null)}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant/20 flex-shrink-0">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-[10px]">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => startCreate('file')} className="p-0.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-all" title="New file">
            <span className="material-symbols-outlined text-[15px]">note_add</span>
          </button>
          <button onClick={() => startCreate('folder')} className="p-0.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-all" title="New folder">
            <span className="material-symbols-outlined text-[15px]">create_new_folder</span>
          </button>
        </div>
      </div>

      {creating && creatingParentId === null && (
        <div className="px-2 py-1.5 border-b border-outline-variant/20 flex items-center gap-1.5 flex-shrink-0 bg-primary/5">
          <span className="material-symbols-outlined text-[13px] text-on-surface-variant">{creatingType === 'folder' ? 'folder' : 'description'}</span>
          <input autoFocus value={newFileName} onChange={e => setNewFileName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }} onBlur={() => { if(!newFileName.trim()) setCreating(false); }} placeholder={creatingType === 'folder' ? 'folder name' : `filename.${EXTENSIONS[language] || 'js'}`} className="flex-1 bg-transparent border-b border-primary/60 text-on-surface text-[11px] focus:outline-none font-code-md py-0.5" />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto py-1">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-40">
            <span className="material-symbols-outlined text-[28px] text-on-surface-variant">folder_open</span>
            <p className="text-on-surface-variant text-[10px]">No files yet</p>
          </div>
        ) : (
          files.map(file => (
            <FileNode key={file.id} file={file} activeFileId={activeFileId} onFileSelect={onFileSelect} onFileDelete={onFileDelete} onFileRename={onFileRename} language={language} onCreateContext={handleContextMenu} />
          ))
        )}
      </div>

      {creating && creatingParentId !== null && (
        <div className="px-2 py-1.5 border-t border-outline-variant/20 flex items-center gap-1.5 flex-shrink-0 bg-primary/5">
          <span className="material-symbols-outlined text-[13px] text-on-surface-variant">{creatingType === 'folder' ? 'folder' : 'description'}</span>
          <input autoFocus value={newFileName} onChange={e => setNewFileName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }} onBlur={() => { if(!newFileName.trim()) setCreating(false); }} placeholder={creatingType === 'folder' ? 'folder name' : `filename.${EXTENSIONS[language] || 'js'}`} className="flex-1 bg-transparent border-b border-primary/60 text-on-surface text-[11px] focus:outline-none font-code-md py-0.5" />
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          onRename={() => {}}
          onDelete={onFileDelete}
          onCreateFolder={(parentId) => startCreate('folder', parentId)}
          onCreateFile={(parentId) => startCreate('file', parentId)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default FileTree;
