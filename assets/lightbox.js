(() => {
  const dialog = document.querySelector('dialog.lightbox');
  const stage = dialog.querySelector('.light-stage');
  const image = stage.querySelector('img');
  const surface = stage.querySelector('.image-surface');
  const close = dialog.querySelector('[data-close]');
  const english = document.documentElement.lang === 'en';
  const selector = surface ? 'main a[href]:has(> img)' : '.zoom,.board-zoom,.study-figure a';
  let opener;

  function display(link) {
    const thumbnail = link.querySelector('img');
    image.src = link.href;
    image.alt = thumbnail.alt;
    stage.classList.remove('expanded');
    stage.scrollTo(0, 0);
    if (surface) {
      const width = thumbnail.naturalWidth || thumbnail.width;
      const height = thumbnail.naturalHeight || thumbnail.height;
      surface.style.setProperty('--image-ratio', width / height);
      surface.style.setProperty('--fit-limit', width * 2 + 'px');
      surface.style.removeProperty('width');
      updateZoomLabel(false);
    }
  }

  function updateZoomLabel(expanded) {
    const action = expanded ? (english ? 'Zoom out' : '缩小图片') : (english ? 'Zoom in' : '放大图片');
    surface.setAttribute('aria-label', action + ' · ' + image.alt);
  }

  let showGallery;
  if (surface) {
    surface.addEventListener('click', event => {
      const before = image.getBoundingClientRect();
      const expanded = stage.classList.toggle('expanded');
      if (expanded) {
        const x = event.detail ? event.clientX : before.left + before.width / 2;
        const y = event.detail ? event.clientY : before.top + before.height / 2;
        surface.style.width = Math.max(image.naturalWidth, before.width * 2) + 'px';
        const after = image.getBoundingClientRect();
        stage.scrollBy(after.left + (x - before.left) * after.width / before.width - x,
                       after.top + (y - before.top) * after.height / before.height - y);
      } else {
        surface.style.removeProperty('width');
        stage.scrollTo(0, 0);
      }
      updateZoomLabel(expanded);
    });
  } else {
    const zoom = dialog.querySelector('[data-zoom-toggle]');
    let links = [];
    let index = 0;
    function galleryZoom(expanded) {
      stage.classList.toggle('expanded', expanded);
      zoom.textContent = expanded ? (english ? 'Fit to screen' : '适应屏幕') : (english ? 'Actual size' : '原始大小');
      stage.scrollTo(0, 0);
    }
    function step(offset) {
      index = (index + offset + links.length) % links.length;
      const link = links[index];
      display(link);
      dialog.querySelector('#light-caption').textContent = link.closest('figure')?.querySelector('figcaption')?.textContent || image.alt;
      dialog.querySelector('[data-light-index]').textContent = (index + 1) + ' / ' + links.length;
      galleryZoom(false);
    }
    showGallery = link => {
      links = [...document.querySelectorAll(selector)].filter(a => a.getClientRects().length && a.querySelector('img'));
      index = links.indexOf(link);
      step(0);
    };
    dialog.querySelector('[data-light-prev]').addEventListener('click', () => step(-1));
    dialog.querySelector('[data-light-next]').addEventListener('click', () => step(1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        step(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    [zoom,image].forEach(el => el.addEventListener('click', () => galleryZoom(!stage.classList.contains('expanded'))));
  }

  document.addEventListener('click', event => {
    const link = event.target.closest(selector);
    if (!link?.querySelector('img') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !dialog.showModal) return;
    event.preventDefault();
    opener = link;
    if (surface) display(link);
    else showGallery(link);
    dialog.showModal();
    close.focus();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog || (surface && event.target === stage)) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus({preventScroll:true}));
})();
