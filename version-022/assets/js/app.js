(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('is-active', i === current);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                play();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                play();
            });
        }
        show(0);
        play();
    }

    function setupFilters() {
        var scopes = document.querySelectorAll('[data-filter-scope]');
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var year = scope.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.filter-card'));
            var empty = scope.querySelector('[data-filter-empty]');

            function apply() {
                var q = input ? input.value.trim().toLowerCase() : '';
                var y = year ? year.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-year')
                    ].join(' ').toLowerCase();
                    var matchText = !q || text.indexOf(q) !== -1;
                    var matchYear = !y || card.getAttribute('data-year') === y;
                    var ok = matchText && matchYear;
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (year) {
                year.addEventListener('change', apply);
            }
            apply();
        });
    }

    function setupSearchPage() {
        var page = document.querySelector('[data-search-page]');
        if (!page || !window.SITE_SEARCH_DATA) {
            return;
        }
        var form = page.querySelector('[data-search-form]');
        var input = page.querySelector('[data-search-input]');
        var results = page.querySelector('[data-search-results]');
        var empty = page.querySelector('[data-search-empty]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function card(item) {
            var tags = item.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<article class="movie-card movie-card-small">' +
                '<a href="' + escapeHtml(item.url) + '" class="movie-card-link">' +
                '<div class="movie-poster"><img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="movie-year">' + escapeHtml(item.year) + '</span></div>' +
                '<div class="movie-card-content"><h3>' + escapeHtml(item.title) + '</h3>' +
                '<p class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>' +
                '<p class="movie-one-line">' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="tag-row">' + tags + '</div></div></a></article>';
        }

        function render() {
            var q = input.value.trim().toLowerCase();
            var list = window.SITE_SEARCH_DATA.filter(function (item) {
                if (!q) {
                    return item.hot;
                }
                return item.search.indexOf(q) !== -1;
            }).slice(0, 96);
            results.innerHTML = list.map(card).join('');
            empty.hidden = list.length !== 0;
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, function (ch) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[ch];
            });
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var url = new URL(window.location.href);
            if (input.value.trim()) {
                url.searchParams.set('q', input.value.trim());
            } else {
                url.searchParams.delete('q');
            }
            history.replaceState(null, '', url.toString());
            render();
        });
        input.addEventListener('input', render);
        render();
    }

    function setupPlayers() {
        var players = document.querySelectorAll('.js-player');
        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('.player-start');
            var message = shell.querySelector('[data-player-message]');
            var hls = null;
            var initialized = false;
            if (!video || !button) {
                return;
            }

            function showMessage(text) {
                if (message) {
                    message.textContent = text;
                    message.hidden = !text;
                }
            }

            function init() {
                if (initialized) {
                    return;
                }
                initialized = true;
                var url = video.getAttribute('data-video');
                if (!url) {
                    showMessage('播放暂时不可用');
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showMessage('播放暂时不可用');
                        }
                    });
                } else {
                    showMessage('播放暂时不可用');
                }
            }

            function start() {
                init();
                shell.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {
                        showMessage('点击视频控件继续播放');
                    });
                }
            }

            button.addEventListener('click', start);
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
                showMessage('');
            });
            video.addEventListener('click', function () {
                init();
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
        setupPlayers();
    });
}());
