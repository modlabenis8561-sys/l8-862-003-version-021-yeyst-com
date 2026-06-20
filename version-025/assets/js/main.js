(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }

    callback();
  }

  function setupMobileMenu() {
    const button = document.querySelector('[data-mobile-menu-button]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    const carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let activeIndex = 0;
    let timer = null;

    function showSlide(nextIndex) {
      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === activeIndex);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === activeIndex);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        restartTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        restartTimer();
      });
    }

    restartTimer();
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    uniqueSorted(values).forEach(function (value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      const section = panel.closest('section') || document;
      const cards = Array.from(section.querySelectorAll('[data-movie-card]'));
      const searchInput = panel.querySelector('[data-search-input]');
      const categorySelect = panel.querySelector('[data-filter-category]');
      const yearSelect = panel.querySelector('[data-filter-year]');
      const regionSelect = panel.querySelector('[data-filter-region]');
      const typeSelect = panel.querySelector('[data-filter-type]');
      const counter = panel.querySelector('[data-filter-count]');
      const urlParams = new URLSearchParams(window.location.search);
      const queryFromUrl = urlParams.get('q');

      fillSelect(yearSelect, cards.map(function (card) { return card.dataset.year; }));
      fillSelect(regionSelect, cards.map(function (card) { return card.dataset.region; }));
      fillSelect(typeSelect, cards.map(function (card) { return card.dataset.type; }));

      if (searchInput && queryFromUrl) {
        searchInput.value = queryFromUrl;
      }

      function applyFilters() {
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const category = categorySelect ? categorySelect.value : '';
        const year = yearSelect ? yearSelect.value : '';
        const region = regionSelect ? regionSelect.value : '';
        const type = typeSelect ? typeSelect.value : '';
        let visibleCount = 0;

        cards.forEach(function (card) {
          const matchesKeyword = !keyword || (card.dataset.search || '').includes(keyword);
          const matchesCategory = !category || card.dataset.category === category;
          const matchesYear = !year || card.dataset.year === year;
          const matchesRegion = !region || card.dataset.region === region;
          const matchesType = !type || card.dataset.type === type;
          const isVisible = matchesKeyword && matchesCategory && matchesYear && matchesRegion && matchesType;

          card.classList.toggle('is-hidden', !isVisible);

          if (isVisible) {
            visibleCount += 1;
          }
        });

        if (counter) {
          counter.textContent = '当前显示 ' + visibleCount + ' 部影片，共 ' + cards.length + ' 部。';
        }
      }

      [searchInput, categorySelect, yearSelect, regionSelect, typeSelect].forEach(function (control) {
        if (!control) {
          return;
        }

        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      });

      applyFilters();
    });
  }

  function setupImageFallback() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      }, { once: true });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupImageFallback();
  });
}());
