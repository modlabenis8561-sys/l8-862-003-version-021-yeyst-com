
(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-primary-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));
    areas.forEach(function (area) {
      var container = area.parentElement.querySelector('[data-card-container]') || document.querySelector('[data-card-container]');
      if (!container) {
        return;
      }
      var cards = Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]'));
      var searchInput = area.querySelector('[data-local-search]');
      var yearSelect = area.querySelector('[data-filter-year]');
      var genreSelect = area.querySelector('[data-filter-genre]');
      var categorySelect = area.querySelector('[data-filter-category]');
      var countNode = area.parentElement.querySelector('[data-result-count]');

      function apply() {
        var query = normalize(searchInput && searchInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var genre = normalize(genreSelect && genreSelect.value);
        var category = normalize(categorySelect && categorySelect.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.textContent
          ].join(' '));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
          var matchesGenre = !genre || normalize(card.getAttribute('data-genre')).indexOf(genre) !== -1;
          var matchesCategory = !category || normalize(card.getAttribute('data-category')) === category;
          var isVisible = matchesQuery && matchesYear && matchesGenre && matchesCategory;
          card.classList.toggle('is-filter-hidden', !isVisible);
          if (isVisible) {
            visibleCount += 1;
          }
        });

        if (countNode) {
          countNode.textContent = '当前显示 ' + visibleCount + ' 部影片';
        }
      }

      [searchInput, yearSelect, genreSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get('q');
      if (queryFromUrl && searchInput && searchInput.hasAttribute('data-query-sync')) {
        searchInput.value = queryFromUrl;
      }
      apply();
    });
  }

  function initPlayer() {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-player-button]');
    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-src');
    var initialized = false;
    var hlsInstance = null;

    function setupSource() {
      if (initialized || !source) {
        return;
      }
      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal || !hlsInstance) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      setupSource();
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', function () {
      button.classList.add('is-hidden');
      playVideo();
    });

    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
        image.setAttribute('aria-hidden', 'true');
      }, { once: true });
    });
  }

  ready(function () {
    initNavigation();
    initHeroSlider();
    initFilters();
    initPlayer();
    initImageFallbacks();
  });
})();
