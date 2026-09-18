/**
 * Oggi Farma — Product Carousel behavior
 *
 * Maneja las flechas prev/next: scroll horizontal de 80% del viewport.
 * También habilita/deshabilita las flechas según la posición del scroll.
 * El carrusel sigue funcionando sin JS (scroll nativo con snap).
 */
(function () {
    'use strict';

    function initCarousel(wrap) {
        var track = wrap.querySelector('[data-oggi-pcar-track]');
        var prev  = wrap.querySelector('[data-oggi-pcar-prev]');
        var next  = wrap.querySelector('[data-oggi-pcar-next]');
        if (!track) return;

        function step() {
            // 80% del ancho visible del track
            return Math.round(track.clientWidth * 0.8);
        }

        function updateArrows() {
            if (!prev || !next) return;
            var maxScroll = track.scrollWidth - track.clientWidth - 2;
            prev.disabled = track.scrollLeft <= 2;
            next.disabled = track.scrollLeft >= maxScroll;
        }

        if (prev) {
            prev.addEventListener('click', function () {
                track.scrollBy({ left: -step(), behavior: 'smooth' });
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                track.scrollBy({ left: step(), behavior: 'smooth' });
            });
        }

        track.addEventListener('scroll', updateArrows, { passive: true });
        window.addEventListener('resize', updateArrows);
        // Estado inicial
        updateArrows();
    }

    function initShareButtons() {
        document.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-oggi-share]');
            if (!btn) return;
            e.preventDefault();
            var url   = btn.getAttribute('data-url')   || window.location.href;
            var title = btn.getAttribute('data-title') || document.title;

            if (navigator.share) {
                navigator.share({ title: title, url: url }).catch(function () {});
                return;
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(function () {
                    btn.setAttribute('aria-label', 'Link copiado');
                    btn.classList.add('is-copied');
                    setTimeout(function () { btn.classList.remove('is-copied'); }, 1500);
                });
            }
        });
    }

    function initAll() {
        document.querySelectorAll('[data-oggi-pcar]').forEach(initCarousel);
        initShareButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
