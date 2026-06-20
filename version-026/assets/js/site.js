(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function setSlide(next) {
            if (!slides.length) {
                return;
            }
            current = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle('active', index === current);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle('active', index === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
                setSlide(next);
            });
        });

        window.setInterval(function () {
            setSlide(current + 1);
        }, 5200);
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function applyFilter(panel) {
        var page = panel.closest('section') || document;
        var input = panel.querySelector('[data-search-input]');
        var activeTypeButton = panel.querySelector('[data-filter-type].active');
        var query = normalize(input ? input.value : '');
        var type = activeTypeButton ? activeTypeButton.getAttribute('data-filter-type') : '全部';
        var cards = Array.prototype.slice.call(page.querySelectorAll('[data-card-list] [data-title]'));
        var empty = page.querySelector('[data-empty-state]');
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre')
            ].join(' '));
            var cardType = card.getAttribute('data-type') || '';
            var matchedQuery = !query || haystack.indexOf(query) !== -1;
            var matchedType = !type || type === '全部' || cardType === type;
            var shouldShow = matchedQuery && matchedType;
            card.classList.toggle('is-hidden', !shouldShow);
            if (shouldShow) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panel) {
        var input = panel.querySelector('[data-search-input]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (input && q) {
            input.value = q;
        }

        if (input) {
            input.addEventListener('input', function () {
                applyFilter(panel);
            });
        }

        Array.prototype.slice.call(panel.querySelectorAll('[data-filter-type]')).forEach(function (button) {
            button.addEventListener('click', function () {
                Array.prototype.slice.call(panel.querySelectorAll('[data-filter-type]')).forEach(function (other) {
                    other.classList.remove('active');
                });
                button.classList.add('active');
                applyFilter(panel);
            });
        });

        applyFilter(panel);
    });

    function startPlayer(shell) {
        var source = shell.getAttribute('data-player-src');
        var video = shell.querySelector('video');
        var cover = shell.querySelector('[data-player-button]');

        if (!source || !video) {
            return;
        }

        if (cover) {
            cover.classList.add('hidden');
        }

        if (shell.getAttribute('data-player-ready') !== 'true') {
            shell.setAttribute('data-player-ready', 'true');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = source;
        }

        video.play().catch(function () {});
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player-src]')).forEach(function (shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('[data-player-button]');

        if (cover) {
            cover.addEventListener('click', function () {
                startPlayer(shell);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (shell.getAttribute('data-player-ready') !== 'true') {
                    startPlayer(shell);
                }
            });
        }
    });
})();
