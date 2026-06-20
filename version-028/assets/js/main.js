(() => {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', () => {
            mobilePanel.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const heroCards = Array.from(document.querySelectorAll('[data-hero-card]'));
    let currentSlide = 0;

    const showSlide = (nextIndex) => {
        if (!slides.length) {
            return;
        }

        currentSlide = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });

        heroCards.forEach((card, index) => {
            card.classList.toggle('active', index === currentSlide);
        });
    };

    if (slides.length) {
        showSlide(0);

        heroCards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => showSlide(index));
            card.addEventListener('focus', () => showSlide(index));
        });

        window.setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    const searchInput = document.querySelector('[data-search-input]');
    const genreSelect = document.querySelector('[data-genre-select]');
    const yearSelect = document.querySelector('[data-year-select]');
    const searchItems = Array.from(document.querySelectorAll('.search-item'));
    const emptyState = document.querySelector('[data-empty-state]');

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const applySearch = () => {
        if (!searchItems.length) {
            return;
        }

        const keyword = normalize(searchInput ? searchInput.value : '');
        const genre = normalize(genreSelect ? genreSelect.value : '');
        const year = normalize(yearSelect ? yearSelect.value : '');
        let visibleCount = 0;

        searchItems.forEach((item) => {
            const haystack = normalize([
                item.dataset.title,
                item.dataset.region,
                item.dataset.genre,
                item.dataset.tags,
                item.dataset.year
            ].join(' '));
            const genreText = normalize(`${item.dataset.genre || ''} ${item.dataset.tags || ''}`);
            const yearText = normalize(item.dataset.year);
            const matchedKeyword = !keyword || haystack.includes(keyword);
            const matchedGenre = !genre || genreText.includes(genre);
            const matchedYear = !year || yearText === year;
            const visible = matchedKeyword && matchedGenre && matchedYear;

            item.style.display = visible ? '' : 'none';

            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('visible', visibleCount === 0);
        }
    };

    if (searchInput || genreSelect || yearSelect) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');

        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }

        [searchInput, genreSelect, yearSelect].forEach((control) => {
            if (control) {
                control.addEventListener('input', applySearch);
                control.addEventListener('change', applySearch);
            }
        });

        applySearch();
    }
})();
