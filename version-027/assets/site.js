(function () {
    const body = document.body;
    const searchPanel = document.querySelector('[data-search-panel]');
    const searchInput = document.querySelector('[data-search-input]');
    const searchResults = document.querySelector('[data-search-results]');
    const openSearchButtons = document.querySelectorAll('[data-open-search]');
    const closeSearchButtons = document.querySelectorAll('[data-close-search]');
    const mobileToggle = document.querySelector('[data-mobile-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    function openSearch() {
        if (!searchPanel) {
            return;
        }
        searchPanel.classList.add('is-open');
        body.classList.add('is-locked');
        setTimeout(function () {
            if (searchInput) {
                searchInput.focus();
            }
        }, 30);
    }

    function closeSearch() {
        if (!searchPanel) {
            return;
        }
        searchPanel.classList.remove('is-open');
        body.classList.remove('is-locked');
    }

    openSearchButtons.forEach(function (button) {
        button.addEventListener('click', openSearch);
    });

    closeSearchButtons.forEach(function (button) {
        button.addEventListener('click', closeSearch);
    });

    if (searchPanel) {
        searchPanel.addEventListener('click', function (event) {
            if (event.target === searchPanel) {
                closeSearch();
            }
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeSearch();
        }
    });

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function renderSearchResults(query) {
        if (!searchResults) {
            return;
        }
        const keyword = normalize(query);
        if (!keyword) {
            searchResults.innerHTML = '';
            return;
        }
        const data = window.SITE_SEARCH_DATA || [];
        const matches = data.filter(function (item) {
            return normalize(item.title + ' ' + item.genre + ' ' + item.region + ' ' + item.year + ' ' + item.tags + ' ' + item.line).includes(keyword);
        }).slice(0, 18);
        if (!matches.length) {
            searchResults.innerHTML = '<div class="search-result-item"><span class="search-result-title">暂无匹配内容</span><span class="search-result-desc">可以尝试搜索影片名、类型、地区或年份</span></div>';
            return;
        }
        searchResults.innerHTML = matches.map(function (item) {
            return '<a class="search-result-item" href="' + item.url + '">' +
                '<span class="search-result-title">' + item.title + '</span>' +
                '<span class="search-result-meta">' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span>' +
                '<span class="search-result-desc">' + item.line + '</span>' +
                '</a>';
        }).join('');
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            renderSearchResults(searchInput.value);
        });
    }

    const slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const prev = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === active);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === active);
            });
        }

        function start() {
            stop();
            timer = setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    const categoryFilter = document.querySelector('[data-category-filter]');
    const typeFilter = document.querySelector('[data-type-filter]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const empty = document.querySelector('[data-empty-filter]');

    function applyCategoryFilter() {
        if (!cards.length) {
            return;
        }
        const keyword = normalize(categoryFilter ? categoryFilter.value : '');
        const type = normalize(typeFilter ? typeFilter.value : '');
        let visible = 0;
        cards.forEach(function (card) {
            const text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-tags'));
            const cardType = normalize(card.getAttribute('data-type'));
            const matched = (!keyword || text.includes(keyword)) && (!type || cardType === type);
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('input', applyCategoryFilter);
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', applyCategoryFilter);
    }
})();
