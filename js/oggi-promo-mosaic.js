/**
 * Oggi Farma — Promo mosaic auto-scroll en mobile.
 *
 * En desktop el bloque sigue siendo grid 2-rows estático (no hace nada acá).
 * En mobile (≤768px) el CSS lo convierte en un carrusel horizontal con
 * scroll-snap. Este script le da auto-scroll cada N segundos (loop infinito)
 * con pausa por interacción (touch / mouse).
 */
(function () {
    'use strict';

    var INTERVAL_MS = 4500;
    var RESUME_AFTER_TOUCH = 9000; // si el user swipea, no reanudar por 9s

    function isMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    function initMosaic(inner) {
        if (!inner) return;
        if (inner.dataset.oggiPromoBound === '1') return;
        inner.dataset.oggiPromoBound = '1';

        var timer = null;
        var paused = false;
        var resumeTimer = null;

        function step() {
            if (!isMobile() || paused) return;
            var maxScroll = inner.scrollWidth - inner.clientWidth;
            // Próximo tile: 80% del viewport + gap 12px (mismo ancho que el hero).
            var jump = inner.clientWidth * 0.80 + 12;
            var current = inner.scrollLeft;
            if (current >= maxScroll - 8) {
                inner.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                inner.scrollTo({ left: current + jump, behavior: 'smooth' });
            }
        }

        function start() {
            stop();
            if (!isMobile()) return;
            timer = setInterval(step, INTERVAL_MS);
        }

        function stop() {
            if (timer) { clearInterval(timer); timer = null; }
        }

        function pauseTemporarily() {
            paused = true;
            if (resumeTimer) clearTimeout(resumeTimer);
            resumeTimer = setTimeout(function () {
                paused = false;
            }, RESUME_AFTER_TOUCH);
        }

        // Pausa al swipe / mouse
        inner.addEventListener('touchstart', pauseTemporarily, { passive: true });
        inner.addEventListener('mouseenter', function () { paused = true; });
        inner.addEventListener('mouseleave', function () { paused = false; });

        // Pausa cuando el tab no está visible
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) { stop(); } else { start(); }
        });

        // Restart en resize (cuando alguien rota el tablet o redimensiona)
        window.addEventListener('resize', function () { start(); });

        start();
    }

    function boot() {
        // El scroller mobile ahora es el track propio de imágenes 6:5.
        var inners = document.querySelectorAll('.oggi-promo-mosaic__mtrack');
        Array.prototype.forEach.call(inners, initMosaic);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
