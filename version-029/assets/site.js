(function () {
  const toggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const globalForms = document.querySelectorAll('[data-global-search]');
  globalForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      const value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        window.location.href = './index.html';
      }
    });
  });

  const searchInput = document.querySelector('[data-search-input]');
  const categoryFilter = document.querySelector('[data-category-filter]');
  const yearChips = document.querySelectorAll('[data-year-chip]');
  const cards = Array.from(document.querySelectorAll('.movie-card'));
  const emptyState = document.querySelector('[data-empty-state]');
  let selectedYear = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    const query = normalize(searchInput ? searchInput.value : '');
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    let visibleCount = 0;

    cards.forEach(function (card) {
      const haystack = normalize(card.dataset.search || card.textContent);
      const category = card.dataset.category || '';
      const year = card.dataset.year || '';
      const queryMatch = !query || haystack.includes(query);
      const categoryMatch = selectedCategory === 'all' || category === selectedCategory;
      const yearMatch = selectedYear === 'all' || year === selectedYear;
      const visible = queryMatch && categoryMatch && yearMatch;

      card.classList.toggle('is-hidden-by-filter', !visible);
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      searchInput.value = query;
    }
    searchInput.addEventListener('input', applyFilters);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
  }

  yearChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      selectedYear = chip.dataset.yearChip || 'all';
      yearChips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });
      applyFilters();
    });
  });

  applyFilters();

  const hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }
})();
