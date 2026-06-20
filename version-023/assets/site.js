(function () {
  function bySelector(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeaderSearch() {
    bySelector('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = 'search.html';
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = bySelector('[data-hero-slide]', carousel);
    var dots = bySelector('[data-hero-dot]', carousel);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        activate(position);
      });
    });
    window.setInterval(function () {
      activate(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilter(query, cards, emptyState) {
    var words = normalize(query).split(/\s+/).filter(Boolean);
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var matched = words.length === 0 || words.every(function (word) {
        return text.indexOf(word) !== -1;
      });
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  function setupLocalFilter() {
    bySelector('[data-local-filter]').forEach(function (form) {
      var input = form.querySelector('input[type="search"]');
      var section = form.closest('section') || document;
      var cards = bySelector('[data-search-card]', section);
      var emptyState = section.querySelector('[data-empty-state]');
      if (!input) {
        return;
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilter(input.value, cards, emptyState);
      });
      input.addEventListener('input', function () {
        applyFilter(input.value, cards, emptyState);
      });
    });
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-page]');
    if (!form) {
      return;
    }
    var input = form.querySelector('input[name="q"]');
    var cards = bySelector('[data-search-card]');
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
      applyFilter(query, cards, emptyState);
      input.addEventListener('input', function () {
        applyFilter(input.value, cards, emptyState);
      });
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter(input ? input.value : '', cards, emptyState);
    });
  }

  function setupPlayers() {
    bySelector('.movie-player').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.video-start');
      var stream = player.getAttribute('data-stream');
      var hlsInstance = null;
      var loaded = false;
      if (!video || !stream) {
        return;
      }

      function requestPlay() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      function attachStream() {
        if (loaded) {
          return;
        }
        loaded = true;
        video.controls = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', requestPlay, { once: true });
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, requestPlay);
          return;
        }
        video.src = stream;
      }

      function start() {
        player.classList.add('is-playing');
        attachStream();
        requestPlay();
      }

      if (button) {
        button.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          player.classList.remove('is-playing');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  setupMobileMenu();
  setupHeaderSearch();
  setupHero();
  setupLocalFilter();
  setupSearchPage();
  setupPlayers();
})();
