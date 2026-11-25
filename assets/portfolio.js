const chinese = document.documentElement.lang === 'zh-CN';
const localize = (en, zh) => chinese ? zh : en;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const small = matchMedia('(max-width: 700px)');
const themeButton = document.querySelector('[data-theme-toggle]');

function theme(dark) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
}
let savedTheme;
try { savedTheme = localStorage.getItem('portfolio-theme'); } catch {}
theme(savedTheme === 'dark');
themeButton.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  theme(dark);
  try { localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light'); } catch {}
});

const gallery = document.querySelector('.gallery');
if (gallery) {
  const frames = [...gallery.querySelectorAll('[data-frame]')];
  const counter = gallery.querySelector('.frame-count');
  const label = gallery.querySelector('.gallery-label');
  const play = gallery.querySelector('[data-play]');
  let active = 0;
  let timer;
  let running = !reduced.matches;
  let hovering = false;
  let explicitPlay = false;
  function advance(step) {
    frames[active].hidden = true;
    active = (active + step + frames.length) % frames.length;
    frames[active].hidden = false;
    counter.textContent = String(active + 1).padStart(2, '0') + ' / ' + String(frames.length).padStart(2, '0');
    label.textContent = frames[active].dataset.caption;
  }
  function sync() {
    clearInterval(timer);
    if (running && !document.hidden && (explicitPlay || (!hovering && !gallery.contains(document.activeElement)))) {
      timer = setInterval(() => advance(1), 6500);
    }
    const action = running ? localize('Pause slideshow', '暂停轮播') : localize('Play slideshow', '播放轮播');
    play.textContent = running ? 'Ⅱ' : '▸';
    play.setAttribute('aria-label', action);
    play.title = action;
  }
  gallery.querySelectorAll('[data-slide]').forEach(button => button.addEventListener('click', () => {
    running = false;
    advance(Number(button.dataset.slide));
    sync();
  }));
  play.addEventListener('click', () => { running = !running; explicitPlay = running; sync(); });
  gallery.addEventListener('mouseenter', () => { hovering = true; sync(); });
  gallery.addEventListener('mouseleave', () => { hovering = false; sync(); });
  gallery.addEventListener('focusin', sync);
  gallery.addEventListener('focusout', () => setTimeout(sync));
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { if (reduced.matches) { running = false; sync(); } });
  sync();
}

const basin = document.querySelector('.basin');
const category = document.querySelector('#category');
if (category) {
  category.value = new URL(location.href).searchParams.get('category') || '';
  if (category.selectedIndex < 0) category.selectedIndex = 0;
  document.querySelectorAll('.archive-list article').forEach(entry => {
    entry.hidden = Boolean(category.value) && entry.dataset.category !== category.value;
  });
  if (category.value) document.querySelectorAll('[data-language]').forEach(a => {
    const next = new URL(a.href);
    next.searchParams.set('category', category.value);
    a.href = next.href;
  });
  document.querySelector('#category-control').hidden = false;
  category.addEventListener('change', () => {
    const next = new URL(location.href);
    if (category.value) next.searchParams.set('category', category.value);
    else next.searchParams.delete('category');
    location.assign(next);
  });
}
const modes = [...document.querySelectorAll('[data-view]')];
function setView(mode) {
  if (!basin) return;
  basin.dataset.mode = mode;
  modes.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === mode)));
}
if (basin) {
  const mode = new URL(location.href).searchParams.get('view');
  setView(['reader','layout'].includes(mode) ? mode : small.matches || chinese ? 'reader' : 'layout');
  modes.forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
}
const toc = document.querySelector('.contents');
if (toc) {
  toc.open = !small.matches;
  small.addEventListener('change', () => { toc.open = !small.matches; });
  toc.addEventListener('click', event => {
    if (small.matches && event.target.closest('a')) toc.open = false;
  });
}
const chapters = [...document.querySelectorAll('.board-page,.article-section')];
let currentChapter;
function updateChapter() {
  const offset = document.querySelector('.bar').getBoundingClientRect().height + 55;
  currentChapter = chapters.filter(chapter => chapter.getBoundingClientRect().top <= offset).at(-1);
  document.querySelectorAll('.contents a').forEach(a => {
    if (currentChapter && a.hash === '#' + currentChapter.id) a.setAttribute('aria-current','location');
    else a.removeAttribute('aria-current');
  });
}
if (chapters.length) {
  let pending = false;
  addEventListener('scroll', () => {
    if (!pending) requestAnimationFrame(() => { pending = false; updateChapter(); });
    pending = true;
  }, {passive:true});
  updateChapter();
}
function revealHash() {
  const target = document.getElementById(location.hash.slice(1));
  if (!target) return;
  let parent = target.parentElement;
  while (parent) {
    if (parent.tagName === 'DETAILS') parent.open = true;
    parent = parent.parentElement;
  }
  target.scrollIntoView();
}
window.addEventListener('hashchange', revealHash);
if (location.hash) window.addEventListener('load', revealHash, {once:true});
document.querySelectorAll('[data-language]').forEach(a => a.addEventListener('click', () => {
  const url = new URL(a.href);
  if (basin) url.searchParams.set('view', basin.dataset.mode);
  const offset = document.querySelector('.bar').getBoundingClientRect().height + 65;
  const inReading = chapters.length && chapters[0].getBoundingClientRect().top <= offset;
  let target;
  if (inReading) {
    const nodes = [...document.querySelectorAll('.node')].filter(n => n.getClientRects().length && n.getBoundingClientRect().top <= offset);
    const node = nodes.at(-1);
    target = node && currentChapter?.contains(node) ? node : currentChapter;
  } else if (!chapters.length) {
    target = [...document.querySelectorAll('#work,#selected-work,#studies,#about')].filter(n => n.getBoundingClientRect().top <= offset).at(-1);
  }
  const explicit = document.getElementById(location.hash.slice(1));
  if (explicit) {
    const top = explicit.getBoundingClientRect().top;
    if (top >= 0 && top < innerHeight) target = explicit;
  }
  url.hash = target ? target.id : '';
  a.href = url.href;
}));

const dialog = document.querySelector('.lightbox');
const lightImage = dialog.querySelector('img');
const stage = dialog.querySelector('.light-stage');
const zoom = dialog.querySelector('[data-zoom-toggle]');
let images = [];
let at = 0;
let returnFocus;
function expand(value) {
  stage.classList.toggle('expanded',value);
  zoom.textContent = value ? localize('Fit to screen','适应屏幕') : localize('Actual size','原始大小');
  stage.scrollTo(0,0);
}
function showImage(step) {
  at = (at + step + images.length) % images.length;
  const origin = images[at];
  lightImage.src = origin.href;
  lightImage.alt = origin.querySelector('img').alt;
  dialog.querySelector('#light-caption').textContent = origin.closest('figure')?.querySelector('figcaption')?.textContent || lightImage.alt;
  dialog.querySelector('[data-light-index]').textContent = (at+1) + ' / ' + images.length;
  expand(false);
}
const imageSelector = '.zoom,.board-zoom,.study-figure a';
document.addEventListener('click', event => {
  const origin = event.target.closest(imageSelector);
  if (!origin || !origin.querySelector('img') || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (!dialog.showModal) return;
  event.preventDefault();
  images = [...document.querySelectorAll(imageSelector)].filter(a => a.getClientRects().length && a.querySelector('img'));
  at = images.indexOf(origin);
  returnFocus = origin;
  showImage(0);
  dialog.showModal();
  dialog.querySelector('[data-close]').focus();
});
dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => returnFocus?.focus({preventScroll:true}));
for (const [selector,step] of [['[data-light-prev]',-1],['[data-light-next]',1]]) {
  dialog.querySelector(selector).addEventListener('click', () => showImage(step));
}
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showImage(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
zoom.addEventListener('click', () => expand(!stage.classList.contains('expanded')));
lightImage.addEventListener('click', () => expand(!stage.classList.contains('expanded')));
