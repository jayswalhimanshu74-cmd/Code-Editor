import React, { useEffect } from 'react';

const ContextMenu = ({ x, y, file, onRename, onDelete, onClose, onCreateFolder, onCreateFile }) => {
  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener('click', handler);
    window.addEventListener('contextmenu', handler);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('contextmenu', handler);
    };
  }, [onClose]);

  return (
    <div
      style={{ position: 'fixed', top: y, left: x, zIndex: 9999 }}
      className="bg-surface-container border border-outline-variant/40 rounded-lg shadow-2xl py-1 min-w-[160px]"
      onClick={e => e.stopPropagation()}
    >
      {file && file.isFolder && (
        <>
          <button
            onClick={() => { onCreateFile(file.id); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-on-surface hover:bg-primary/10 hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[14px]">note_add</span>
            New File
          </button>
          <button
            onClick={() => { onCreateFolder(file.id); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-on-surface hover:bg-primary/10 hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[14px]">create_new_folder</span>
            New Folder
          </button>
          <div className="h-px bg-outline-variant/30 my-1" />
        </>
      )}
      {(!file || !file.isFolder) && file && (
        <>
          <button
            onClick={() => { onRename(file); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-on-surface hover:bg-primary/10 hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            Rename
          </button>
          <div className="h-px bg-outline-variant/30 my-1" />
        </>
      )}
      {file && (
        <button
          onClick={() => { onDelete(file.id); onClose(); }}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-error hover:bg-error/10 transition-all"
        >
          <span className="material-symbols-outlined text-[14px]">delete</span>
          Delete
        </button>
      )}
    </div>
  );
};

export default ContextMenu;
