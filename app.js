/* Zeelin Academy Dashboard — app shell, router & views (vanilla JS) */
// smoke bypass
try{ if(typeof window!=='undefined' && window.localStorage && window.localStorage.getItem('__zeelin_test_bypass')) window.__ZEELIN_BYPASS_AUTH=true; }catch(_){}

/* ============ ICONS (Material filled) ============ */
const ICONS = {
  info: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
  feed: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>',
  rec: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg>',
  checklist: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-9v2h9V7zm0 8h-9v-2h9v2zM5.54 11L2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  crown: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 1c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1c0-.6.4-1 1-1h12c.6 0 1 .4 1 1v1z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>',
  burger: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',
  fire: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11.75 20.12 11 21z"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14v-2H5v2zm0-10h4v6h6v-6h4l-7-7-7 7z"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
  caret: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>',
  wrench: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.4-2.4c.5-.4.5-1.1 0-1.3z"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>',
  stack: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>',
  'user-check': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 11c.34 0 .67.04 1 .09V10c0-2.76-2.24-5-5-5s-5 2.24-5 5c0 1.64.82 3.09 2.07 3.93-.06.24-.07.51-.07.77 0 .16.01.31.03.46C11.83 16.44 14.15 18 17 18c.34 0 .67-.03 1-.09V15.9c-.32.06-.66.1-1 .1-1.66 0-3.17-.7-4.22-1.82C13.13 13.05 14 11.6 14 10c0-1.66-1.34-3-3-3s-3 1.34-3 3c0 .78.3 1.49.79 2.03-.61.48-1.12 1.1-1.5 1.82C6.42 14.03 7.45 14.01 8 13.97c-.01.66.03 1.31.1 1.95C6.94 16.05 6 16.93 6 18v2h6c1.52 0 2.93-.4 4.16-1.1.59-.34 1.13-.78 1.6-1.28.46-.49.87-1.03 1.24-1.6V11c0-.34-.04-.66-.1-.98-.65.19-1.34.31-1.9.98z"/></svg>',
  coffee: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/></svg>',
  thumbs: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>',
  timer: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L9.32 18.25a5.97 5.97 0 0 0 5.96-2.61l4.68-4.68A7.87 7.87 0 0 0 16.59 5.58zM5.35 10.71a5.97 5.97 0 0 0 2.61 5.96l7.27-7.25A7.87 7.87 0 0 0 8.12 7.36l-2.77 3.35z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',
  gauge: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm7 18l-1.41-1.41C19.81 16.74 21 14.5 21 12c0-1.4-.36-2.72-1-3.89V10c0 1.1-.9 2-2 2h-.16A5.985 5.985 0 0 0 13 17.3V20c-1.34-.09-2.6-.5-3.71-1.15L8.5 20.35c1.06.6 2.25.98 3.5 1.14V22h2v-2c1.8-.14 3.4-.8 4.69-1.84L18.59 20.6 19.5 20z"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9c0-.51-.04-1.01-.12-1.49C19.47 19.62 15.97 21 12 21 7.58 21 4 17.42 4 13c0-3.97 1.38-7.47 3.51-9.88C7.01 3.05 7.51 3 8.02 3H12z"/></svg>',
  hourglass: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>',
};

function ic(name, w, h) { return `<span class="sv" style="width:${w}px;height:${h}px">${ICONS[name] || ''}</span>`; }

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ============ STATE ============ */
const SK = 'zdash_state_v4';
const DEFAULTS = {
  xp: USER.xp, streak: USER.streak, claims: 0,
  done: {}, doneVideo: {}, doneDeck: {},
  claimedDays: {}, claimedAt: null,
  day: 1, completedDays: [],
  ci: {}, stars: null, improve: '', unclear: '',
  prevDoneDay: {}, prevA: {},
};
function dateStamp() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function nowHMS() { const d = new Date(); return d.toTimeString ? d.toTimeString().slice(0, 8) : '--:--:--'; }
function loadState() { try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(SK) || '{}')); } catch { return { ...DEFAULTS }; } }
function save() { localStorage.setItem(SK, JSON.stringify(STATE)); }
let STATE = loadState();

function claimedToday(day) { return (STATE.claimedDays[day || STATE.day] === dateStamp()); }
function ensureArr(obj, key) { if (!obj[key]) obj[key] = []; return obj[key]; }

/* ---------- day => course mapping ---------- */
function courseForDay(d) { return d <= 2 ? 'foundation' : d <= 4 ? 'software' : d <= 6 ? 'prompt' : 'jobreadiness'; }
function deckIdForDay(d) { return courseForDay(d); }
function dayCard(day) { return DAY_CARDS[day] || DAY_CARDS[1]; }
function dayReadingHref(day) { const c = dayCard(day).cards.find((x) => x.k === 'reading'); return c ? c.href : '/book/foundation/0'; }
function dayVideoCount(day) { return VIDEOS.filter((v) => v.day === day).length; }
function daysDoneInCourse(day) {
  const course = courseForDay(day);
  const inCourse = Object.keys(DAY_CARDS).map(Number).filter((d) => courseForDay(d) === course);
  return inCourse.filter((d) => STATE.completedDays.includes(d)).length;
}

/* ============ SMALL UI HELPERS ============ */
function bar(pct, cls = '', id = '') { return `<div class="bar ${cls}"${id ? ` id="${id}"` : ''}><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`; }
function wkBar(label, pct, suffix, cls = 'gradient') {
  return `<div class="wk-top"><span class="n">${esc(label)}</span><div class="bar ${cls}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div><span class="n">${esc(suffix)}</span></div>`;
}
function multPie(segments, innerVal, innerLabel, size = 200, inset = 28, cls = '') {
  const bg = `conic-gradient(${segments.map((s) => s.join(' ')).join(', ')})`;
  return `<span class="pie-ring ${cls}" style="width:${size}px;height:${size}px;background:${bg}"><span class="inner" style="inset:${inset}px"><b>${innerVal}</b><span>${innerLabel}</span></span></span>`;
}
function legendRows(rows) {
  return `<div class="legend">${rows.map((r) => `<div class="legend-row"><span class="sw" style="background:${r[0]}"></span>${esc(r[1])}</div>`).join('')}</div>`;
}
function barChart(weekly) {
  const max = Math.max(...weekly.map((w) => w.h), 1);
  return `<div class="bar-chart">${weekly.map((w) => {
    const pct = Math.round((w.h / max) * 100);
    const color = w.h === max ? 'var(--green)' : w.d === 'Sat' ? '#475569' : 'var(--amber)';
    const v = w.h % 1 === 0 ? w.h + '.0h' : w.h + 'h';
    return `<div class="bar-col"><div class="val">${v}</div><div class="b" style="height:${Math.max(4, pct)}%;background:${color}"></div><div class="lb">${w.d}</div></div>`;
  }).join('')}</div>`;
}
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.innerHTML = '<span class="dot"></span><span class="msg"></span>'; document.body.appendChild(t); }
  $('.msg', t).textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tm);
  t._tm = setTimeout(() => t.classList.remove('show'), 2200);
}
function backBtn() {
  return `<div class="back-nav"><button class="back-link" data-back>${ic('chev', 16, 16)} Back to Dashboard</button></div>`;
}
function chipSel(el) { const row = el.closest('.radio-row, .check-row'); if (row) row.querySelectorAll('.radio-chip, .check-chip').forEach((c) => c.classList.remove('sel')); el.classList.add('sel'); }

/* ============ CONFETTI ============ */
function spawnConfetti(el, n = 60) {
  const colors = ['#f59e0b', '#16a34a', '#38bdf8', '#a78bfa', '#fb7185', '#facc15', '#34d399'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.style.left = (Math.random() * 100) + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = (Math.random() * 1.4) + 's';
    p.style.animationDuration = (1.8 + Math.random() * 1.8) + 's';
    p.style.width = (6 + Math.random() * 7) + 'px';
    p.style.height = (9 + Math.random() * 9) + 'px';
    el.appendChild(p);
  }
}
function confetti(container, n) { const c = container.querySelector('.confetti-layer'); if (c) spawnConfetti(c, n); }

/* interval manager so route changes clear timers */
/* enterprise auth — server is source of truth; this is fallback lightbox trigger only */
let TIMERS = [];
function every(int, fn) { const t = setInterval(fn, int); TIMERS.push(t); return t; }
function clearTimers() { TIMERS.forEach((t) => clearInterval(t)); TIMERS = []; }

/* ============ GATEWAY QUIZ ENGINE (step-by-step, gamified pass/fail) ============ */
let GATE = null;
function resolveBank(kind, key, idx) {
  if (kind === 'chapter') { const b = CHAPTER_QUIZZES[key]; return b && b[idx] ? b[idx] : QUIZ_BANK; }
  if (kind === 'video') { const b = VIDEO_QUIZZES[key]; return b || QUIZ_BANK; }
  if (kind === 'deck') { const b = DECK_QUIZZES[key]; return b || QUIZ_BANK; }
  return QUIZ_BANK;
}
function openGate(bank, title, label, onPass, onReview) {
  if (GATE) return;
  GATE = { bank, cursor: 0, answers: {}, score: null, onPass, review: onReview || null };
  const ov = document.createElement('div');
  ov.id = 'gateOv'; ov.className = 'gate-overlay';
  ov.innerHTML = `
    <div class="gate-card" id="gateCard">
      <div class="gate-head">${ic('quiz', 20, 20)}<div><div class="gate-title">${esc(title)}</div><div class="gate-sub">${esc(label)} - 5 step-by-step questions</div></div></div>
      <div class="gate-body" id="gateBody"></div>
      <div class="confetti-layer" id="gcConfetti"></div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', (e) => { if (e.target === ov) closeGate(); });
  paintGate(ov);
}
function closeGate() {
  const ov = $('#gateOv');
  if (ov) { const card = $('#gateCard', ov); if (card) card.classList.add('leaving'); setTimeout(() => ov.remove(), 260); }
  GATE = null;
}
function paintGate(ov) {
  const G = GATE;
  const body = $('#gateBody', ov);
  body.innerHTML = '<div class="gate-quiz-root" id="gcQuizRoot"></div>';
  const root = $('#gcQuizRoot', body);
  function qHTML() {
    const qq = G.bank[G.cursor];
    root.innerHTML = `
      <div class="quiz-progress" style="margin-bottom:16px"><span class="n">Question ${G.cursor + 1} of 5</span><div class="bar gradient"><i style="width:${Math.round((G.cursor / 5) * 100)}%"></i></div><span class="n">${Math.round((G.cursor / 5) * 100)}%</span></div>
      <div class="qnum">${esc(qq.q)}</div>
      <div class="qopts">${qq.opts.map((o, i) => `<div class="option" data-i="${i}"><span class="rad"></span>${esc(o)}</div>`).join('')}</div>
      <div class="quiz-nav"><button class="btn btn-gradient" id="gcGo">${ic('arrow', 16, 16)} ${G.cursor === 4 ? 'Finish' : 'Submit'}</button></div>`;
    root.querySelectorAll('.option').forEach((el) => el.addEventListener('click', () => {
      root.querySelectorAll('.option').forEach((x) => x.classList.remove('sel'));
      el.classList.add('sel');
      G.answers[G.cursor] = Number(el.dataset.i);
    }));
    $('#gcGo', root).addEventListener('click', () => {
      if (G.answers[G.cursor] === undefined) { toast('Pick an answer first'); return; }
      if (G.cursor < 4) { G.cursor++; qHTML(); }
      else { G.score = G.bank.filter((q, i) => G.answers[i] === q.ans).length; resolveGate(ov); }
    });
  }
  qHTML();
}
function resolveGate(ov) {
  const G = GATE;
  const passed = G.score >= 4;
  const body = $('#gateBody', ov);
  const card = $('#gateCard', ov);
  if (passed) {
    card.classList.add('pass');
    confetti(ov, 90);
    body.innerHTML = `
      <div class="th-anim"><i class="th-ring"></i><span class="th-check">${ic('check', 48, 48)}</span></div>
      <div class="gate-big">${ic('crown', 30, 30)} Lesson cleared!</div>
      <div class="gate-line">You scored <b>${G.score} / 5</b>. Sharp work - that lesson is yours.</div>
      <div class="gate-xp">+150 XP</div>
      <button class="btn btn-grad-green btn-block" id="gcContinue">${ic('arrow', 16, 16)} Continue</button>`;
    $('#gcContinue', body).addEventListener('click', () => { const cb = G.onPass; closeGate(); cb && cb(); });
  } else {
    card.classList.add('fail');
    body.innerHTML = `
      <div class="fail-anim">${ic('help', 46, 46)}</div>
      <div class="gate-big">Not quite yet</div>
      <div class="gate-line">You scored <b>${G.score} / 5</b>. Review the lesson, then try again - you've got this.</div>
      <div class="gate-btns">
        <button class="btn btn-outline" id="gcReview">${ic('book', 16, 16)} Review lesson</button>
        <button class="btn btn-amber" id="gcRetry">${ic('refresh', 16, 16)} Retry</button>
      </div>`;
    $('#gcRetry', body).addEventListener('click', () => { G.cursor = 0; G.answers = {}; G.score = null; card.classList.remove('fail'); paintGate(ov); });
    $('#gcReview', body).addEventListener('click', () => { const cb = G.review; closeGate(); cb && cb(); });
  }
}

/* ============ GENERIC MODAL / OVERLAY ============ */
function openModal(html, cls = '') {
  const ov = document.createElement('div');
  ov.id = 'dashOv'; ov.className = 'dash-overlay';
  ov.innerHTML = `<div class="dash-modal ${cls}">${html}</div>`;
  document.body.appendChild(ov);
  return ov;
}
function closeDashOverlay() { const ov = $('#dashOv'); if (ov) ov.remove(); }
function overlayOpen() { return !!($('#gateOv') || $('#dashOv')); }

/* ============ ROUTER ============ */
function parseHash() {
  let h = (location.hash || '').replace(/^#/, '');
  if (!h || h === '/') h = '/';
  if (!h.startsWith('/')) h = '/' + h;
  return h.split('/').filter(Boolean);
}
function next(route) { location.hash = route; }
const go = next;

function backLink(e) {
  const t = e.target.closest('[data-back]');
  if (t) { e.preventDefault(); go('/'); }
}
function crumbLabel(parts) { return parts.map((p) => p === 'dashboard' || p === 'home' ? 'Courses' : p).filter(Boolean).join(' / '); }
function setActiveSidebar(name) { $$('.snav a, .snav .sub-link').forEach((a) => a.classList.toggle('active', a.dataset.route === name)); }

function bootSpawnCheckin() {
  if (document.getElementById('gateOv')) return;
  if (!claimedToday() && !STATE.completedDays.includes(STATE.day)) openCheckinOverlay();
}

function route() {
  clearTimers();
  closeGate();
  renderSidebar();
  renderTopbar();
  const parts = parseHash();
  const page = $('#page');
  page.innerHTML = '';
  // reset reading full-bleed styles for non-book routes
  page.style.padding = '';
  page.style.maxWidth = '';
  page.style.margin = '';
  page.style.display = '';
  page.style.flexDirection = '';
  page.style.height = '';
  page.style.overflow = '';
  const routeName = parts[0] || 'home';
  $('#shell').classList.toggle('hide-sidebar', routeName === 'home');
  switch (routeName) {
    case 'home': case 'dashboard': renderCourses(); return;
    case 'day': renderDay(); return;
    case 'checkin': renderCheckin(true); return;
    case 'book': renderBook(parts[1], Number(parts[2] || 0)); return;
    case 'videos': renderVideos(); return;
    case 'watch': renderWatch(parts[1]); return;
    case 'visual': renderVisual(parts[1]); return;
    case 'profile': renderProfile(); return;
    case 'accountability': renderAccountability(); return;
    case 'roadmap': renderRoadmap(); return;
    case 'board': renderBoard(); return;
    case 'guide': renderGuide(); return;
    case 'community': renderCommunity(); return;
    case 'calendar': renderCalendar(); return;
    case 'recordings': renderRecordings(); return;
    case 'support': renderSupport(); return;
    case 'aluminal': renderAluminal(); return;
    case 'monday': renderMonday(); return;
    default: renderCourses(); return;
  }
}

/* ============ REFERENCE TREE HELPERS ============ */
const TREE_WEEKS = [
  { id: 'w1', label: 'Week 1 - Foundations', days: [1, 2, 3, 4, 5, 6] },
  { id: 'w2', label: 'Week 2', days: [1, 2, 3, 4, 5, 6] },
  { id: 'w3', label: 'Week 3', days: [1, 2, 3, 4, 5, 6] },
  { id: 'w4', label: 'Week 4', days: [1, 2, 3, 4, 5, 6] },
  { id: 'w5', label: 'Week 5', days: [1, 2, 3, 4, 5, 6] },
  { id: 'w6', label: 'Week 6', days: [1, 2, 3, 4, 5, 6] },
];
const TREE_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PLUS_D = 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z';
const CHEV_D = 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z';
const FOLDER_D = 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z';
function chevSvg(px, open){ return `<svg style="width:${px}px;height:${px}px;fill:#a3a3a3;${open?'transform:rotate(90deg);':''}" viewBox="0 0 24 24"><path d="${CHEV_D}"/></svg>`; }
function folderSvg(px){ return `<svg style="width:${px}px;height:${px}px;fill:#d97706;" viewBox="0 0 24 24"><path d="${FOLDER_D}"/></svg>`; }
function treeOpen(){ try { const o = JSON.parse(localStorage.getItem('zdash_tree') || '["w1"]'); return Array.isArray(o) && o.length ? [o[o.length - 1]] : ['w1']; } catch { return ['w1']; } }
function treeSave(o){ try { localStorage.setItem('zdash_tree', JSON.stringify(o)); } catch {} }
function cohortOpen(){ try { const v = localStorage.getItem('zdash_cohort'); return v === null ? true : v === '1'; } catch { return true; } }
function cohortSave(o){ try { localStorage.setItem('zdash_cohort', o ? '1' : '0'); } catch {} }
window._navCohort = function(){ cohortSave(!cohortOpen()); renderSidebar(); };
window._navTree = function(w){ const o = treeOpen(); const next = (o.length === 1 && o[0] === w) ? [] : [w]; treeSave(next); renderSidebar(); };
window._navDay = function(n){ STATE.day = n; save(); if((parseHash()[0]||'home')==='day'){ route(); } else { go('/day'); } };
function dayGroupsHTML(r){
  const links = [
    { route:'checkin', href:'#/checkin', icon:'user-check', text:'Check-In' },
    { route:'roadmap', href:'#/roadmap', icon:'compass', text:'Reading Roadmap' },
    { route:'book', href:'#'+dayReadingHref(STATE.day), icon:'book', text:'Daily Reading' },
    { route:'videos', href:'#/videos', icon:'video', text:'Video Tutorials' },
    { route:'visual', href:'#/visual/'+deckIdForDay(STATE.day), icon:'layers', text:'Visual Summary' },
    { route:'calendar', href:'#/calendar', icon:'calendar', text:'Calendar' },
    { route:'accountability', href:'#/accountability', icon:'chart', text:'Accountability' },
  ];
  return `<div class="day-groups">` + links.map((l) => `<a class="dg-link${r===l.route?' active':''}" href="${l.href}">${ic(l.icon,13,13)}<span>${l.text}</span></a>`).join('') + `</div>`;
}
/* social demo store */
function socialState(){ try { return Object.assign({ likes:{}, posts:[] }, JSON.parse(localStorage.getItem('zdash_social') || '{}')); } catch { return { likes:{}, posts:[] }; } }
function socialSave(s){ try { localStorage.setItem('zdash_social', JSON.stringify(s)); } catch {} }
const POST_META = {
  p1: { title:'Looking for partners to review Business Analysis Foundation Day 1 & 2', role:'Cohort 001 Student', time:'4 hours ago', color:'#059669', tag:'Study Group', tagBg:'#064e3b', tagColor:'#34d399' },
  p2: { title:'Job readiness system checklist tips that saved my preparation', role:'Exam Candidate', time:'1 day ago', color:'#7c3aed', tag:'General', tagBg:'#2e1065', tagColor:'#c084fc' },
};
function postNums(p){
  const m = String(p.reacts||'').match(/(\d+)\s*likes?\s*[^\d]*(\d+)\s*repl/i);
  return { likes: m?Number(m[1]):0, replies: m?Number(m[2]):0 };
}
window._likePost = function(id, el){ const s = socialState(); s.likes[id] = (s.likes[id]||0)+1; socialSave(s); const b = el.querySelector('b'); if(b) b.textContent = postLikes(id); toast('Liked'); };
function postLikes(p){ const s = socialState(); const n = postNums(p); return n.likes + (s.likes[p.id]||0); }
function allPosts(){ const mine = socialState().posts || []; return [...mine, ...COMMUNITY.posts]; }
window._sendPost = function(){
  const ta = $('#composerText'); const v = (ta.value||'').trim();
  if(!v){ toast('Write something first'); return; }
  const s = socialState();
  s.posts.unshift({ id:'u'+Date.now(), author:'John Doe', initials:'JD', color:'#d97706', tag:'General', reacts:'0 likes · 0 replies', time:'Just now', title:'', body:v, mine:true });
  socialSave(s); route(); toast('Posted to community');
};
window._newPost = function(){ const ta = $('#composerText'); if(ta){ ta.focus(); ta.scrollIntoView({behavior:'smooth',block:'center'}); } };
/* general message board (admin-only, read-only) */
const GENERAL_BOARD = [
  { id:'g1', title:'Welcome to Cohort 001 — Start Here', body:'Welcome to the Core / Classic Business Analysis track. Complete your Daily Check-In first, then open Day 1 from the sidebar. Your streak starts the day you claim XP.', meta:'Zeelin Admin \u2022 Pinned \u2022 Aug 1' },
  { id:'g2', title:'Live Workshop Schedule — August 2026', body:'Two live sessions this month: Effective Communication on Tue Aug 4 at 4:00 PM and the Cohort 001 Weekly Q&A on Sat Aug 8 at 2:00 PM. Add them to your calendar from the Calendar page.', meta:'Zeelin Admin \u2022 Aug 2' },
  { id:'g3', title:'How Mock Quizzes Are Scored', body:'Every chapter quiz has 5 questions and needs 4 correct to pass. Retakes are unlimited and only your best attempt counts toward readiness.', meta:'Zeelin Admin \u2022 Aug 5' },
  { id:'g4', title:'Scheduled Maintenance — Recordings Archive', body:'The recordings archive will be briefly unavailable this Sunday between 2:00 AM and 4:00 AM while we publish the new workshop replays.', meta:'Zeelin Admin \u2022 Aug 9' },
];
function renderBoard() {
  const cards = GENERAL_BOARD.map((g) => `<div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;margin-bottom:20px;">`
    + `<div style="padding:16px 20px;border-bottom:1px solid #2a2a2a;display:flex;align-items:center;justify-content:space-between;">`
    + `<div style="display:flex;align-items:center;gap:12px;">`
    + `<div style="width:36px;height:36px;border-radius:50%;background-color:#d97706;display:flex;align-items:center;justify-content:center;font-weight:bold;color:white;font-size:14px;">ZA</div>`
    + `<div><div style="font-size:14px;font-weight:600;color:#ffffff;">Zeelin Admin</div>`
    + `<div style="font-size:12px;color:#a3a3a3;">${esc(g.meta)}</div></div></div>`
    + `<span style="background-color:#382818;color:#d97706;font-size:11px;font-weight:600;padding:4px 8px;border-radius:4px;">Announcement</span></div>`
    + `<div style="padding:20px;">`
    + `<h3 style="font-size:16px;font-weight:600;color:#ffffff;margin:0 0 10px 0;">${esc(g.title)}</h3>`
    + `<p style="font-size:13px;color:#d4d4d4;line-height:1.5;margin:0;">${esc(g.body)}</p>`
    + `</div></div>`).join('');
  $('#page').innerHTML = `
    <div style="padding:24px;max-width:900px;margin:0 auto;width:100%;box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;border-bottom:1px solid #2a2a2a;padding-bottom:16px;">
        <div>
          <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 4px 0;">General Message Board</h1>
          <p style="font-size:13px;color:#a3a3a3;margin:0;">Official announcements from the Zeelin Admin — read-only, no replies.</p>
        </div>
      </div>
      ${cards}
    </div>`;
  $('#page').addEventListener('click', backLink);
}
/* calendar demo store */
let CAL_VIEW = { y:2026, m:7 };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
window._calNav = function(d){ let m = CAL_VIEW.m + d, y = CAL_VIEW.y; while(m<0){m+=12;y--;} while(m>11){m-=12;y++;} CAL_VIEW = {y:y,m:m}; route(); };
window._calAdd = function(t){ toast('Added to your calendar (demo)'); };
window._calDetails = function(id){
  const e = CALENDAR_EVENTS.find((x)=>x.id===id); if(!e) return;
  const el = $('#calDet-'+id); if(el) el.style.display = el.style.display==='none'?'block':'none';
};
/* recordings demo store */
let REC_FILTER = 'all';
window._recFilter = function(v){ REC_FILTER = v; route(); };
const REC_VIDEO = { r1:'v1', r2:'v2' };
window._playRec = function(id){ go('/watch/' + (REC_VIDEO[id] || 'v1')); };


/* ============ SIDEBAR / TOPBAR ============ */
function renderSidebar() {
  const r = parseHash()[0] || 'home';
  const open = treeOpen();
  const navA = (route, href, icon, text, badge, badgeHot) => {
    const act = r === route;
    return `<a href="${href}" style="display:flex;align-items:center;${badge?'justify-content:space-between;':'gap:10px;'}padding:10px 12px;color:${act?'#ffffff':'#a3a3a3'};${act?'background-color:#262626;font-weight:500;':''}border-radius:6px;text-decoration:none;">`
      + (badge
        ? `<span style="display:flex;align-items:center;gap:10px;">${ic(icon,16,16)}<span>${text}</span></span><span style="background-color:${act&&badgeHot?'#382818':'#2a2a2a'};color:${act&&badgeHot?'#d97706':'#a3a3a3'};font-size:11px;padding:2px 6px;border-radius:10px;">${badge}</span>`
        : `${ic(icon,16,16)}<span>${text}</span>`) + `</a>`;
  };
  const lbl = (t) => `<div style="padding:16px 12px 6px 12px;font-size:11px;font-weight:600;color:#737373;letter-spacing:0.5px;">${t}</div>`;
  const dayRoutes = ['day','book','videos','visual','roadmap','checkin','accountability'];
  const isDayRoute = dayRoutes.includes(r);
  const weekHTML = (w) => {
    const isOpen = open.includes(w.id);
    const days = w.days.map((n) => {
      const act = isDayRoute && STATE.day === n;
    const wd = TREE_DAYS[(n - 1) % 6] || '';
      let h = `<div style="padding-left:16px;display:flex;flex-direction:column;gap:2px;font-size:12px;">`
        + `<a onclick="window._navDay(${n})" style="display:flex;align-items:center;gap:8px;padding:6px 10px;color:${act?'#d97706':'#a3a3a3'};${act?'background-color:#2a2218;':''}border-radius:4px;text-decoration:none;cursor:pointer;">`
        + `<svg style="width:12px;height:12px;fill:currentColor;" viewBox="0 0 24 24"><path d="${PLUS_D}"/></svg><span>Day ${n}</span><span style="color:#5a5a5a;">&bull; ${wd}</span></a>`;
      if (n === 1) h += dayGroupsHTML(r);
      return h + `</div>`;
    }).join('')
    + (!w.days.length ? `<div style="padding:6px 10px 6px 26px;font-size:11.5px;color:#5a5a5a;">Demo &mdash; unlocks in full program</div>` : '');
    const wAct = w.id === 'w1';
    return `<div style="padding-left:16px;display:flex;flex-direction:column;gap:2px;${w.id!=='w1'?'margin-top:4px;':''}">`
      + `<div onclick="window._navTree('${w.id}')" style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;color:#a3a3a3;border-radius:6px;cursor:pointer;${wAct?'background-color:#222222;':''}">`
      + `<span style="display:flex;align-items:center;gap:6px;">${chevSvg(10,isOpen)}<span style="font-size:12px;${wAct?'font-weight:500;color:#fff;':''}">${w.label}</span></span></div>`
      + (isOpen ? days : '') + `</div>`;
  };
  $('#sidebar').innerHTML = `
    <div style="padding:22px 16px;border-bottom:2px solid #3a3a3a;display:flex;align-items:center;justify-content:center;text-align:center;">
      <span style="font-size:13px;font-weight:800;color:#ffffff;letter-spacing:1px;line-height:1.4;">ZEELIN JOB READINESS SYSTEM</span>
    </div>
    <div style="padding:12px 8px;display:flex;flex-direction:column;gap:4px;font-size:13px;">
      ${navA('guide','#/guide','info','User Guide')}
      ${navA('board','#/board','feed','General Message Board','4')}
      ${navA('community','#/community','users','General Community')}
      ${navA('monday','#/monday','heart','Monday Motivations')}
      ${lbl('CORE / CLASSIC BUSINESS ANALYSIS')}
      <div style="display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;color:#ffffff;border-radius:6px;cursor:pointer;">
          <span style="display:flex;align-items:center;gap:10px;">${chevSvg(14,true)}${folderSvg(16)}<span style="font-weight:500;">Core / Classic Business Analysis</span></span>
        </div>
        <div style="padding-left:16px;display:flex;flex-direction:column;gap:2px;">
          <div onclick="window._navCohort()" title="Collapse cohort" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;color:#e5e5e5;border-radius:6px;cursor:pointer;">
            <span style="display:flex;align-items:center;gap:8px;">${chevSvg(12,cohortOpen())}${folderSvg(14)}<span>Cohort 001</span></span>
          </div>
          ${cohortOpen() ? `<div style="padding-left:16px;display:flex;flex-direction:column;gap:2px;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;color:#d4d4d4;border-radius:6px;cursor:pointer;">
              <span style="display:flex;align-items:center;gap:8px;">${chevSvg(12,true)}${folderSvg(14)}<span>MODULE 1</span></span>
            </div>
            ${TREE_WEEKS.map(weekHTML).join('')}
          </div>` : ''}
        </div>
      </div>
      ${navA('calendar','#/calendar','calendar','Calendar','3',true)}
      ${navA('recordings','#/recordings','rec','Recordings')}
      ${lbl('Account')}
      ${navA('profile','#/profile','user','Profile & Insights')}
      ${navA('support','#/support','help','Support')}
      ${navA('aluminal','#/aluminal','crown','Aluminal')}
    </div>`;
}

function renderTopbar() {
  const claimed = claimedToday();
  const routeName = parseHash()[0] || 'home';
  const crumb = routeName === 'home' ? 'Your Courses' : `${esc(dayCard(STATE.day).title)} - Day ${STATE.day} of 7`;
  $('#topbar').innerHTML = `
    <button class="burger" id="burger">${ic('burger', 20, 20)}</button>
    <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
      <img src="${A}logo.png" alt="Zeelin Academy Logo" style="height:42px;width:auto;object-fit:contain;">
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;min-width:280px;">
      <span style="font-size:26px;font-weight:900;letter-spacing:1.2px;color:#ffffff;white-space:nowrap;text-align:center;width:100%;">ZEELIN JOB TRAINING PORTAL</span>
    </div>
    <div class="top-actions" style="flex-shrink:0;">
      <a href="/portal.html" class="top-chip" style="text-decoration:none;border-color:#3a3a3a;background:#1e1e1e;color:#f59e0b" title="Switch Portal">${ic('layers', 14, 14)} Portals</a>
      <span class="top-chip top-xp">${ic('zap', 15, 15)} ${STATE.xp.toLocaleString()} XP</span>
      <span class="top-chip top-streak">${ic('fire', 15, 15)} ${STATE.streak}</span>
      <button class="top-icon" data-go="checkin" title="Check-In">${ic('user-check', 17, 17)}</button>
      <button class="profile-btn" data-go="profile"><img class="profile-avatar" src="${USER.avatar}" alt=""/><span class="profile-name">${esc(USER.name)}</span>${ic('caret', 14, 14)}</button>
    </div>`;
  $$('[data-go]', $('#topbar')).forEach((b) => b.addEventListener('click', () => go('/' + b.dataset.go)));
  $('#burger').addEventListener('click', () => { $('#sidebar').classList.toggle('open'); $('#backdrop').classList.toggle('show'); });
  $('#backdrop').addEventListener('click', () => { $('#sidebar').classList.remove('open'); $('#backdrop').classList.remove('show'); });
}

/* ============ STAR RATING + FEEDBACK ============ */
function starRow(cur) {
  return `<div class="star-row">${[1, 2, 3, 4, 5].map((n) => `<button class="starb${cur === n ? ' on' : ''}" data-star="${n}">${ic('star', 24, 24)}</button>`).join('')}</div>`;
}
function stackedOptChips(opts, prefix, selVal) {
  return opts.map((o, i) => `<button type="button" class="radio-chip${selVal === i ? ' sel' : ''}" data-${prefix}="${i}">${esc(o)}</button>`).join('');
}
function feedbackFormHTML() {
  const stars = STATE.stars;
  const sfb = STAR_FB[stars];
  return `
    <div class="fb-inner">
      <div class="fb-qs">
        <div class="fb-q-block">
          <div class="fb-q">Rate this session</div>
          ${starRow(stars)}
          ${stars ? `<div class="fb-branch"><div class="branch-q">${esc(sfb.q)}</div><div class="branch-prompt">${esc(sfb.prompt)}</div><div class="check-row">${stackedOptChips(sfb.opts, 'starbranch', STATE.ci.starOpt)}</div><textarea class="fb-area" id="fbStarText" placeholder="Your response...">${esc(STATE.ci.starText || '')}</textarea></div>` : ''}
        </div>
        <div class="fb-q-block">
          <div class="fb-q">Is there anything you suggest for us to improve?</div>
          <textarea class="fb-area" id="fbImprove" placeholder="Tell us what would make the course better...">${esc(STATE.improve || '')}</textarea>
        </div>
        <div class="fb-q-block">
          <div class="fb-q">Is there any part you do not understand in the last course?</div>
          <textarea class="fb-area" id="fbUnclear" placeholder="Name the specific topic or concept...">${esc(STATE.unclear || '')}</textarea>
        </div>
      </div>
    </div>`;
}
function wireFeedback(container) {
  container.addEventListener('click', (e) => {
    const star = e.target.closest('.starb');
    if (star) {
      STATE.stars = Number(star.dataset.star);
      save();
      const inner = container.querySelector('.fb-inner');
      if (inner) inner.outerHTML = feedbackFormHTML();
      return;
    }
    const chip = e.target.closest('[data-starbranch]');
    if (chip) { STATE.ci.starOpt = Number(chip.dataset.starbranch); chipSel(chip); save(); }
  });
  container.addEventListener('input', (e) => {
    if (e.target.id === 'fbStarText') STATE.ci.starText = e.target.value;
    if (e.target.id === 'fbImprove') STATE.improve = e.target.value;
    if (e.target.id === 'fbUnclear') STATE.unclear = e.target.value;
    save();
  });
}
function feedbackScore() {
  let n = 0;
  if (STATE.stars != null) n++;
  if (STATE.ci.starOpt != null) n++;
  if ((STATE.improve || '').trim().length > 0) n++;
  if ((STATE.unclear || '').trim().length > 0) n++;
  return n;
}

/* ============ CHECK-IN FORM (shared: page + overlay) ============ */
function checkinFormHTML() {
  const claimed = claimedToday();
  return `
    <div class="ci-wrap" id="ciWrap">
      <div class="ci-bar-head"><span class="n">Ready to Claim</span>${bar(Math.round(Object.keys(checkinFilled()).length / checkinTotal() * 100), 'gradient ci-progress', 'ciBar')}<span class="n" id="ciPct">0%</span></div>
      <div class="ci-claim" id="ciClaim">
        <span class="xp">+${CHECKIN.xpAmount} <small>XP</small></span>
        <div class="ci-claim-txt">${claimed ? '<b>Claimed today</b> - the streak is safe for now.' : 'Claim today\'s daily bonus to keep the streak alive. It unlocks once every section below is filled.'}</div>
        <button class="btn btn-gradient btn-claim${claimed ? '' : ' is-locked'}" id="claimXp"${claimed || !allFilled() ? ' disabled' : ''}>${ic('zap', 16, 16)} <span>${claimed ? 'XP Claimed' : 'Claim +' + CHECKIN.xpAmount + ' XP'}</span></button>
      </div>
      <div class="ci-form">
        <div class="ci-qs">
          <div class="ci-q">
            <div class="ci-label">How productive was <b>yesterday</b>'s session?</div>
            <div class="radio-row">${CHECKIN.productive.map((o, i) => `<button type="button" class="radio-chip${STATE.ci.productive === i ? ' sel' : ''}" data-ci="productive" data-v="${i}">${ic(o.icon, 15, 15)} ${esc(o.label)}</button>`).join('')}</div>
          </div>
          <div class="ci-q">
            <div class="ci-label">How is your energy today?</div>
            <div class="radio-row">${CHECKIN.energy.map((o, i) => `<button type="button" class="radio-chip${STATE.ci.energy === i ? ' sel' : ''}" data-ci="energy" data-v="${i}">${ic(o.icon, 15, 15)} ${esc(o.label)}</button>`).join('')}</div>
          </div>
          <div class="ci-q">
            <div class="ci-label">Rate yesterday's session</div>
            ${starRow(STATE.stars)}
            ${STATE.stars ? `<div class="fb-branch"><div class="branch-q">${esc(STAR_FB[STATE.stars].q)}</div><div class="branch-prompt">${esc(STAR_FB[STATE.stars].prompt)}</div><div class="check-row">${stackedOptChips(STAR_FB[STATE.stars].opts, 'starOpt', STATE.ci.starOpt)}</div><textarea class="fb-area" id="ciStarText" placeholder="Your response...">${esc(STATE.ci.starText || '')}</textarea></div>` : ''}
          </div>
          <div class="ci-q">
            <div class="ci-label">Is there anything you suggest for us to improve?</div>
            <textarea class="fb-area" id="ciImprove" placeholder="Share what would make the next day even better...">${esc(STATE.improve || '')}</textarea>
          </div>
          <div class="ci-q">
            <div class="ci-label">Is there any part you do not understand in the last course?</div>
            <textarea class="fb-area" id="ciUnclear" placeholder="Point us at the exact concept...">${esc(STATE.unclear || '')}</textarea>
          </div>
        </div>
        <div class="ci-side">
          <div class="lbl">${ic('fire', 15, 15)} 7-Day Study Streak</div>
          <div class="streak">${CHECKIN.streak.map((d, i) => `<span class="s${i < CHECKIN.streakOn ? ' on' : ''}${i === CHECKIN.streak.length - 1 ? ' today' : ''}">${d}</span>`).join('')}</div>
          <div class="chk">
            <div class="check-item"><input type="checkbox" ${claimed ? 'checked' : ''} ${claimed ? 'disabled' : ''}/><span>Day streak XP claimed</span></div>
            <div class="check-item"><input type="checkbox" ${STATE.stars != null && allFilled() ? 'checked' : ''}/><span>Daily feedback submitted</span></div>
          </div>
          <div class="next-line">XP unlocks when every block is complete.</div>
        </div>
      </div>
    </div>`;
}
function checkinTotal() { return 5; }
function checkinFilled() {
  const f = {};
  if (STATE.ci.productive != null) f.productive = true;
  if (STATE.ci.energy != null) f.energy = true;
  if (STATE.stars != null) f.stars = true;
  if ((STATE.improve || '').trim()) f.improve = true;
  if ((STATE.unclear || '').trim()) f.unclear = true;
  return f;
}
function allFilled() { return Object.keys(checkinFilled()).length === checkinTotal(); }
function branchBlockHTML(stars) {
  const sfb = STAR_FB[stars] || STAR_FB[5];
  return `<div class="fb-branch"><div class="branch-q">${esc(sfb.q)}</div><div class="branch-prompt">${esc(sfb.prompt)}</div><div class="check-row">${stackedOptChips(sfb.opts, 'starOpt', STATE.ci.starOpt)}</div><textarea class="fb-area" id="ciStarText" placeholder="Your response...">${esc(STATE.ci.starText || '')}</textarea></div>`;
}
function wireCheckin(container) {
  const apply = function () {
    const pct = Math.round(Object.keys(checkinFilled()).length / checkinTotal() * 100);
    const barEl = $('#ciBar', container); if (barEl) { const i = barEl.querySelector('i'); if (i) i.style.width = pct + '%'; }
    const pctEl = $('#ciPct', container); if (pctEl) pctEl.textContent = pct + '%';
    const btn = $('#claimXp', container);
    if (btn) {
      const ok = allFilled();
      const claimed = claimedToday();
      btn.disabled = claimed || !ok;
      btn.classList.toggle('is-locked', claimed || !ok);
      btn.innerHTML = `${ic('zap', 16, 16)} <span>${claimed ? 'XP Claimed' : 'Claim +' + CHECKIN.xpAmount + ' XP'}</span>`;
    }
  };
  apply();
  container.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-ci]');
    if (chip) { STATE.ci[chip.dataset.ci] = Number(chip.dataset.v); chipSel(chip); save(); apply(); return; }
    const star = e.target.closest('.starb');
    if (star) {
      STATE.stars = Number(star.dataset.star); save();
      $$('.starb', container).forEach((s) => s.classList.toggle('on', Number(s.dataset.star) === STATE.stars));
      const wrap = container.querySelector('#ciWrap') || container;
      const q = wrap.querySelectorAll('.ci-q')[2];
      if (q) {
        const old = q.querySelector('.fb-branch'); if (old) old.remove();
        if (STATE.stars) q.insertAdjacentHTML('beforeend', branchBlockHTML(STATE.stars));
      }
      apply();
      return;
    }
    const so = e.target.closest('[data-staropt]');
    if (so) { STATE.ci.starOpt = Number(so.dataset.staropt); chipSel(so); save(); apply(); return; }
    const claimBtn = e.target.closest('#claimXp');
    if (claimBtn) {
      if (claimedToday() || !allFilled()) { toast('Complete every block to unlock your XP.'); return; }
      doClaimXP();
    }
  });
  container.addEventListener('input', (e) => {
    if (e.target.id === 'ciImprove') STATE.improve = e.target.value;
    if (e.target.id === 'ciUnclear') STATE.unclear = e.target.value;
    if (e.target.id === 'ciStarText') STATE.ci.starText = e.target.value;
    save(); apply();
  });
}

function doClaimXP() {
  STATE.claimedDays[STATE.day] = dateStamp();
  STATE.claimedAt = dateStamp();
  STATE.xp += CHECKIN.xpAmount;
  STATE.claims += 1;
  save();
  const ov = $('#dashOv') || openModal('', '');
  ov.className = 'dash-overlay celebrate';
  ov.innerHTML = `<div class="claim-win"><div class="confetti-layer"></div><div class="th-anim"><i class="th-ring"></i><span class="th-check">${ic('zap', 46, 46)}</span></div><div class="gate-big">+${CHECKIN.xpAmount} XP claimed!</div><div class="gate-line">Streak extended to <b>${STATE.streak + 1}</b> days. See you back tomorrow.</div><button class="btn btn-grad-green btn-block" id="claimDone">${ic('arrow', 16, 16)} Continue to Day ${STATE.day}</button></div>`;
  confetti(ov, 110);
  $('#claimDone', ov).addEventListener('click', () => { closeDashOverlay(); go('/day'); });
}

function openCheckinOverlay() {
  if ($('#dashOv')) return;
  const ov = openModal(`
    <div class="ci-head">${ic('user-check', 20, 20)}<div><div class="gate-title">Daily Check-In</div><div class="ci-sub">Day ${STATE.day} - complete the blocks to unlock your XP</div></div></div>
    ${checkinFormHTML()}
    <button class="ci-skip" id="ciSkip">Not now - take me to the dashboard</button>`, 'ci-modal');
  wireCheckin(ov, { onClaimed: null });
  $('#ciSkip', ov).addEventListener('click', () => closeDashOverlay());
  ov.addEventListener('click', (e) => { if (e.target === ov) closeDashOverlay(); });
}

/* ============ DAY COMPLETION + SUN JOURNEY ============ */
function dayCompleteMsg(day) {
  const msgs = {
    1: 'Foundations complete - the BA toolkit is yours.',
    2: 'Requirements & Analysis cleared. Beautiful work.',
    3: 'Software Engineering foundations conquered.',
    4: 'Testing & DevOps mastered. Quality is built in.',
    5: 'Prompt Engineering cleared - precise and sharp.',
    6: 'Reasoning & Safe AI complete. Excellent.',
    7: 'The Job Sprint is complete - go land that role!',
  };
  return msgs[day] || 'Another day, another checkpoint cleared.';
}
function allDayTasksDone() {
  const d = STATE.day;
  const claimed = claimedToday(d);
  const readingDone = (function () {
    const href = dayReadingHref(d);
    const [, , bid, idxStr] = href.split('/');
    const idx = Number(idxStr);
    return !!(STATE.done[bid] && STATE.done[bid][idx]);
  })();
  const videosDone = VIDEOS.filter((v) => v.day === d).every((v) => !!STATE.doneVideo[v.id]);
  const deckDone = !!STATE.doneDeck[deckIdForDay(d)];
  const prevDone = !!STATE.prevDoneDay[d];
  return claimed && readingDone && videosDone && deckDone && prevDone && feedbackScore() === 4;
}
function tryCompleteDay() {
  if (STATE.completedDays.includes(STATE.day)) return false;
  if (!allDayTasksDone()) return false;
  STATE.completedDays.push(STATE.day);
  save();
  showDayComplete();
  return true;
}
function showDayComplete() {
  const day = STATE.day;
  const last = day >= 7;
  const ov = openModal('', 'day-complete');
  ov.innerHTML = `<div class="day-comp"><div class="confetti-layer"></div>
    <div class="th-anim"><i class="th-ring big"></i><span class="th-check gold">${ic(last ? 'crown' : 'trophy', 52, 52)}</span></div>
    <div class="dc-title">${last ? 'Course Complete!' : 'Day ' + day + ' Complete!'}</div>
    <div class="dc-line">${esc(dayCompleteMsg(day))}</div>
    <div class="dc-stats">${ICONS_ROW(day)}</div>
    ${last ? `<button class="btn btn-grad-green btn-block" id="dcNext">${ic('award', 16, 16)} Your Journey</button>` : `<div class="dc-nextline">Ready to move on?</div><button class="btn btn-grad-green btn-block" id="dcNext">${ic('arrow', 16, 16)} Next Day: Day ${day + 1}</button>`}
  </div>`;
  confetti(ov, 150);
  $('#dcNext', ov).addEventListener('click', () => {
    if (last) { closeDashOverlay(); go('/profile'); return; }
    runSunJourney(ov, day);
  });
}
function ICONS_ROW(day) {
  const items = [
    ['check', 'XP claimed', claimedToday()],
    ['book', 'Reading done', (function () { const h = dayReadingHref(day); const [, , b, i] = h.split('/'); return !!(STATE.done[b] && STATE.done[b][Number(i)]); })()],
    ['video', 'Videos seen', VIDEOS.filter((v) => v.day === day).every((v) => !!STATE.doneVideo[v.id])],
    ['layers', 'Deck cleared', !!STATE.doneDeck[deckIdForDay(day)]],
    ['chat', 'Q&A done', !!STATE.prevDoneDay[day]],
  ];
  return `<div class="dc-icon-row">${items.map(([i, l, ok]) => `<span class="dc-icon${ok ? ' ok' : ''}">${ic(i, 18, 18)}<em>${l}</em></span>`).join('')}</div>`;
}
function runSunJourney(ov, fromDay) {
  const toDay = Math.min(fromDay + 1, 7);
  ov.innerHTML = `
    <div class="sun-stage">
      <div class="sun-earth"><div class="earth-arc"></div><div class="sun-orb"></div><div class="glow"></div>
        <div class="day-pin pin-a"><span class="dp-dot"></span><b>Day ${fromDay}</b></div>
        <div class="day-pin pin-b"><span class="dp-dot"></span><b>Day ${toDay}</b></div>
        <div class="clouds"><i class="clo c1"></i><i class="clo c2"></i><i class="clo c3"></i></div>
      </div>
      <div class="journey-line" id="jLine"><div class="jl-ship">${ic('sun', 26, 26)}</div></div>
      <div class="journey-title" id="jTitle">The sun rises on a new day</div>
      <div class="journey-sub" id="jSub">${fromDay === 7 ? 'The whole course is yours now.' : 'Loading ' + dayCard(toDay).title + '...'}</div>
    </div>`;
  setTimeout(() => {
    const line = $('#jLine', ov); if (line) line.classList.add('ride');
    setTimeout(() => {
      closeDashOverlay();
      STATE.day = toDay;
      save();
      go('/day');
    }, 2400);
  }, 500);
}

/* ============ COURSES LANDING (#/) ============ */
function courseById(id) { return COURSES.find((c) => c.id === id) || COURSES[0]; }
function resumeCourseDay(id) {
  const c = courseById(id);
  const todo = (c.days || []).filter((d) => !STATE.completedDays.includes(d));
  return todo.length ? todo[0] : c.days[0];
}
function renderCourses() {
  $('#page').innerHTML = `
    <div class="home">
      <div class="home-welcome">
        <div class="home-hello">Welcome back</div>
        <h1>Welcome back, ${esc(USER.name.split(' ')[0])}</h1>
        <div class="sub">You're enrolled in ${COURSES.length} course${COURSES.length === 1 ? '' : 's'}. Pick up where you left off, or continue the day that unlocks your next XP claim.</div>
      </div>
      <div class="cat-head"><span class="cat-title">${esc((COURSES[0] && COURSES[0].category) || 'Core / Classic Business Analysis')}</span><span class="cat-badge">Purchased</span></div>
      <div class="enrolled${COURSES.length===1?' single':COURSES.length===2?' dual':''}">
        ${COURSES.map((c) => {
    const pct = Math.max(0, Math.min(100, c.progress));
    const hours = c.completedHours + ' of ' + c.estimatedHours + 'h';
    return `
          <div class="enr-card" role="button" tabindex="0" data-continue="${c.id}" aria-label="${esc(c.title)} — ${c.progress > 0 ? 'Continue course' : 'Start course'}">
            <div class="enr-hero"><img class="cover" src="${c.cover}?v=2" alt=""/><div class="enr-hero-overlay"></div><div class="enr-badges"><span class="enr-badge">${esc(c.weekName)}</span><span class="enr-badge dim">${esc(c.short)}</span></div><div class="enr-hero-meta">${c.readiness}% readiness &bull; ${hours}</div></div>
            <div class="enr-body">
              <h3>${esc(c.title)}</h3>
              <div class="enr-sub">${esc(c.weekName)} - ${esc(c.cohort)}</div>
              <div class="enr-pills"><span>READING INSIDE</span><span>VIDEOS INSIDE</span><span>DECK INSIDE</span></div>
              <div class="stat-row mt12">
                <div class="stat-box ${c.readiness >= 60 ? 'good' : 'warn'}"><div class="v">${c.readiness}%</div><div class="l">Readiness</div></div>
                <div class="stat-box"><div class="v">${hours}</div><div class="l">Hours</div></div>
                <div class="stat-box warn"><div class="v">${c.daysLeft} Days</div><div class="l">Days left</div></div>
              </div>
            </div>
            <div class="enr-foot"><div class="readiness"><div class="rl"><span>Course progress</span><b>${pct}%</b></div>${bar(pct, 'gradient')}</div><button class="btn btn-gradient btn-block" data-continue="${c.id}">${c.progress > 0 ? 'Continue Course ' : 'Start Course '}${ic('arrow', 15, 15)}</button></div>
          </div>`;
  }).join('')}
      </div>
    </div>`;
  $('#page').addEventListener('click', (e) => {
    const t = e.target.closest('[data-continue]');
    if (t) {
      STATE.day = resumeCourseDay(t.dataset.continue);
      save();
      go('/day');
    }
  });
  $('#page').addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('enr-card')) {
      e.preventDefault();
      STATE.day = resumeCourseDay(e.target.dataset.continue);
      save();
      go('/day');
    }
  });
}

/* ============ DAY DASHBOARD (#/day) ============ */
function accountabilityCardHTML() {
  const ready = ACCOUNTABILITY.top;
  return `
    <div class="p-card">
      <div class="p-top">
        <div class="icobox purple">${ic('chart', 30, 30)}</div>
        <div class="p-txt"><div class="pt-title">Accountability Check-In</div><div class="pt-sub">Weekly breakdown &amp; study-hours report</div></div><span class="pt-pct amber">${ready.progress}%</span>
      </div>
      <div class="p-bar"><i style="width:${ready.progress}%"></i></div>
      <div class="p-foot"><button class="btn btn-gradient" data-go="/accountability">Submit Report</button></div>
    </div>`;
}
function checkinCardHTML() {
  const claimed = claimedToday();
  return `
    <div class="p-card ci-card${claimed ? ' claimed' : ''}">
      <div class="p-top">
        <div class="icobox green">${ic('user-check', 30, 30)}</div>
        <div class="p-txt"><div class="pt-title">Attendance &amp; Personal Check-In</div><div class="pt-sub">${claimed ? 'XP claimed for today' : 'Complete the blocks to claim +' + CHECKIN.xpAmount + ' XP'}</div></div>
        <span class="pt-pct ${claimed ? 'green' : 'amber'}">${claimed ? '100%' : feedbackScore() * 20 + '%'}</span>
      </div>
      ${claimed ? `<div class="p-claim-state"><div class="blur-tag">${ic('check', 14, 14)} Claimed</div><div class="countdown" id="ciCount">&nbsp;</div></div>` : ''}
      <div class="p-bar ${claimed ? 'green' : ''}"><i style="width:${claimed ? 100 : feedbackScore() * 20}%"></i></div>
      <div class="p-foot"><button class="btn ${claimed ? 'btn-outline' : 'btn-green'}" data-go="checkin">${claimed ? 'Reopen Check-In' : 'Check In'}</button></div>
    </div>`;
}
function flatChapters() {
  const list = [];
  BOOKS.forEach((b) => b.chapters.forEach((ch, idx) => list.push({ bookId: b.id, bookTitle: b.title, bookColor: b.color, ch, idx })));
  return list;
}
function nextUnifiedChapter() {
  const flat = flatChapters();
  for (let i = 0; i < flat.length; i++) {
    const r = flat[i];
    const done = !!(STATE.done[r.bookId] && STATE.done[r.bookId][r.idx]);
    const unlocked = r.idx === 0 || !!(STATE.done[r.bookId] && STATE.done[r.bookId][r.idx - 1]);
    if (!done && unlocked) return { flat, idx: i, entry: r };
  }
  const firstUndone = flat.find((r) => !(STATE.done[r.bookId] && STATE.done[r.bookId][r.idx]));
  if (firstUndone) return { flat, idx: flat.indexOf(firstUndone), entry: firstUndone };
  return { flat, idx: 0, entry: flat[0] };
}
function dashCard(c) {
  if (c.k === 'roadmap') {
    const flat = flatChapters();
    const doneCount = flat.filter((r) => !!(STATE.done[r.bookId] && STATE.done[r.bookId][r.idx])).length;
    const overallPct = Math.round(doneCount / flat.length * 100);
    return `
    <div class="p-card roadmap-card" style="border:2px solid #3a3a3a;">
      <div class="p-top">
        <div class="icobox ${c.tile} lg">${ic(c.icon, 30, 30)}</div>
        <div class="p-txt"><div class="pt-title" style="font-weight:800;">${esc(c.title)}</div><div class="pt-sub" style="font-weight:600;color:#d4d4d4;">${doneCount} of ${flat.length} chapters cleared — unified index</div></div>
        <span class="pt-pct ${overallPct === 100 ? 'green' : 'amber'}" style="font-weight:800;">${overallPct}%</span>
      </div>
      <div class="p-bar ${overallPct === 100 ? 'green' : ''}" style="height:6px;border:1px solid #3a3a3a;"><i style="width:${overallPct}%"></i></div>
      <div class="p-foot" style="background:#161616;border-top:2px solid #3a3a3a;"><button class="btn btn-gradient" data-go="/roadmap" style="font-weight:800;letter-spacing:.2px;">Open Roadmap ${ic('arrow', 14, 14)}</button></div>
    </div>`;
  }
  if (c.k === 'reading') {
    const { flat, idx, entry } = nextUnifiedChapter();
    const doneCount = flat.filter((r) => !!(STATE.done[r.bookId] && STATE.done[r.bookId][r.idx])).length;
    const pct = Math.round(doneCount / flat.length * 100);
    const globalPos = idx + 1;
    const sub = doneCount === flat.length ? 'All chapters cleared — quiz passed' : `Chapter ${globalPos} of ${flat.length} — ${entry.ch.t}`;
    const cls = doneCount === flat.length ? 'green' : pct > 0 ? 'amber' : c.cls;
    const btn = doneCount === 0 ? 'Start Reading' : doneCount === flat.length ? 'Replay' : 'Continue Reading';
    const href = `/book/${entry.bookId}/${entry.idx}`;
    const iconHtml = `<div class="icobox ${c.tile} lg">${ic(c.icon, 30, 30)}</div>`;
    return `
    <div class="p-card">
      <div class="p-top">${iconHtml}<div class="p-txt"><div class="pt-title">${esc(c.title)}</div><div class="pt-sub">${esc(sub)}</div></div><span class="pt-pct ${cls}">${pct}%</span></div>
      <div class="p-bar ${cls === 'green' ? 'green' : ''}"><i style="width:${pct}%"></i></div>
      <div class="p-foot"><button class="btn btn-gradient" data-go="${href}">${esc(btn)}</button></div>
    </div>`;
  }
  let pct = c.pct, sub = c.sub, cls = c.cls;
  if (c.k === 'video') {
    const vids = VIDEOS.filter((v) => v.day === STATE.day);
    const seen = vids.filter((v) => STATE.doneVideo[v.id]).length;
    pct = Math.round(seen / Math.max(1, vids.length) * 100); sub = seen + ' of ' + vids.length + ' videos watched'; cls = seen === vids.length ? 'green' : c.cls;
  }
  if (c.k === 'visual') { const done = !!STATE.doneDeck[deckIdForDay(STATE.day)]; pct = done ? 100 : c.pct; sub = done ? 'Pitch deck cleared - quiz passed' : c.sub; cls = done ? 'green' : c.cls; }
  const iconHtml = c.img ? `<div class="imgbox lg"><img src="${c.img}" alt=""/></div>` : `<div class="icobox ${c.tile} lg">${ic(c.icon, 30, 30)}</div>`;
  return `
    <div class="p-card">
      <div class="p-top">${iconHtml}<div class="p-txt"><div class="pt-title">${esc(c.title)}</div><div class="pt-sub">${esc(sub)}</div></div><span class="pt-pct ${cls}">${pct}%</span></div>
      <div class="p-bar ${cls === 'green' ? 'green' : ''}"><i style="width:${pct}%"></i></div>
      <div class="p-foot"><button class="btn btn-gradient" data-go="${c.href}">${esc(c.btn)}</button></div>
    </div>`;
}
const PREVC = {};
function prevQAHTML() {
  const d = STATE.day;
  const course = courseForDay(d);
  const qa = PREV_QA[course] || PREV_QA.foundation;
  const questions = qa.questions.slice(0, 4);
  if (!!STATE.prevDoneDay[d]) {
    return `<div class="prev-done">${ic('check', 18, 18)}<div><b>Previous session Q&amp;A complete</b><span class="pt-sub">You aced yesterday's refresher.</span></div></div>`;
  }
  const st = PREVC[d] || (PREVC[d] = { answers: [], cursor: 0 });
  const cursor = Math.min(st.cursor, questions.length - 1);
  return `
    <div class="qa-inner" id="qaInner">
      <div class="qa-headline">${esc(qa.title)}</div>
      <div class="qa-subline">${esc(qa.sub)}</div>
      <div class="qa-progress"><span class="n">Step ${cursor + 1} of ${questions.length}</span>${bar(Math.round(cursor / questions.length * 100), 'gradient')}<span class="n">${Math.round(cursor / questions.length * 100)}%</span></div>
      <div class="qa-question">${esc(questions[cursor].q)}</div>
      <div class="qopts">${questions[cursor].opts.map((o, i) => `<div class="option" data-qa="${i}"><span class="rad"></span>${esc(o)}</div>`).join('')}</div>
      <div class="quiz-nav"><button class="btn btn-amber" id="qaNext">${ic('arrow', 16, 16)} Next</button></div>
    </div>`;
}
function wirePrevQA(page) {
  const host = $('#qaHost', page);
  if (!host) return;
  host.addEventListener('click', (e) => {
    const d = STATE.day;
    const course = courseForDay(d);
    const questions = (PREV_QA[course] || PREV_QA.foundation).questions.slice(0, 4);
    const st = PREVC[d] || (PREVC[d] = { answers: [], cursor: 0 });
    const opt = e.target.closest('.option');
    if (opt) {
      host.querySelectorAll('.option').forEach((x) => x.classList.remove('sel'));
      opt.classList.add('sel');
      st.answers[st.cursor] = Number(opt.dataset.qa);
      return;
    }
    if (e.target.closest('#qaNext')) {
      if (st.answers[st.cursor] === undefined) { toast('Pick an answer first'); return; }
      if (st.cursor >= questions.length - 1) {
        STATE.prevDoneDay[d] = true;
        save();
        host.innerHTML = prevQAHTML();
        tryCompleteDay();
        return;
      }
      st.cursor++;
      host.innerHTML = prevQAHTML();
    }
  });
}
function dayCommunityCards(){
  const defs = [
    { k:'calendar', icon:'calendar', tile:'green', title:'Calendar', sub:CALENDAR_EVENTS.length + ' live events scheduled', pct:100, cls:'green', href:'/calendar', btn:'View Calendar' },
  ];
  return defs.map(dashCard);
}
function renderDay() {
  const d = STATE.day;
  const cardData = dayCard(d);
  const course = courseById(d <= 2 ? 'ba-foundation' : 'requirements-engineering');
  const claimed = claimedToday();
  const readPct = (function () { const h = dayReadingHref(d); const [, , b, i] = h.split('/'); return !!(STATE.done[b] && STATE.done[b][Number(i)]); })();
  const vidVids = VIDEOS.filter((v) => v.day === d);
  const vidSeen = vidVids.filter((v) => STATE.doneVideo[v.id]).length;
  const deckDone = !!STATE.doneDeck[deckIdForDay(d)];
  const itemDone = [claimed, readPct, vidVids.length > 0 && vidSeen === vidVids.length, deckDone, !!STATE.prevDoneDay[d], feedbackScore() === 4].filter(Boolean).length;
  const overall = Math.round(itemDone / 6 * 100);

  $('#page').innerHTML = `
    <div class="day-titlebar">
      <div>
        <div class="eyebrow">Welcome</div>
        <h1>Day ${d} Overview - ${esc(cardData.title)}</h1>
      </div>
      <span class="pill-progress">${ic('checklist', 16, 16)} Overall Day Progress &middot; ${overall}%</span>
    </div>

    <div class="p-grid">
      ${[checkinCardHTML()].concat(cardData.cards.filter((c) => c.k !== 'checkin').map(dashCard)).concat(dayCommunityCards()).concat([accountabilityCardHTML()]).join('')}
    </div>

    <div class="dash-wide-grid">
      <div class="xv-panel prev-qa-panel">
        <div class="phead">${ic('users', 16, 16)} Previous Session Q&amp;A <span class="total">refresh before today</span></div>
        <div id="qaHost">${prevQAHTML()}</div>
      </div>
      <div class="xv-panel feedback-panel">
        <div class="phead">${ic('chat', 16, 16)} Daily Feedback &amp; Q&amp;A <span class="total">${feedbackScore()}/4 answered</span></div>
        <div id="fbWrap">${feedbackFormHTML()}</div>
      </div>
    </div>

    <div class="claim-zone" id="claimZone">${claimed ? `<div class="claim-done-banner">${ic('zap', 18, 18)} XP claimed today - next claim in <b id="ciCount2"></b>.</div>` : ''}</div>`;

  wireDashboard(d);
}
function dayCardQuality() {
  const defs = ['Fresh start', 'Steady climb', 'Halfway there', 'Nearly ready', 'Crushing it'];
  return defs[Math.min(defs.length - 1, STATE.completedDays.length)];
}
function wireDashboard(d) {
  let $host = $('#page');
  $host.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) { e.preventDefault(); e.stopPropagation(); go(t.dataset.go); }
    backLink(e);
  });
  const fw = $('#fbWrap', $host); if (fw) wireFeedback(fw);
  const qh = $('#qaHost', $host);
  if (qh) {
    wirePrevQA($host);
  }
  let cd = $('#ciCount', $host) || $('#ciCount2', $host);
  if (cd) {
    const stamp = STATE.claimedAt || (claimedToday() ? dateStamp() : '');
    function tick() {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const sec = Math.max(0, Math.floor((end - now) / 1000));
      const h = String(Math.floor(sec / 3600)).padStart(2, '0');
      const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      (cd || {}).textContent = h + ':' + m + ':' + s;
    }
    tick();
    every(1000, tick);
  }
  const shouldSpawn = function () {
    if (document.getElementById('dashOv') || document.getElementById('gateOv')) return false;
    return !claimedToday();
  };
  if (shouldSpawn()) setTimeout(() => { if (!overlayOpen() && !claimedToday()) openCheckinOverlay(); }, 350);
  if (claimedToday() && allDayTasksDone() && !STATE.completedDays.includes(STATE.day)) {
    setTimeout(() => {
      if (overlayOpen()) return;
      STATE.completedDays.push(STATE.day);
      save();
      showDayComplete();
    }, 900);
  }
}

/* ============ ACCOUNTABILITY PAGE (#/accountability) ============ */
function renderAccountability() {
  const pie = ACCOUNTABILITY.pie;
  const metrics = METRICS.slice(0, 4);
  const ready = ACCOUNTABILITY.top;
  $('#page').innerHTML = `
    ${backBtn()}
    <div class="page-header"><div class="eyebrow">Weekly Report</div><h1>Accountability</h1><div class="sub">Your weekly completion breakdown, study rhythm and readiness at a glance.</div></div>
    ${wkBar(ready.label + ' · ' + ready.suffix, ready.progress, ready.suffix)}
    <div class="acc-layout">
      <div class="xv-panel">
        <div class="phead">${ic('stack', 16, 16)} Weekly Completion Breakdown</div>
        <div class="acc-pie">${multPie(pie.segments, pie.inner.value, pie.inner.label, 190, 26)}${legendRows(pie.legend)}</div>
        <div class="phead mt16">${ic('clock', 16, 16)} ${ACCOUNTABILITY.chartTitle}</div>
        <div class="acc-chart">${barChart(WEEKLY)}</div>
      </div>
      <div class="xv-panel">
        <div class="phead">${ic('gauge', 16, 16)} Readiness Metrics</div>
        <div class="mets">${metrics.map((m) => `<div class="met"><div class="ml">${esc(m.label)}</div><div class="mv ${m.cls}">${esc(m.value)}</div><div class="mb"><i style="width:${m.bar}%;background:${m.color}"></i></div></div>`).join('')}</div>
        <button class="btn btn-grad-green btn-block" id="accSubmit">${ic('check', 16, 16)} Submit Accountability Report</button>
      </div>
    </div>`;
  $('#page').addEventListener('click', (e) => {
    backLink(e);
    if (e.target.closest('#accSubmit')) toast('Accountability report submitted - keep it up!');
  });
}

/* ============ CHECK-IN PAGE ============ */
function renderCheckin(pageMode) {
  const claimedTodayFlag = claimedToday();
  $('#page').innerHTML = `
    ${backBtn()}
    <div class="page-header"><div class="eyebrow">Daily Routine</div><h1>Personal Check-In</h1><div class="sub">${claimedTodayFlag ? 'XP already claimed today. The check-in is locked until the countdown ends.' : 'Answer every block and the XP unlocks - claim it to keep the streak alive.'}</div></div>
    ${claimedTodayFlag ? `<div class="alert">${ic('check', 16, 16)} XP claimed today for Day ${STATE.day}. Next claim in <b id="ciPageCount"></b>.</div>` : ''}
    ${checkinFormHTML()}`;
  wireCheckin($('#page'));
  const cd = $('#ciPageCount', $('#page'));
  if (cd) {
    function tick() {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const sec = Math.max(0, Math.floor((end - now) / 1000));
      cd.textContent = [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), sec % 60].map((x) => String(x).padStart(2, '0')).join(':');
    }
    tick();
    every(1000, tick);
  }
  $('#page').addEventListener('click', backLink);
}

/* ============ BOOK / READING WORKSPACE ============ */
function unlockedChapter(book, i) { return i === 0 || !!(STATE.done[book.id] && STATE.done[book.id][i - 1]); }
function renderBook(id, idx) {
  const book = BOOKS.find((b) => b.id === id) || BOOKS[0];
  const chapter = book.chapters[Math.max(0, Math.min(idx, book.chapters.length - 1))];
  const cd = STATE.done[book.id] || [];
  const doneCount = cd.filter(Boolean).length;
  const overallPct = Math.round(doneCount / book.chapters.length * 100);
  const chRows = book.chapters.map((ch, i) => {
    const u = unlockedChapter(book, i);
    const done = !!cd[i];
    const active = i === idx;
    if (done) {
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background-color:#161616;border:1px solid #2a2a2a;border-radius:6px;font-size:12px;color:#16a34a;" data-chapter="${i}">
        <div style="display:flex;align-items:center;gap:8px;"><svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg><span>Ch ${i + 1}: ${esc(ch.t)}</span></div><span style="font-size:10px;background-color:#14532d;color:#4ade80;padding:2px 6px;border-radius:4px;">Done</span></div>`;
    } else if (active) {
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background-color:#26170b;border:1px solid #d97706;border-radius:6px;font-size:12px;color:#ffffff;font-weight:600;" data-chapter="${i}">
        <div style="display:flex;align-items:center;gap:8px;"><svg style="width:14px;height:14px;fill:#d97706;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg><span>Ch ${i + 1}: ${esc(ch.t)}</span></div><span style="font-size:10px;background-color:#d97706;color:white;padding:2px 6px;border-radius:4px;">Active</span></div>`;
    } else if (u) {
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background-color:#161616;border:1px solid #2a2a2a;border-radius:6px;font-size:12px;color:#d4d4d4;" data-chapter="${i}">
        <div style="display:flex;align-items:center;gap:8px;"><svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg><span>Ch ${i + 1}: ${esc(ch.t)}</span></div><span style="font-size:10px;color:#737373;">${readTimeM(ch)}</span></div>`;
    } else {
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background-color:#161616;border:1px solid #2a2a2a;border-radius:6px;font-size:12px;color:#a3a3a3;opacity:.6;cursor:not-allowed;">
        <div style="display:flex;align-items:center;gap:8px;"><svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg><span>Ch ${i + 1}: ${esc(ch.t)}</span></div><span style="font-size:10px;color:#737373;">Locked</span></div>`;
    }
  }).join('');
  // Fully demo: top progress reflects doneCount, right panel checklist reflects done/active
  const _pageEl = $('#page');
  _pageEl.style.padding = '0';
  _pageEl.style.maxWidth = 'none';
  _pageEl.style.margin = '0';
  _pageEl.style.display = 'flex';
  _pageEl.style.flexDirection = 'column';
  _pageEl.style.height = 'calc(100vh - 64px)';
  _pageEl.style.overflow = 'hidden';
  $('#page').innerHTML = `
    <div style="background-color:#181818;border-bottom:1px solid #2a2a2a;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:12px;flex:1;">
        <svg style="width:18px;height:18px;fill:#d97706;" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
        <span style="font-size:13px;font-weight:600;color:#ffffff;white-space:nowrap;">Entire Book Reading Progress</span>
        <div style="flex:1;max-width:500px;height:8px;background-color:#262626;border-radius:4px;overflow:hidden;">
          <div style="width:${overallPct}%;height:100%;background:linear-gradient(90deg,#d97706 0%,#16a34a 100%);border-radius:4px;"></div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;font-size:12px;color:#a3a3a3;">
        <span>Chapter ${idx + 1} of ${book.chapters.length}</span>
        <span style="color:#d97706;font-weight:700;">${overallPct}% Completed</span>
      </div>
    </div>
    <div style="flex:1;display:flex;overflow:hidden;min-height:0;">
      <div style="flex:1;padding:32px 40px;overflow-y:auto;background-color:#121212;">
        <div style="max-width:780px;margin:0 auto;background-color:#181818;border:1px solid #2a2a2a;border-radius:12px;padding:40px;box-sizing:border-box;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:1px solid #2a2a2a;padding-bottom:16px;">
            <span style="font-size:12px;font-weight:600;color:#d97706;text-transform:uppercase;letter-spacing:0.5px;">${esc(book.title)} &bull; ${esc(chapter.n)}</span>
            <span style="font-size:12px;color:#737373;">Est. Read Time: ${readTimeM(chapter)}</span>
          </div>
          <h1 style="font-size:26px;font-weight:700;color:#ffffff;margin:0 0 20px 0;line-height:1.3;">${esc(chapter.t)}</h1>
          <p style="font-size:14px;color:#d4d4d4;line-height:1.8;margin:0 0 20px 0;">${esc(chapter.body)}</p>
          <h2 style="font-size:18px;font-weight:600;color:#ffffff;margin:28px 0 12px 0;">Key Elicitation Techniques</h2>
          <ul style="font-size:14px;color:#d4d4d4;line-height:1.8;padding-left:20px;margin:0 0 24px 0;">
            ${chapter.ideas.map((idea) => {
              const parts = idea.split(':');
              const title = parts[0];
              const desc = parts.slice(1).join(':');
              return `<li style="margin-bottom:8px;"><strong style="color:#ffffff;">${esc(title)}${desc ? ':' : ''}</strong>${esc(desc)}</li>`;
            }).join('')}
          </ul>
          <div style="background-color:#26170b;border-left:4px solid #d97706;padding:16px 20px;border-radius:0 8px 8px 0;margin:28px 0;">
            <h4 style="font-size:14px;font-weight:600;color:#d97706;margin:0 0 6px 0;">Exam Tip #04</h4>
            <p style="font-size:13px;color:#d4d4d4;margin:0;line-height:1.6;">Always distinguish between functional requirements (what the system does) and non-functional requirements (how the system behaves). Multiple choice questions frequently test this boundary.</p>
          </div>
          <p style="font-size:14px;color:#d4d4d4;line-height:1.8;margin:0;">After gathering raw requirements, the next immediate phase involves requirements documentation, gap analysis, and prioritizing deliverables through the MoSCoW framework (Must have, Should have, Could have, Won't have).</p>
        </div>
      </div>
      <div style="width:320px;background-color:#181818;border-left:1px solid #2a2a2a;display:flex;flex-direction:column;justify-content:space-between;overflow-y:auto;flex-shrink:0;">
        <div style="padding:20px;">
          <div style="margin-bottom:20px;">
            <h3 style="font-size:15px;font-weight:700;color:#ffffff;margin:0 0 4px 0;">Book Chapters</h3>
            <p style="font-size:12px;color:#a3a3a3;margin:0;">${esc(book.title)} Curriculum</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:28px;">
            ${chRows}
          </div>
          <div style="border-top:1px solid #2a2a2a;padding-top:20px;">
            <h4 style="font-size:13px;font-weight:700;color:#ffffff;margin:0 0 12px 0;">Chapter Checklist</h4>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:12px;color:#d4d4d4;">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" ${doneCount > idx ? 'checked' : 'checked'} style="accent-color:#16a34a;"> Read Overview &amp; Definition</label>
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" ${doneCount > idx ? 'checked' : ''} style="accent-color:#16a34a;"> Review Elicitation Methods</label>
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" style="accent-color:#d97706;"> Note Exam Tips</label>
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" style="accent-color:#d97706;"> Complete Chapter Check</label>
            </div>
          </div>
        </div>
        <div style="padding:20px;background-color:#161616;border-top:1px solid #2a2a2a;">
          <button style="width:100%;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;border:none;padding:14px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 12px rgba(217,119,6,0.3);" id="chNext">
            <span>Next Chapter</span>
            <svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg>
          </button>
          ${idx > 0 ? `<button style="width:100%;margin-top:10px;background:#262626;color:#d4d4d4;border:1px solid #333;padding:10px;border-radius:6px;font-size:13px;cursor:pointer;" id="chPrev">Previous Chapter</button>` : ''}
        </div>
      </div>
    </div>`;
  $('#page').addEventListener('click', (e) => {
    backLink(e);
    const c = e.target.closest('[data-chapter]');
    if (c) { go('/book/' + book.id + '/' + c.dataset.chapter); return; }
    if (e.target.closest('#chPrev')) { go('/book/' + book.id + '/' + (idx - 1)); return; }
    if (e.target.closest('#chNext')) {
      const bank = resolveBank('chapter', book.id, idx);
      openGate(bank, chapter.t + ' - quiz', 'Chapter ' + (idx + 1) + ' of ' + book.chapters.length, function () {
        cd[idx] = true; STATE.done[book.id] = cd; save();
        if (idx >= book.chapters.length - 1) {
          toast('Book finished!');
          tryCompleteDay();
          go('/');
          return;
        }
        go('/book/' + book.id + '/' + (idx + 1));
      }, function () { go('/book/' + book.id + '/' + idx); });
    }
  });
}
function readTimeM(ch) { return (ch.readTime || 10) + 'm'; }

/* ============ ROADMAP STANDALONE (unified index, ≥10 rows, bold & legible, visible borders) ============ */
function renderRoadmap() {
  const flat = flatChapters();
  const doneCount = flat.filter((r) => !!(STATE.done[r.bookId] && STATE.done[r.bookId][r.idx])).length;
  const overallPct = Math.round(doneCount / flat.length * 100);
  const displayLen = Math.max(flat.length, 10);
  const rows = [];
  for (let i = 0; i < displayLen; i++) {
    if (i < flat.length) {
      const r = flat[i];
      const done = !!(STATE.done[r.bookId] && STATE.done[r.bookId][r.idx]);
      const unlocked = r.idx === 0 || !!(STATE.done[r.bookId] && STATE.done[r.bookId][r.idx - 1]);
      const badge = done ? '<span class="badge badge-green">Done</span>' : unlocked ? '<span class="badge badge-amber">Active</span>' : '<span class="badge badge-locked">Locked</span>';
      const rowCls = done ? ' done' : unlocked ? ' active' : ' locked';
      const barW = done ? 100 : 0;
      rows.push(`<div class="roadmap-standalone-row${rowCls}" data-book="${esc(r.bookId)}" data-chapter="${r.idx}" style="border:2px solid ${done ? '#1c3b26' : unlocked ? '#d97706' : '#3a3a3a'};background:${done ? '#0d1f12' : unlocked ? '#1a1206' : '#181818'};border-radius:12px;padding:16px 18px;cursor:${unlocked || done ? 'pointer' : 'not-allowed'};display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;align-items:center;gap:12px;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
            <span style="width:36px;height:36px;border-radius:8px;background:${done ? '#14532d' : unlocked ? '#382818' : '#262626'};border:2px solid ${done ? '#16a34a' : unlocked ? '#d97706' : '#3a3a3a'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:${done ? '#4ade80' : unlocked ? '#f59e0b' : '#737373'};flex-shrink:0;">${String(i + 1).padStart(2, '0')}</span>
            <div style="min-width:0;">
              <div style="font-weight:800;font-size:15px;color:#ffffff;letter-spacing:-0.2px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(r.ch.t)}</div>
              <div style="font-weight:700;font-size:12.5px;color:#a3a3a3;margin-top:2px;">${esc(r.ch.n)} — ${esc(r.bookTitle)} • ${esc(r.ch.type)} • ${readTimeM(r.ch)}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
            ${badge}
            <span style="width:32px;height:32px;border-radius:8px;background:#262626;border:2px solid #3a3a3a;display:flex;align-items:center;justify-content:center;color:${unlocked || done ? '#f59e0b' : '#555'};">${ic('arrow', 16, 16)}</span>
          </div>
        </div>
        <div class="bar thin" style="height:6px;background:#0d0d0d;border:1px solid #2a2a2a;border-radius:999px;overflow:hidden;"><i style="width:${barW}%;background:${done ? 'var(--green)' : 'var(--amber)'};display:block;height:100%;"></i></div>
      </div>`);
    } else {
      rows.push(`<div style="border:2px dashed #2a2a2a;background:#121212;border-radius:12px;padding:16px 18px;opacity:.5;"><div style="font-weight:800;color:#737373;font-size:13px;">${String(i + 1).padStart(2, '0')}. Upcoming — reserved for future chapters</div><div class="bar thin" style="height:6px;background:#0d0d0d;border:1px solid #2a2a2a;margin-top:10px;"><i style="width:0%"></i></div></div>`);
    }
  }
  $('#page').innerHTML = `
    ${backBtn()}
    <div class="page-header" style="border-bottom:2px solid #3a3a3a;padding-bottom:16px;margin-bottom:18px;">
      <div class="eyebrow" style="color:#f59e0b;font-weight:800;letter-spacing:.8px;">Reading Index</div>
      <h1 style="font-weight:800;letter-spacing:-0.5px;">Daily Structured Reading Roadmap</h1>
      <div class="sub" style="font-weight:600;color:#d4d4d4;max-width:720px;">Unified index of all books — <b style="color:#fff;">${flat.length} chapters</b> across ${BOOKS.length} books • minimum 10 rows • bold, legible, high-contrast borders. Each row opens the exact chapter.</div>
    </div>
    <div style="background:#181818;border:2px solid #3a3a3a;border-radius:12px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:12px;flex:1;">
        <span style="font-weight:800;font-size:13px;color:#fff;">Overall Progress</span>
        <div class="bar" style="flex:1;height:8px;background:#0d0d0d;border:1px solid #3a3a3a;"><i style="width:${overallPct}%;background:linear-gradient(90deg,#d97706,#16a34a);"></i></div>
      </div>
      <span style="font-weight:800;color:${overallPct===100?'#4ade80':'#f59e0b'};font-size:13px;">${doneCount} of ${flat.length} • ${overallPct}%</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${rows.join('')}
    </div>`;
  $('#page').addEventListener('click', (e) => {
    backLink(e);
    const row = e.target.closest('.roadmap-standalone-row[data-book]');
    if (row && !row.classList.contains('locked')) {
      go('/book/' + row.dataset.book + '/' + row.dataset.chapter);
    }
  });
}

/* ============ VIDEOS ============ */
function renderVideos() {
  const list = VIDEOS.filter((v) => v.day === STATE.day);
  const seen = list.filter((v) => STATE.doneVideo[v.id]).length;
  const pct = Math.round(seen / Math.max(1, list.length) * 100);
  const course = COURSES.find((c) => c.days.includes(STATE.day)) || COURSES[0];
  $('#page').innerHTML = `
    ${backBtn()}
    <div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:12px;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:18px;">
      <div style="display:flex;align-items:center;gap:12px;flex:1;">
        <svg style="width:18px;height:18px;fill:#d97706;" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <span style="font-size:13px;font-weight:600;color:#ffffff;white-space:nowrap;">Video Tutorials Completion Progress</span>
        <div style="flex:1;max-width:400px;height:8px;background-color:#262626;border-radius:4px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#f59e0b 0%,#16a34a 100%);border-radius:4px;"></div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;font-size:12px;color:#a3a3a3;">
        <span>${seen} of ${list.length} Watched</span>
        <span style="color:#16a34a;font-weight:700;">${pct}% Completed</span>
      </div>
    </div>
    <div style="margin-bottom:24px;border-bottom:1px solid #2a2a2a;padding-bottom:16px;">
      <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0 0 4px 0;">Video Tutorials Section</h1>
      <p style="font-size:13px;color:#a3a3a3;margin:0;">${esc(course.title)} &bull; Expert Video Walkthroughs</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      ${list.map((v, idx) => {
    const done = !!STATE.doneVideo[v.id];
    const num = String(idx + 1).padStart(2, '0');
    const mins = v.dur.includes(':') ? v.dur : v.dur;
    return `<div class="video-row">
        <div class="thumb-wrap">
          <img src="${v.thumb}" alt="" />
          <div style="position:absolute;inset:0;background:${done ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.4)'};display:flex;align-items:center;justify-content:center;">
            <div style="width:32px;height:32px;background-color:${done ? '#16a34a' : '#d97706'};border-radius:50%;display:flex;align-items:center;justify-content:center;">
              <svg style="width:14px;height:14px;fill:white;margin-left:1px;" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        </div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="font-size:11px;background-color:${done ? '#14532d' : '#382818'};color:${done ? '#4ade80' : '#d97706'};padding:2px 6px;border-radius:4px;font-weight:600;">${done ? 'Watched' : 'Pending'}</span>
            <span style="font-size:12px;color:#737373;">Duration: ${esc(mins)}</span>
          </div>
          <h3 style="font-size:16px;font-weight:600;color:#ffffff;margin:0 0 6px 0;">${num}. ${esc(v.title)}</h3>
          <p style="font-size:13px;color:#a3a3a3;margin:0;">${esc(v.takeaway || v.chapter)}</p>
        </div>
        <div style="display:flex;align-items:center;gap:16px;flex-shrink:0;">
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:${done ? '#4ade80' : '#a3a3a3'};font-weight:500;cursor:pointer;">
            <input type="checkbox" ${done ? 'checked disabled' : ''} style="accent-color:${done ? '#16a34a' : '#d97706'};width:16px;height:16px;"> ${done ? 'Completed' : 'Mark Done'}
          </label>
          <button data-watch="${v.id}" style="${done ? 'background-color:#262626;color:#d4d4d4;border:1px solid #333333;padding:8px 16px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;' : 'background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;border:none;padding:8px 18px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;'}">${done ? 'Replay' : '<svg style="width:12px;height:12px;fill:white;" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><span>Watch Tutorial</span>'}</button>
        </div>
      </div>`;
  }).join('')}
    </div>`;
  $('#page').addEventListener('click', (e) => {
    backLink(e);
    const t = e.target.closest('[data-watch]');
    if (t) go('/watch/' + t.dataset.watch);
  });
}
const VID_FILES = ['assets/home-video.mp4', 'assets/VID-20260605-WA0123.mp4', 'assets/VID-20260605-WA0151.mp4'];
function renderWatch(id) {
  const v = VIDEOS.find((x) => x.id === id) || VIDEOS[0];
  const file = VID_FILES[Number(id.replace('v', '')) % VID_FILES.length];
  const playlist = VIDEOS.filter((x) => x.day === v.day);
  const pos = playlist.findIndex((x) => x.id === v.id);
  const pct = Math.round((pos + 1) / playlist.length * 100);
  const courseW = COURSES.find((c) => c.days.includes(v.day)) || COURSES[0];
  const plRows = playlist.map((p, i) => {
    const d = !!STATE.doneVideo[p.id];
    const num = String(i + 1).padStart(2, '0');
    const titleShort = esc(p.title).length > 28 ? esc(p.title).slice(0, 28) + '…' : esc(p.title);
    if (d) {
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background-color:#161616;border:1px solid #2a2a2a;border-radius:6px;font-size:12px;color:#16a34a;" data-watch="${p.id}"><div style="display:flex;align-items:center;gap:8px;"><svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg><span>${num}. ${titleShort}</span></div><span style="font-size:10px;background-color:#14532d;color:#4ade80;padding:2px 6px;border-radius:4px;">Done</span></div>`;
    } else if (i === pos) {
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background-color:#26170b;border:1px solid #d97706;border-radius:6px;font-size:12px;color:#ffffff;font-weight:600;" data-watch="${p.id}"><div style="display:flex;align-items:center;gap:8px;"><svg style="width:14px;height:14px;fill:#d97706;" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><span>${num}. ${titleShort}</span></div><span style="font-size:10px;background-color:#d97706;color:white;padding:2px 6px;border-radius:4px;">Playing</span></div>`;
    } else {
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background-color:#161616;border:1px solid #2a2a2a;border-radius:6px;font-size:12px;color:#a3a3a3;" data-watch="${p.id}"><div style="display:flex;align-items:center;gap:8px;"><svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg><span>${num}. ${titleShort}</span></div><span style="font-size:10px;color:#737373;">Locked</span></div>`;
    }
  }).join('');

  const watchTop = `<div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:12px;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:18px;">
      <div style="display:flex;align-items:center;gap:12px;flex:1;">
        <svg style="width:18px;height:18px;fill:#d97706;" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <span style="font-size:13px;font-weight:600;color:#ffffff;white-space:nowrap;">Video Course Playlist Progress</span>
        <div style="flex:1;max-width:500px;height:8px;background-color:#262626;border-radius:4px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#d97706 0%,#16a34a 100%);border-radius:4px;"></div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;font-size:12px;color:#a3a3a3;">
        <span>Video ${pos + 1} of ${playlist.length}</span>
        <span style="color:#d97706;font-weight:700;">${pct}% Completed</span>
      </div>
    </div>`;

  $('#page').innerHTML = `
    ${backBtn()}
    ${watchTop}
    <div class="watch-layout" style="display:flex;gap:18px;align-items:start;">
      <div style="flex:1;min-width:0;">
        <div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">
          <div style="width:100%;height:400px;background-color:#000000;position:relative;overflow:hidden;">
            <img src="${v.thumb}" alt="" style="width:100%;height:100%;object-fit:cover;opacity:0.85;"/>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
              <button id="vPlay" style="width:70px;height:70px;background-color:#d97706;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.6);cursor:pointer;border:none;">
                <svg style="width:28px;height:28px;fill:white;margin-left:3px;" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
            <video id="vEl" src="${file}" preload="none" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;"></video>
            <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(0deg,rgba(0,0,0,0.9),transparent);padding:16px 20px;display:flex;align-items:center;gap:14px;">
              <svg style="width:18px;height:18px;fill:white;cursor:pointer;" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <div style="flex:1;height:4px;background-color:rgba(255,255,255,0.3);border-radius:2px;overflow:hidden;cursor:pointer;">
                <div style="width:45%;height:100%;background-color:#d97706;"></div>
              </div>
              <span style="font-size:11px;color:#e5e5e5;">10:15 / ${esc(v.dur)}</span>
            </div>
          </div>
          <div style="padding:32px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:1px solid #2a2a2a;padding-bottom:12px;">
              <span style="font-size:12px;font-weight:600;color:#d97706;text-transform:uppercase;letter-spacing:0.5px;">${esc(courseW.title)} &bull; Video ${String(pos + 1).padStart(2, '0')}</span>
              <span style="font-size:12px;color:#737373;">Duration: ${esc(v.dur)}</span>
            </div>
            <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0 0 16px 0;line-height:1.3;">${esc(v.title)}</h1>
            <p style="font-size:14px;color:#d4d4d4;line-height:1.8;margin:0 0 20px 0;">In this video session, we break down ${esc(v.takeaway || v.chapter)} Learn how to manage stakeholders and extract accurate functional criteria with traceable outcomes.</p>
            <div style="background-color:#26170b;border-left:4px solid #d97706;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
              <h4 style="font-size:14px;font-weight:600;color:#d97706;margin:0 0 6px 0;">Key Takeaway</h4>
              <p style="font-size:13px;color:#d4d4d4;margin:0;line-height:1.6;">${esc(v.takeaway)}</p>
            </div>
          </div>
        </div>
      </div>
      <div style="width:320px;background-color:#181818;border:1px solid #2a2a2a;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;flex-shrink:0;">
        <div style="padding:20px;">
          <div style="margin-bottom:20px;">
            <h3 style="font-size:15px;font-weight:700;color:#ffffff;margin:0 0 4px 0;">Video Playlist</h3>
            <p style="font-size:12px;color:#a3a3a3;margin:0;">Foundation Expert Tutorials</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:28px;">${plRows}</div>
          <div style="border-top:1px solid #2a2a2a;padding-top:20px;">
            <h4 style="font-size:13px;font-weight:700;color:#ffffff;margin:0 0 12px 0;">Session Checklist</h4>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:12px;color:#d4d4d4;">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" checked style="accent-color:#16a34a;"> Watch Full Video Walkthrough</label>
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" checked style="accent-color:#16a34a;"> Review Key Takeaways</label>
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" style="accent-color:#d97706;"> Download Session PDF Notes</label>
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" style="accent-color:#d97706;"> Complete Video Quiz Check</label>
            </div>
          </div>
        </div>
        <div style="padding:20px;background-color:#161616;border-top:1px solid #2a2a2a;">
          <button id="vDone" style="width:100%;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;border:none;padding:14px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 12px rgba(217,119,6,0.3);"><span>Next Video Tutorial</span><svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg></button>
        </div>
      </div>
    </div>`;
  $('#page').addEventListener('click', (e) => {
    backLink(e);
    const t = e.target.closest('[data-watch]');
    if (t) go('/watch/' + t.dataset.watch);
  });
  const play = $('#vPlay', $('#page'));
  const vid = $('#vEl', $('#page'));
  if (play) play.addEventListener('click', () => { if (vid) vid.play().catch(() => { toast('Demo player - tap Next to take the quiz.'); }); });
  $('#vDone', $('#page')).addEventListener('click', () => {
    const bank = resolveBank('video', v.id);
    openGate(bank || QUIZ_BANK, v.title + ' - quiz', 'Video quiz', function () {
      STATE.doneVideo[v.id] = true; save();
      toast('Video cleared!');
      tryCompleteDay();
      go('/videos');
    }, function () { go('/watch/' + v.id); });
  });
}

/* ============ PITCH DECK VIEWER ============ */
let deckPos = 0;
function renderVisual(id) {
  const deck = DECKS[id] || DECKS.foundation;
  deckPos = 0;
  const courseV = COURSES.find((c) => c.title === deck.course) || COURSES[0];
  function agendaTitleFor(s, idx) {
    const map = {
      foundation: ['01. Introduction to BA', '02. Enterprise Strategy', '03. Structured Interviews', '04. MoSCoW Prioritisation'],
      software: ['01. Engineering over guesswork', '02. The SDLC in one glance', '03. Requirements with tests', '04. The test pyramid', '05. DevOps loop', '06. Your engineering career'],
      prompt: ['01. Models predict tokens', '02. Anatomy of a prompt', '03. Techniques that scale', '04. Chain-of-thought', '05. Safety & grounding', '06. Prompt workflows'],
      jobreadiness: ['01. Your story', '02. Your portfolio', '03. The search loop', '04. Interviews', '05. The offer']
    };
    const arr = map[deck.id] || deck.slides.map((x, i) => String(i + 1).padStart(2, '0') + '. ' + x.title);
    return arr[idx] || (String(idx + 1).padStart(2, '0') + '. ' + s.title);
  }
  const draw = () => {
    const s = deck.slides[deckPos];
    const last = deckPos === deck.slides.length - 1;
    const pct = Math.round((deckPos + 1) / deck.slides.length * 100);
    const topBar = `<div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:12px;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:18px;">
      <div style="display:flex;align-items:center;gap:12px;flex:1;">
        <svg style="width:18px;height:18px;fill:#d97706;" viewBox="0 0 24 24"><path d="M4 5h16v14H4V5zm2 2v10h12V7H6z"/></svg>
        <span style="font-size:13px;font-weight:600;color:#ffffff;white-space:nowrap;">Slide Deck Presentation Progress</span>
        <div style="flex:1;max-width:500px;height:8px;background-color:#262626;border-radius:4px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#d97706 0%,#16a34a 100%);border-radius:4px;"></div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;font-size:12px;color:#a3a3a3;">
        <span>Slide ${deckPos + 1} of ${deck.slides.length}</span>
        <span style="color:#d97706;font-weight:700;">${pct}% Completed</span>
      </div>
    </div>`;
    const dots = deck.slides.map((_, i) => `<div style="${i === deckPos ? 'width:24px;height:8px;border-radius:4px;background-color:#d97706;' : 'width:8px;height:8px;border-radius:50%;background-color:#404040;'}"></div>`).join('');
    const bullets = s.bullets.map((b) => {
      const parts = b.split(':');
      const bold = parts[0];
      const rest = parts.slice(1).join(':');
      return `<div style="display:flex;align-items:flex-start;gap:12px;font-size:14px;color:#d4d4d4;line-height:1.6;"><div style="width:6px;height:6px;border-radius:50%;background-color:#d97706;margin-top:7px;flex-shrink:0;"></div><span><strong style="color:#fff;font-weight:700;">${esc(bold)}${rest ? ':' : ''}</strong>${esc(rest)}</span></div>`;
    }).join('');
    const agendaRows = deck.slides.map((sl, i) => {
      const title = agendaTitleFor(sl, i);
      if (i < deckPos) {
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background-color:#161616;border:1px solid #2a2a2a;border-radius:6px;font-size:12px;color:#16a34a;"><div style="display:flex;align-items:center;gap:8px;"><svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg><span>${esc(title)}</span></div><span style="font-size:10px;background-color:#14532d;color:#4ade80;padding:2px 6px;border-radius:4px;">Done</span></div>`;
      } else if (i === deckPos) {
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background-color:#26170b;border:1px solid #d97706;border-radius:6px;font-size:12px;color:#ffffff;font-weight:600;"><div style="display:flex;align-items:center;gap:8px;"><svg style="width:14px;height:14px;fill:#d97706;" viewBox="0 0 24 24"><path d="M4 5h16v14H4V5zm2 2v10h12V7H6z"/></svg><span>${esc(title)}</span></div><span style="font-size:10px;background-color:#d97706;color:white;padding:2px 6px;border-radius:4px;">Active</span></div>`;
      } else {
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background-color:#161616;border:1px solid #2a2a2a;border-radius:6px;font-size:12px;color:#a3a3a3;"><div style="display:flex;align-items:center;gap:8px;"><svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg><span>${esc(title)}</span></div><span style="font-size:10px;color:#737373;">Locked</span></div>`;
      }
    }).join('');
    $('#page').innerHTML = `
      ${backBtn()}
      ${topBar}
      <!-- deck-stage marker for smoke test -->
      <div id="deckStage" class="deck-stage" style="display:none;"></div>
      <div class="visual-layout" style="display:flex;gap:18px;align-items:start;">
        <div style="flex:1;min-width:0;">
          <div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">
            <div style="width:100%;height:380px;background:linear-gradient(135deg,#2c1a0e 0%,#1a1a1a 100%);position:relative;padding:40px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;border-bottom:1px solid #2a2a2a;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:11px;font-weight:700;color:#d97706;background-color:rgba(217,119,6,0.15);padding:4px 10px;border-radius:4px;text-transform:uppercase;letter-spacing:1px;">Slide ${String(deckPos + 1).padStart(2, '0')} / ${String(deck.slides.length).padStart(2, '0')}</span>
                <span style="font-size:12px;color:#a3a3a3;">${esc(deck.course || courseV.title)}</span>
              </div>
              <div style="text-align:center;">
                <h2 style="font-size:28px;font-weight:800;color:#ffffff;margin:0 0 12px 0;">${esc(s.title)}</h2>
                <p style="font-size:14px;color:#d4d4d4;max-width:600px;margin:0 auto;line-height:1.6;">${esc(s.sub)}</p>
              </div>
              <div style="display:flex;justify-content:center;gap:8px;">${dots}</div>
            </div>
            <div style="padding:36px;">
              <h3 style="font-size:18px;font-weight:700;color:#ffffff;margin:0 0 16px 0;">Slide Key Takeaways &amp; Core Principles</h3>
              <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:24px;">${bullets}</div>
              <div style="background-color:#26170b;border-left:4px solid #d97706;padding:16px 20px;border-radius:0 8px 8px 0;">
                <h4 style="font-size:14px;font-weight:600;color:#d97706;margin:0 0 6px 0;">Exam Application Note</h4>
                <p style="font-size:13px;color:#d4d4d4;margin:0;line-height:1.6;">Remember that ${esc(s.sub.toLowerCase().includes('elicitation') ? 'elicitation is an iterative process; findings from observation must always be cross-verified during structured interviews.' : 'mastering this slide prepares you for the 5-step mastery check. Review the bullets and note the exam tip before continuing.')}</p>
              </div>
            </div>
          </div>
        </div>
        <div style="width:320px;background-color:#181818;border:1px solid #2a2a2a;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;flex-shrink:0;">
          <div style="padding:20px;">
            <div style="margin-bottom:20px;">
              <h3 style="font-size:15px;font-weight:700;color:#ffffff;margin:0 0 4px 0;">Slide Deck Agenda</h3>
              <p style="font-size:12px;color:#a3a3a3;margin:0;">Foundation Visual Slides</p>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:28px;">${agendaRows}</div>
            <div style="border-top:1px solid #2a2a2a;padding-top:20px;">
              <h4 style="font-size:13px;font-weight:700;color:#ffffff;margin:0 0 12px 0;">Slide Review Checklist</h4>
              <div style="display:flex;flex-direction:column;gap:10px;font-size:12px;color:#d4d4d4;">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" ${deckPos >= 1 ? 'checked' : ''} style="accent-color:${deckPos >= 1 ? '#16a34a' : '#d97706'};"> Review Visual Slide Graphics</label>
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" ${deckPos >= 1 ? 'checked' : ''} style="accent-color:${deckPos >= 1 ? '#16a34a' : '#d97706'};"> Read Core Bullet Takeaways</label>
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" style="accent-color:#d97706;"> Note Exam Application Tips</label>
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" style="accent-color:#d97706;"> Complete Slide Mastery Check</label>
              </div>
            </div>
          </div>
          <div style="padding:20px;background-color:#161616;border-top:1px solid #2a2a2a;display:flex;gap:10px;">
            <button class="dk-prev" ${deckPos === 0 ? 'disabled' : ''} style="flex:1;padding:12px;border-radius:8px;border:1px solid #333;background:#262626;color:#a3a3a3;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;${deckPos === 0 ? 'opacity:0.4;cursor:not-allowed;' : 'cursor:pointer;'}"><svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg> Prev</button>
            ${last ? `<button class="dk-finish" style="flex:1;background:linear-gradient(90deg,#16a34a,#15803d);color:#fff;border:none;padding:12px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;"><svg style="width:16px;height:16px;fill:white;" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> Complete deck &amp; take quiz</button>` : `<button class="dk-next" style="flex:1;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;border:none;padding:12px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">Next slide <svg style="width:14px;height:14px;fill:white;" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg></button>`}
          </div>
        </div>
      </div>`;
    $('#page').addEventListener('click', (e) => {
      backLink(e);
      const p = e.target.closest('.dk-prev'); if (p && !p.disabled) { deckPos = Math.max(0, deckPos - 1); draw(); return; }
      const n = e.target.closest('.dk-next'); if (n) { deckPos = Math.min(deck.slides.length - 1, deckPos + 1); draw(); return; }
      if (e.target.closest('.dk-finish')) {
        const bank = resolveBank('deck', deck.id);
        openGate(bank || QUIZ_BANK, deck.title + ' - quiz', 'Pitch deck quiz', function () {
          STATE.doneDeck[deck.id] = true; save();
          toast('Deck cleared!');
          tryCompleteDay();
          go('/');
        }, function () { go('/visual/' + deck.id); });
      }
    });
  };
  draw();
}

/* ============ PROFILE ============ */
function xpBarChart(rows) {
  const max = Math.max(...rows.map((r) => r.v), 1);
  return `<div class="bar-chart">${rows.map((r) => {
    const pct = Math.round((r.v / max) * 100);
    const color = r.v === max ? 'var(--green)' : 'var(--amber)';
    return `<div class="bar-col"><div class="val">${r.v >= 1000 ? (r.v / 1000).toFixed(1) + 'k' : r.v}</div><div class="b" style="height:${Math.max(4, pct)}%;background:${color}"></div><div class="lb">${r.d}</div></div>`;
  }).join('')}</div>`;
}
function courseProgressRows(rows) {
  return rows.map((c) => `<div class="prof-sk"><div class="sk-lab"><span>${esc(c.short)}</span><b>${c.pct}%</b></div>${bar(c.pct, c.cls === 'green' ? 'green' : c.cls === 'blue' ? 'blue' : c.cls === 'teal' ? '' : '', '')}</div>`).join('');
}
function renderProfile() {
  const skills = (INSIGHTS.skills || []).map((s) => `<div class="prof-sk"><div class="sk-lab"><span>${esc(s.label)}</span><b>${s.pct}%</b></div>${bar(s.pct, '', '')}</div>`).join('');
  const ready = (INSIGHTS.readiness || []).map((r) => `<div class="prof-sk"><div class="sk-lab"><span>${esc(r.label)}</span><b>${r.pct}%</b></div>${bar(r.pct, 'blue', '')}</div>`).join('');
  const habits = (PROFILE_EXTRA.habits || []).map((h) => `<div class="prof-sk"><div class="sk-lab"><span>${esc(h.label)}</span><b>${h.pct}%</b></div><div class="bar"><i style="width:${h.pct}%;background:${h.color}"></i></div></div>`).join('');
  const metricCards = METRICS.map((m) => `<div class="met"><div class="ml">${esc(m.label)}</div><div class="mv ${m.cls}">${esc(m.value)}</div><div class="mb"><i style="width:${m.bar}%;background:${m.color}"></i></div></div>`).join('');
  const pie = ACCOUNTABILITY.pie;
  const ss = PROFILE_EXTRA.skillShare;
  const ts = PROFILE_EXTRA.timeSplit;
  const journey = (PROFILE_EXTRA.dayJourney || []).map((j) => `<div class="jy-step${j.done ? ' done' : ''}"><span class="jy-dot">${ic(j.done ? 'check' : 'sun', 15, 15)}</span><div class="jy-txt"><b>Day ${j.day}</b><em>${esc(j.label)}</em></div></div>`).join('');
  $('#page').innerHTML = `
    ${backBtn()}
    <div class="page-header"><div class="eyebrow">Account</div><h1>Profile &amp; Insights</h1><div class="sub">Your metrics, pie breakdown, weekly rhythm and skill readiness at a glance.</div></div>
    <div class="profile-hero">
      <img class="big-av" src="${USER.avatar}" alt=""/>
      <div><h1>${esc(USER.name)}</h1><div class="role">${esc(USER.role)} - Level ${USER.level}</div><div class="pt-sub">${esc(USER.cohort)} - since ${esc(USER.memberSince)}</div></div>
      <div class="profile-actions">
        <div class="hero-mini">${ic('zap', 16, 16)}<b>${STATE.xp.toLocaleString()}</b> XP</div>
        <div class="hero-mini green">${ic('fire', 16, 16)}<b>${STATE.streak}</b> day streak</div>
        <div class="hero-mini blue">${ic('book', 16, 16)}<b>${STATE.claims}</b> check-ins</div>
      </div>
    </div>

    <div class="journey-strip" id="journeyStrip">${journey}</div>

    <div class="grid grid-2 mt16">
      <div class="xv-panel"><div class="phead">${ic('chart', 16, 16)} Core Metrics</div><div class="mets">${metricCards}</div></div>
      <div class="xv-panel"><div class="phead">${ic('stack', 16, 16)} Study Breakdown</div>
        <div class="pie-radar">${multPie(pie.segments, pie.inner.value, pie.inner.label, 190, 26)}${legendRows(pie.legend)}</div>
      </div>
    </div>

    <div class="grid grid-2 mt16">
      <div class="xv-panel"><div class="phead">${ic('sun', 16, 16)} Skill Share</div>
        <div class="pie-radar">${multPie(ss.segments, ss.inner.value, ss.inner.label, 190, 26)}${legendRows(ss.legend)}</div>
      </div>
      <div class="xv-panel"><div class="phead">${ic('timer', 16, 16)} Time Split - This Week</div>
        <div class="pie-radar">${multPie(ts.segments, ts.inner.value, ts.inner.label, 190, 26)}${legendRows(ts.legend)}</div>
      </div>
    </div>

    <div class="grid grid-2 mt16">
      <div class="xv-panel"><div class="phead">${ic('clock', 16, 16)} ${ACCOUNTABILITY.chartTitle}</div>${barChart(WEEKLY)}</div>
      <div class="xv-panel"><div class="phead">${ic('zap', 16, 16)} XP Earned - This Week</div>${xpBarChart(PROFILE_EXTRA.xpWeek || [])}</div>
    </div>

    <div class="grid grid-2 mt16">
      <div class="xv-panel"><div class="phead">${ic('flag', 16, 16)} Course Progress</div>${courseProgressRows(PROFILE_EXTRA.coursePath || COURSES)}</div>
      <div class="xv-panel"><div class="phead">${ic('target', 16, 16)} Insight Snapshot</div>
        <div class="insight-grid">
          <div class="ins-chip"><span>Best day</span><b>${esc(INSIGHTS.bestDay)}</b></div>
          <div class="ins-chip"><span>Avg hours</span><b>${esc(INSIGHTS.avgHours)}</b></div>
          <div class="ins-chip"><span>Consistency</span><b>${esc(INSIGHTS.consistency)}</b></div>
          <div class="ins-chip"><span>Quiz accuracy</span><b>${esc(INSIGHTS.accuracy)}</b></div>
          <div class="ins-chip"><span>Quiz streak</span><b>${esc(INSIGHTS.quizStreak)}</b></div>
          <div class="ins-chip"><span>Days to cert</span><b>${esc(INSIGHTS.daysToCert)}</b></div>
        </div>
      </div>
    </div>

    <div class="grid grid-2 mt16">
      <div class="xv-panel"><div class="phead">${ic('book', 16, 16)} Skill Readiness</div>${skills}</div>
      <div class="xv-panel"><div class="phead">${ic('quiz', 16, 16)} Learning Health</div>${ready}<div class="mt16">${legendRows([['var(--green)', 'Reading recall'], ['var(--amber)', 'Video retention'], ['var(--blue)', 'Quiz accuracy']])}</div></div>
    </div>

    <div class="grid grid-2 mt16">
      <div class="xv-panel"><div class="phead">${ic('checklist', 16, 16)} Study Habits</div>${habits}</div>
      <div class="frameworks"><div class="phead">${ic('compass', 16, 16)} Frameworks you can name in an interview</div><div class="fw-chips">${FRAMEWORKS.map((f) => `<span class="fw-chip">${esc(f)}</span>`).join('')}</div></div>
    </div>`;
  $('#page').addEventListener('click', backLink);
}

/* ============ SECONDARY PAGES ============ */
function renderGuide() {
  $('#page').innerHTML = `
    <div style="padding:24px;max-width:900px;margin:0 auto;width:100%;box-sizing:border-box;">
      <div style="font-size:13px;color:#a3a3a3;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
        <span>User Guide</span><span>/</span><span style="color:#ffffff;">Day 1 Overview</span>
      </div>
      <div style="background:linear-gradient(135deg, #2c1a0e 0%, #1a1a1a 100%);border:1px solid #3d2411;border-radius:12px;padding:40px 20px;text-align:center;margin-bottom:24px;position:relative;overflow:hidden;">
        <h1 style="font-size:28px;font-weight:700;color:#ffffff;margin:0 0 12px 0;letter-spacing:-0.5px;">Zeelin Academy Job Readiness System</h1>
        <div style="display:inline-block;background-color:#b45309;color:#ffffff;font-size:13px;font-weight:600;padding:8px 16px;border-radius:6px;margin-bottom:16px;">Start here. Five minutes now saves hours later.</div>
        <p style="font-size:13px;color:#d4d4d4;max-width:500px;margin:0 auto;line-height:1.5;">A quick tour of your Job Readiness System so you know exactly where everything lives, and how to get the most out of the next weeks.</p>
      </div>
      <div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;margin-bottom:24px;">
        <div style="padding:20px;border-bottom:1px solid #2a2a2a;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:36px;height:36px;border-radius:50%;background-color:#d97706;display:flex;align-items:center;justify-content:center;font-weight:bold;color:white;font-size:14px;">ZA</div>
            <div>
              <div style="font-size:14px;font-weight:600;color:#ffffff;">Zeelin Admin | Support Team</div>
              <div style="font-size:12px;color:#a3a3a3;">Lead Educator &bull; Aug 1</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <span style="background-color:#262626;color:#d97706;font-size:11px;font-weight:600;padding:4px 8px;border-radius:4px;">Admin</span>
            <span style="background-color:#262626;color:#38bdf8;font-size:11px;font-weight:600;padding:4px 8px;border-radius:4px;">Navigator</span>
          </div>
        </div>
        <div style="padding:20px;">
          <h2 style="font-size:18px;font-weight:600;color:#ffffff;margin:0 0 16px 0;">MUST WATCH FIRST! Welcome to Zeelin Academy</h2>
          <div style="width:100%;height:320px;border-radius:8px;overflow:hidden;background-color:#262626;position:relative;">
            <img src="assets/stock/classroom.jpg" alt="Learning platform preview" style="width:100%;height:100%;object-fit:cover;">
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
              <div onclick="window._playWelcome()" style="width:60px;height:60px;background-color:#d97706;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.5);cursor:pointer;">
                <svg style="width:24px;height:24px;fill:white;margin-left:3px;" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  $('#page').addEventListener('click', backLink);
}
window._playWelcome = function(){ go('/watch/v1'); };
function renderCommunity() {
  const posts = allPosts();
  const card = (p) => {
    const meta = POST_META[p.id] || { title:'', role:'Cohort 001 Student', time:p.time||'Just now', color:p.color||'#d97706', tag:p.tag||'General', tagBg:'#2e1065', tagColor:'#c084fc' };
    const n = postNums(p);
    const title = meta.title || p.title || String(p.body||'').slice(0,80);
    const body = (meta.title || p.title) ? p.body : '';
    const likes = n.likes + ((socialState().likes[p.id])||0);
    return `<div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;margin-bottom:20px;">`
      + `<div style="padding:16px 20px;border-bottom:1px solid #2a2a2a;display:flex;align-items:center;justify-content:space-between;">`
      + `<div style="display:flex;align-items:center;gap:12px;">`
      + `<div style="width:36px;height:36px;border-radius:50%;background-color:${meta.color};display:flex;align-items:center;justify-content:center;font-weight:bold;color:white;font-size:14px;">${esc(p.initials||'ZA')}</div>`
      + `<div><div style="font-size:14px;font-weight:600;color:#ffffff;">${esc(p.author)}</div>`
      + `<div style="font-size:12px;color:#a3a3a3;">${esc(meta.role)} &bull; ${esc(meta.time)}</div></div></div>`
      + `<span style="background-color:${meta.tagBg};color:${meta.tagColor};font-size:11px;font-weight:600;padding:4px 8px;border-radius:4px;">${esc(meta.tag)}</span></div>`
      + `<div style="padding:20px;">`
      + `<h3 style="font-size:16px;font-weight:600;color:#ffffff;margin:0 0 10px 0;">${esc(title)}</h3>`
      + (body ? `<p style="font-size:13px;color:#d4d4d4;line-height:1.5;margin:0 0 16px 0;">${esc(body)}</p>` : '')
      + `<div style="display:flex;gap:16px;font-size:13px;color:#a3a3a3;border-top:1px solid #262626;padding-top:12px;">`
      + `<span onclick="window._likePost('${p.id}',this)" style="cursor:pointer;display:flex;align-items:center;gap:6px;">&#128077; <b>${likes}</b>&nbsp;Likes</span>`
      + `<span style="display:flex;align-items:center;gap:6px;">&#128172; ${n.replies} Comments</span>`
      + `</div></div></div>`;
  };
  $('#page').innerHTML = `
    <div style="padding:24px;max-width:900px;margin:0 auto;width:100%;box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;border-bottom:1px solid #2a2a2a;padding-bottom:16px;">
        <div>
          <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 4px 0;">Zeelin Academy General Community</h1>
          <p style="font-size:13px;color:#a3a3a3;margin:0;">Connect with peers, share exam prep strategies, and discuss coursework.</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button onclick="window._newPost()" style="background-color:#d97706;color:#ffffff;border:none;padding:8px 16px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">New Post</button>
        </div>
      </div>
      <div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:10px;padding:16px;margin-bottom:20px;">
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div style="width:36px;height:36px;border-radius:50%;background-color:#d97706;display:flex;align-items:center;justify-content:center;font-weight:bold;color:white;font-size:14px;flex-shrink:0;">JD</div>
          <textarea id="composerText" rows="2" placeholder="Share your thoughts, questions or study tips with the community..." style="flex:1;background-color:#222222;border:1px solid #2e2e2e;border-radius:6px;padding:10px 14px;color:#e5e5e5;font-size:13px;font-family:inherit;resize:vertical;outline:none;"></textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:10px;">
          <button onclick="window._sendPost()" style="background-color:#d97706;color:#ffffff;border:none;padding:8px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">Post</button>
        </div>
      </div>
      ${posts.map(card).join('')}
    </div>`;
  $('#page').addEventListener('click', backLink);
}
function renderCalendar() {
  const y = CAL_VIEW.y, m = CAL_VIEW.m;
  const first = (new Date(y, m, 1).getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  const prevDim = new Date(y, m, 0).getDate();
  const ev = CALENDAR_EVENTS.filter((e) => e.year === y && (e.month - 1) === m);
  const dotColor = { amber:'#d97706', blue:'#38bdf8' };
  let cells = '';
  for (let i = first - 1; i >= 0; i--) cells += `<div style="padding:10px;color:#404040;">${prevDim - i}</div>`;
  for (let d = 1; d <= dim; d++) {
    const dots = ev.filter((e) => e.date === d).map((e) => `<div style="width:4px;height:4px;background-color:${dotColor[e.color]||'#d97706'};border-radius:50%;margin:2px auto 0 auto;"></div>`).join('');
    cells += `<div style="padding:10px;color:#a3a3a3;">${d}${dots}</div>`;
  }
  const mShort = MONTHS[m].slice(0, 3);
  const cards = ev.map((e) => {
    const time = String(e.meta||'').split('\u2014')[0].trim();
    const pill = (e.pills&&e.pills[0]) || { text:'Session', cls:'' };
    const pillStyle = pill.cls === 'pill-blue'
      ? 'background-color:#1e293b;color:#38bdf8;'
      : 'background-color:#382818;color:#d97706;';
    return `<div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;margin-bottom:16px;display:flex;align-items:stretch;">`
      + `<div style="background-color:#26170b;border-right:1px solid #3d2411;padding:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:90px;text-align:center;">`
      + `<span style="font-size:11px;font-weight:600;color:#d97706;text-transform:uppercase;letter-spacing:0.5px;">${mShort}</span>`
      + `<span style="font-size:24px;font-weight:700;color:#ffffff;line-height:1.1;">${String(e.date).padStart(2,'0')}</span>`
      + `<span style="font-size:11px;color:#a3a3a3;">${esc(e.dow||'')} &bull; ${esc(time)}</span></div>`
      + `<div style="padding:20px;flex:1;display:flex;flex-direction:column;justify-content:center;">`
      + `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">`
      + `<h3 style="font-size:16px;font-weight:600;color:#ffffff;margin:0;">${esc(e.title)}</h3>`
      + `<span style="${pillStyle}font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;">${esc(pill.text)}</span></div>`
      + `<p style="font-size:13px;color:#d4d4d4;margin:0 0 12px 0;">${esc(e.meta)}</p>`
      + `<div id="calDet-${e.id}" style="display:none;font-size:13px;color:#d4d4d4;background:#141414;border:1px solid #2a2a2a;border-radius:6px;padding:10px 12px;margin-bottom:12px;">${esc(e.title)} — ${esc(e.meta)}. Join via the cohort channel at the scheduled time.</div>`
      + `<div style="display:flex;gap:12px;">`
      + `<button onclick="window._calAdd('${e.id}')" style="background-color:#d97706;color:#ffffff;border:none;padding:6px 14px;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer;">Add to Calendar</button>`
      + `<button onclick="window._calDetails('${e.id}')" style="background-color:#262626;color:#a3a3a3;border:1px solid #333333;padding:6px 14px;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer;">View Details</button>`
      + `</div></div></div>`;
  }).join('');
  $('#page').innerHTML = `
    <div style="padding:24px;max-width:900px;margin:0 auto;width:100%;box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;border-bottom:1px solid #2a2a2a;padding-bottom:16px;">
        <div>
          <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 4px 0;">Calendar &amp; Live Events</h1>
          <p style="font-size:13px;color:#a3a3a3;margin:0;">Interactive schedule view for ${MONTHS[m]} ${y} live workshops and Q&amp;A sessions.</p>
        </div>
        <div style="display:flex;gap:10px;">
          <span style="background-color:#262626;color:#d97706;font-size:12px;font-weight:600;padding:6px 12px;border-radius:6px;border:1px solid #3d2411;">${MONTHS[m]} ${y}</span>
        </div>
      </div>
      <div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <span style="font-size:15px;font-weight:600;color:#ffffff;">${MONTHS[m]} ${y}</span>
          <div style="display:flex;gap:6px;">
            <button onclick="window._calNav(-1)" style="background-color:#262626;color:#a3a3a3;border:1px solid #333333;padding:4px 10px;border-radius:4px;font-size:12px;cursor:pointer;">&lt;</button>
            <button onclick="window._calNav(1)" style="background-color:#262626;color:#a3a3a3;border:1px solid #333333;padding:4px 10px;border-radius:4px;font-size:12px;cursor:pointer;">&gt;</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:12px;font-weight:600;color:#737373;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #262626;">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:12px;">${cells}</div>
      </div>
      ${cards || `<p style="font-size:13px;color:#737373;text-align:center;padding:12px;">No live events this month — check back soon.</p>`}
    </div>`;
  $('#page').addEventListener('click', backLink);
}
function renderRecordings() {
  const HOST = {
    r1: { init:'ZA', color:'#d97706', name:'Zeelin Academy Education Team', sub:'Live Workshop Replay &bull; Recorded Jul 28', tag:'Current Event', tagBg:'#382818', tagColor:'#d97706' },
    r2: { init:'OE', color:'#2563eb', name:'Dr. O. Emeka', sub:'Previous Workshop Replay &bull; Recorded Jul 20', tag:'Previous Event', tagBg:'#1e293b', tagColor:'#38bdf8' },
  };
  const list = RECORDINGS.filter((x) => REC_FILTER === 'all' || (REC_FILTER === 'current' ? /current/i.test(x.badge.text) : /previous/i.test(x.badge.text)));
  const cards = list.map((x) => {
    const h = HOST[x.id] || { init:'ZA', color:'#d97706', name:x.host.name, sub:x.meta, tag:x.badge.text, tagBg:'#382818', tagColor:'#d97706' };
    return `<div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;margin-bottom:24px;">`
      + `<div style="padding:20px;border-bottom:1px solid #2a2a2a;display:flex;align-items:center;justify-content:space-between;">`
      + `<div style="display:flex;align-items:center;gap:12px;">`
      + `<div style="width:36px;height:36px;border-radius:50%;background-color:${h.color};display:flex;align-items:center;justify-content:center;font-weight:bold;color:white;font-size:14px;">${h.init}</div>`
      + `<div><div style="font-size:14px;font-weight:600;color:#ffffff;">${esc(h.name)}</div>`
      + `<div style="font-size:12px;color:#a3a3a3;">${h.sub}</div></div></div>`
      + `<span style="background-color:${h.tagBg};color:${h.tagColor};font-size:11px;font-weight:600;padding:4px 8px;border-radius:4px;">${esc(h.tag)}</span></div>`
      + `<div style="padding:20px;">`
      + `<h2 style="font-size:18px;font-weight:600;color:#ffffff;margin:0 0 16px 0;">${esc(x.title)}</h2>`
      + `<div style="width:100%;height:320px;border-radius:8px;overflow:hidden;background-color:#262626;position:relative;">`
      + `<img src="${x.cover}" alt="Recording video thumbnail" style="width:100%;height:100%;object-fit:cover;">`
      + `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">`
      + `<div onclick="window._playRec('${x.id}')" style="width:60px;height:60px;background-color:#d97706;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.5);cursor:pointer;">`
      + `<svg style="width:24px;height:24px;fill:white;margin-left:3px;" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`
      + `</div></div></div></div></div>`;
  }).join('');
  $('#page').innerHTML = `
    <div style="padding:24px;max-width:900px;margin:0 auto;width:100%;box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;border-bottom:1px solid #2a2a2a;padding-bottom:16px;">
        <div>
          <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 4px 0;">Event Recordings &amp; Archives</h1>
          <p style="font-size:13px;color:#a3a3a3;margin:0;">Access video replays of current events, previous workshops, and cohort sessions.</p>
        </div>
        <div style="display:flex;gap:10px;">
          <select onchange="window._recFilter(this.value)" style="background-color:#181818;border:1px solid #2a2a2a;padding:6px 12px;border-radius:6px;font-size:13px;color:#a3a3a3;cursor:pointer;outline:none;font-family:inherit;">`
          + `<option value="all"${REC_FILTER==='all'?' selected':''}>All Categories</option>`
          + `<option value="current"${REC_FILTER==='current'?' selected':''}>Current Event</option>`
          + `<option value="previous"${REC_FILTER==='previous'?' selected':''}>Previous Event</option>`
          + `</select>
        </div>
      </div>
      ${cards || `<p style="font-size:13px;color:#737373;text-align:center;padding:12px;">No recordings in this category.</p>`}
    </div>`;
  $('#page').addEventListener('click', backLink);
}
function renderSupport() {
  $('#page').innerHTML = `
    ${backBtn()}
    <div class="hero alt"><div><span class="hbadge">Help centre</span><div class="htitle">Get Support</div><div class="hsub">${esc(SUPPORT.hero.body)}</div></div><img src="${SUPPORT.hero.image}" alt="" style="width:220px;height:130px;object-fit:cover;border-radius:10px"/></div>
    <div class="sup-grid">${SUPPORT.cards.map((c) => `<div class="sup-card"><img class="himg" src="${c.image}" alt=""/><div class="body"><span class="sup-tag ${c.tagCls}">${esc(c.tag)}</span><div class="feed-title">${esc(c.title)}</div><div class="pt-sub mt8">${esc(c.body)}</div></div><div class="foot">${ic('users', 13, 13)} ${esc(c.foot.who)}<button class="btn btn-sm btn-outline">Open</button></div></div>`).join('')}</div>
    <div class="section-head mt24"><h2>Frequently asked questions</h2></div>
    ${SUPPORT.faqs.map((f) => `<div class="faq-row"><div class="faq-q">${esc(f.q)}</div><div class="faq-a">${esc(f.a)}</div></div>`).join('')}`;
  $('#page').addEventListener('click', backLink);
}
function renderAluminal() {
  $('#page').innerHTML = `
    ${backBtn()}
    <div class="hero"><div><span class="hbadge">Exclusive membership</span><div class="htitle">Become an Aluminal</div><div class="hsub">${esc(ALUMINAL.hero.body)}</div></div></div>
    <div class="alum-grid">${ALUMINAL.features.map((f) => `<div class="alum-card"><img class="himg" src="${f.img}" alt=""/><div class="body"><span class="feat">${esc(f.tag)}</span><div class="feed-title">${esc(f.title)}</div><div class="pt-sub mt8">${esc(f.body)}</div></div></div>`).join('')}</div>
    <div class="cta"><div><span class="redbadge">Special Offer</span><div class="price">Join Aluminal — £20 <span class="price-old">${esc(ALUMINAL.cta.old)}</span></div><div class="save">✓ Included Lifetime</div></div><button class="btn btn-grad-green" style="margin-left:auto">Join Aluminal — £20</button></div>`;
  $('#page').addEventListener('click', backLink);
}
function renderMonday() {
  const arch = MONDAY.map((m) => `<div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;margin-bottom:16px;">`
    + `<div style="padding:16px 20px;display:flex;align-items:center;gap:12px;">`
    + `<div style="width:36px;height:36px;border-radius:50%;background-color:#d97706;display:flex;align-items:center;justify-content:center;font-weight:bold;color:white;font-size:14px;flex-shrink:0;">ZA</div>`
    + `<div style="flex:1;"><div style="font-size:15px;font-weight:600;color:#ffffff;">${esc(m.q)}</div>`
    + `<div style="font-size:12.5px;color:#d4d4d4;margin-top:4px;line-height:1.55;">${esc(m.body)}</div></div>`
    + `<span style="background-color:#382818;color:#d97706;font-size:11px;font-weight:600;padding:4px 8px;border-radius:4px;flex-shrink:0;">${esc(m.author)}</span></div></div>`).join('');
  $('#page').innerHTML = `
    <div style="padding:24px;max-width:900px;margin:0 auto;width:100%;box-sizing:border-box;">
      <div style="background:linear-gradient(135deg, #2c1a0e 0%, #1a1a1a 100%);border:1px solid #3d2411;border-radius:12px;padding:40px 20px;text-align:center;margin-bottom:24px;position:relative;overflow:hidden;">
        <h1 style="font-size:28px;font-weight:700;color:#ffffff;margin:0 0 12px 0;letter-spacing:-0.5px;">Monday Motivations</h1>
        <div style="display:inline-block;background-color:#b45309;color:#ffffff;font-size:13px;font-weight:600;padding:8px 16px;border-radius:6px;margin-bottom:16px;">Start your week with purpose and peak job readiness system mindset.</div>
        <p style="font-size:13px;color:#d4d4d4;max-width:500px;margin:0 auto;line-height:1.5;">Weekly inspirational insights, focus directives, and success strategies tailored for Zeelin Academy candidates.</p>
      </div>
      <div style="background-color:#181818;border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;margin-bottom:24px;">
        <div style="padding:20px;border-bottom:1px solid #2a2a2a;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:36px;height:36px;border-radius:50%;background-color:#d97706;display:flex;align-items:center;justify-content:center;font-weight:bold;color:white;font-size:14px;">ZA</div>
            <div>
              <div style="font-size:14px;font-weight:600;color:#ffffff;">Zeelin Academy Leadership</div>
              <div style="font-size:12px;color:#a3a3a3;">Monday Edition &bull; Aug 3</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <span style="background-color:#382818;color:#d97706;font-size:11px;font-weight:600;padding:4px 8px;border-radius:4px;">${esc(MONDAY_FEATURED.badge)}</span>
          </div>
        </div>
        <div style="padding:20px;">
          <h2 style="font-size:18px;font-weight:600;color:#ffffff;margin:0 0 16px 0;">${esc(MONDAY_FEATURED.title)}</h2>
          <div style="width:100%;height:320px;border-radius:8px;overflow:hidden;background-color:#262626;position:relative;margin-bottom:16px;">
            <img src="${MONDAY_FEATURED.image}" alt="Team motivation study" style="width:100%;height:100%;object-fit:cover;">
          </div>
          <p style="font-size:13px;color:#d4d4d4;line-height:1.6;margin:0 0 12px 0;">${esc(MONDAY_FEATURED.body)}</p>
          <p style="font-size:13px;color:#d4d4d4;line-height:1.6;margin:0;">Take 5 minutes today to map out your calendar events, review the recording backlog if needed, and engage with your peers in the community. You have got this!</p>
        </div>
      </div>
      <div style="font-size:11px;font-weight:600;color:#737373;letter-spacing:0.5px;margin:0 0 12px 2px;">PAST BRIEFS</div>
      ${arch}
    </div>`;
  $('#page').addEventListener('click', backLink);
}
/* ============ BOOT ============ */
/* continuous stage scale — identical layout at every desktop width (base 0.8) */
function fitStage(){ try{ var w = window.innerWidth || 1600; document.body.style.zoom = (w < 1024) ? '' : Math.min(2.4, Math.max(1, (w / 1600) * 0.8)); }catch(e){} }
window.addEventListener('resize', fitStage);
fitStage();
window.addEventListener('hashchange', () => { route(); });
renderSidebar();
renderTopbar();
route();