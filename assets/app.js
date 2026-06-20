(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".main-nav");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                var open = nav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var activeIndex = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5600);
        }

        var searchInput = document.querySelector(".filter-input");
        var yearSelect = document.querySelector(".filter-select");
        var list = document.querySelector(".filter-list");
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q") || "";

        if (searchInput && queryValue) {
            searchInput.value = queryValue;
        }

        function applyFilter() {
            if (!list) {
                return;
            }
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var cards = list.querySelectorAll(".movie-card");
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year")
                ].join(" ").toLowerCase();
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !year || card.getAttribute("data-year") === year;
                card.classList.toggle("is-filtered-out", !(matchedKeyword && matchedYear));
            });
        }

        if (searchInput) {
            searchInput.addEventListener("input", applyFilter);
            applyFilter();
        }

        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilter);
        }
    });
}());
