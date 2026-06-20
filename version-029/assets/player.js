import { H as Hls } from './hls-vendor-dru42stk.js';

export function initMoviePlayer(videoId, source) {
  const video = document.getElementById(videoId);
  const overlay = document.querySelector(`[data-player-target="${videoId}"]`);

  if (!video || !source) {
    return;
  }

  let attached = false;

  function attach() {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = source;
    }

    attached = true;
  }

  async function play() {
    attach();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    video.controls = true;

    try {
      await video.play();
    } catch (error) {
      video.controls = true;
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!attached || video.paused) {
      play();
    }
  });
}
