(function () {
    function initMoviePlayer(source, videoId, triggerId) {
        const video = document.getElementById(videoId);
        const trigger = document.getElementById(triggerId);
        let prepared = false;
        let hls = null;

        if (!video || !trigger || !source) {
            return;
        }

        function playVideo() {
            const request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {});
            }
        }

        function prepare() {
            if (prepared) {
                playVideo();
                return;
            }
            prepared = true;
            trigger.classList.add('is-hidden');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal && hls) {
                        hls.destroy();
                        hls = null;
                        video.src = source;
                    }
                });
                return;
            }
            video.src = source;
            playVideo();
        }

        trigger.addEventListener('click', prepare);
        video.addEventListener('click', function () {
            if (!prepared) {
                prepare();
                return;
            }
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
