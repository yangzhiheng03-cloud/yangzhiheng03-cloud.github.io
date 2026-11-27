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
