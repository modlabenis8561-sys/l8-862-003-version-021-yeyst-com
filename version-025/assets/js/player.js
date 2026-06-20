import { H as Hls } from './hls-dru42stk.js';

function setupPlayer(player) {
  const video = player.querySelector('video[data-src]');
  const playButton = player.querySelector('[data-player-play]');
  const status = player.querySelector('[data-player-status]');
  let hasLoaded = false;
  let hls = null;

  if (!video) {
    return;
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message || '';
    }
  }

  function loadSource() {
    const sourceUrl = video.dataset.src;

    if (hasLoaded || !sourceUrl) {
      return;
    }

    hasLoaded = true;
    setStatus('正在加载播放源…');

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源加载完成');
      });

      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('网络加载异常，正在尝试恢复…');
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('媒体解码异常，正在尝试恢复…');
          hls.recoverMediaError();
          return;
        }

        setStatus('视频加载失败，请稍后再试。');
        hls.destroy();
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      video.addEventListener('loadedmetadata', function () {
        setStatus('播放源加载完成');
      }, { once: true });
      return;
    }

    setStatus('当前浏览器不支持 HLS 播放。');
  }

  function startPlayback() {
    loadSource();

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setStatus('浏览器阻止了自动播放，请再次点击播放器。');
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', function () {
      playButton.classList.add('is-hidden');
      startPlayback();
    });
  }

  video.addEventListener('play', function () {
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (playButton && video.currentTime === 0) {
      playButton.classList.remove('is-hidden');
    }
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
