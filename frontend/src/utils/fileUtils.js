export const EXTENSIONS = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  cpp: "cpp",
  c: "c",
  go: "go",
  rust: "rs",
  kotlin: "kt",
  csharp: "cs"
};

export const FILE_ICONS = {
  js:   { icon: 'javascript',     color: '#f7df1e' },
  jsx:  { icon: 'javascript',     color: '#61dafb' },
  ts:   { icon: 'code',           color: '#3178c6' },
  tsx:  { icon: 'code',           color: '#3178c6' },
  py:   { icon: 'code',           color: '#3572A5' },
  java: { icon: 'coffee',         color: '#f89820' },
  cpp:  { icon: 'code',           color: '#9b59b6' },
  c:    { icon: 'code',           color: '#9b59b6' },
  go:   { icon: 'code',           color: '#00acd7' },
  rs:   { icon: 'code',           color: '#dea584' },
  kt:   { icon: 'code',           color: '#7f52ff' },
  cs:   { icon: 'code',           color: '#9b4f96' },
  html: { icon: 'html',           color: '#e34c26' },
  css:  { icon: 'css',            color: '#264de4' },
  json: { icon: 'data_object',    color: '#f5a623' },
  md:   { icon: 'description',    color: '#83a598' },
  txt:  { icon: 'text_snippet',   color: '#aaaaaa' },
};

export const getFileIcon = (name) => {
  const ext = name.split('.').pop()?.toLowerCase();
  return FILE_ICONS[ext] || { icon: 'description', color: '#aaaaaa' };
};

export const languageColor = (lang) => {
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
