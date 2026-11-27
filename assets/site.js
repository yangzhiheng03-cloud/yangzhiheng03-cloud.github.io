// The root previously served Chinese HTML and can outlive this script in a browser cache.
if (['/', '/index.html'].includes(location.pathname) && document.documentElement.lang === 'zh-CN') {
  const englishHome = new URL(location.href);
  if (englishHome.searchParams.get('lang') !== 'en') {
    englishHome.searchParams.set('lang', 'en');
    location.replace(englishHome.href);
  }
}

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
const cover = document.querySelector('.hero-visual');
if (cover) {
  const english = document.documentElement.lang === 'en';
  const picture = cover.querySelector('img');
  const caption = cover.querySelector('figcaption');
  const link = document.createElement('a');
  picture.replaceWith(link);
  link.append(picture);
  const project = document.querySelector('.project-feature .image-link');
  const slides = [[picture.src, picture.alt, ...Array.from(caption.children, el => el.textContent), project.href]];
  const cards = [...document.querySelectorAll('.prototype-list article, .study-preview')];
  const month = card => card.querySelector('time')?.dateTime || '';
  cards.sort((a, b) => month(b).localeCompare(month(a)));
  cards.forEach(card => {
    const image = card.querySelector('img');
    const title = card.querySelector('.game-tag') || card.querySelector('h3');
    slides.push([image.src, image.alt, title.textContent,
      card.querySelector('.study-label').textContent, card.querySelector('a').href]);
  });
  let index = 0;
  function show() {
    const [src, alt, title, category, href] = slides[index];
    picture.src = src;
    picture.alt = alt;
    link.href = href;
    caption.children[0].textContent = title;
    caption.children[1].textContent = category;
  }
  const controls = document.createElement('div');
  controls.className = 'cover-controls';
  cover.append(controls);
  let timer;
  function advance(step) {
    index = (index + step + slides.length) % slides.length;
    show();
  }
  function button(label, action) {
    const el = document.createElement('button');
    el.type = 'button';
    el.textContent = label;
    el.onclick = action;
    controls.append(el);
    return el;
  }
  button(english ? 'Previous' : '上一张', () => { play(false); advance(-1); });
  const toggle = button('', () => play(!timer));
  button(english ? 'Next' : '下一张', () => { play(false); advance(1); });
  function play(on) {
    clearInterval(timer);
    timer = on ? setInterval(() => advance(1), 6500) : null;
    toggle.textContent = on ? (english ? 'Pause' : '暂停') : (english ? 'Play' : '播放');
  }
  show();
  play(!matchMedia('(prefers-reduced-motion: reduce)').matches);
}
const category = document.querySelector('#category');
if (category) {
  document.querySelector('#category-control').hidden = false;
  function filterProjects() {
    for (const project of document.querySelectorAll('[data-category]')) {
      project.hidden = category.value !== '' && project.dataset.category !== category.value;
    }
  }
  category.addEventListener('change', filterProjects);
  filterProjects();
}

const boardView = document.querySelector('#board-view');
if (boardView) {
  const portfolio = boardView.closest('.basinhold');
  const useReadingView = () => { portfolio.dataset.view = boardView.value; };
  boardView.value = matchMedia('(max-width: 740px)').matches ? 'reader' : 'layout';
  useReadingView();
  boardView.addEventListener('change', useReadingView);
  portfolio.querySelector('.board-contents').addEventListener('click', event => {
    if (event.target.closest('a')) event.currentTarget.open = false;
  });
}
