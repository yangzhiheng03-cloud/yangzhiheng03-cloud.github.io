const themeButton = document.querySelector('[data-theme-toggle]');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton?.setAttribute('aria-pressed', String(theme === 'dark'));
}
let savedTheme;
try { savedTheme = localStorage.getItem('portfolio-theme'); } catch {}
setTheme(['light', 'dark'].includes(savedTheme) ? savedTheme : systemDark.matches ? 'dark' : 'light');
themeButton?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  try { localStorage.setItem('portfolio-theme', next); } catch {}
});
systemDark.addEventListener('change', event => {
  let preference;
  try { preference = localStorage.getItem('portfolio-theme'); } catch {}
  if (!preference) setTheme(event.matches ? 'dark' : 'light');
});
document.querySelectorAll('[data-language]').forEach(link => {
  link.addEventListener('click', () => { link.hash = location.hash; });
});
const videoButton = document.querySelector('[data-video]');
videoButton?.addEventListener('click', () => {
  const frame = document.createElement('iframe');
  frame.src = 'https://player.bilibili.com/player.html?bvid=BV14d3xzcEDc&autoplay=0';
  frame.title = videoButton.dataset.video;
  frame.allow = 'fullscreen; picture-in-picture';
  frame.allowFullscreen = true;
  videoButton.replaceWith(frame);
  frame.focus();
});
