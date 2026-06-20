(() => {
    const video = document.getElementById('moviePlayer');
    const button = document.getElementById('moviePlayButton');
    const status = document.getElementById('playerStatus');

    if (!video) {
        return;
    }

    const source = video.querySelector('source');
    const stream = source ? source.getAttribute('src') : '';

    const showStatus = (message) => {
        if (!status) {
            return;
        }

        status.hidden = !message;
        status.textContent = message || '';
    };

    const attachStream = () => {
        if (!stream) {
            showStatus('视频加载失败，请稍后重试');
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, (_event, data) => {
                if (data && data.fatal) {
                    showStatus('视频加载失败，请稍后重试');
                }
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }

        showStatus('视频加载失败，请稍后重试');
    };

    const playVideo = async () => {
        try {
            await video.play();
            if (button) {
                button.classList.add('hidden');
            }
            showStatus('');
        } catch (_error) {
            showStatus('点击播放器开始播放');
        }
    };

    attachStream();

    if (button) {
        button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', () => {
        if (button) {
            button.classList.add('hidden');
        }
    });

    video.addEventListener('pause', () => {
        if (button && video.currentTime === 0) {
            button.classList.remove('hidden');
        }
    });

    video.addEventListener('error', () => {
        showStatus('视频加载失败，请稍后重试');
    });
})();
