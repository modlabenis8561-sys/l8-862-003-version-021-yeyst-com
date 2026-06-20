(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.getElementById("movie-video");
        var cover = document.getElementById("player-cover");
        var button = document.getElementById("play-button");
        var hlsInstance = null;

        if (!video || !window.playConfig || !window.playConfig.stream) {
            return;
        }

        function attachStream() {
            var stream = window.playConfig.stream;
            if (video.getAttribute("data-ready") === "true") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
            video.setAttribute("data-ready", "true");
        }

        function startPlayer(event) {
            if (event) {
                event.preventDefault();
            }
            attachStream();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", startPlayer);
        }
        if (button) {
            button.addEventListener("click", startPlayer);
        }
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
