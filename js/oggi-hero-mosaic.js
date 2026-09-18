/* ============================================================
   OGGI FARMA — Hero mosaic — slider del tile central
   Se auto-activa si el tile central tiene >1 slide.
   Controles: dots (jump-to), prev/next (flechas), pause/play.
   ============================================================ */
(function () {
    'use strict';

    function initMosaicSlider(slider) {
        // Los controles (dots / flechas / pausa) ahora viven en la barra DEBAJO
        // de la imagen, como hermanos del slider dentro del tile central. Por eso
        // los buscamos desde el tile (scope), no desde el slider.
        var scope = slider.closest('.oggi-hero-mosaic__tile--center') || slider;
        var slides = slider.querySelectorAll('.oggi-hero-mosaic__slide');
        var dots   = scope.querySelectorAll('[data-oggi-mosaic-dot]');
        var prev   = scope.querySelector('[data-oggi-mosaic-prev]');
        var next   = scope.querySelector('[data-oggi-mosaic-next]');
        var pause  = scope.querySelector('[data-oggi-mosaic-pause]');

        if (slides.length < 2) return;

        var delay = parseInt(slider.getAttribute('data-autoplay'), 10);
        if (isNaN(delay)) delay = 5000;

        var current = 0;
        var timer = null;
        var manuallyPaused = false; // toggle por el botón pause
        var hovered = false;

        function show(i) {
            // Slide saliente → is-leaving (se va a la izquierda).
            var prev = slides[current];
            prev.classList.add('is-leaving');
            prev.classList.remove('is-active');
            setTimeout(function () { prev.classList.remove('is-leaving'); }, 700);
            if (dots[current]) dots[current].classList.remove('is-active');

            current = ((i % slides.length) + slides.length) % slides.length;

            // Slide entrante → is-active (viene desde la derecha).
            slides[current].classList.add('is-active');
            if (dots[current]) dots[current].classList.add('is-active');
        }

        function next_() { show(current + 1); }
        function prev_() { show(current - 1); }

        function startTimer() {
            stopTimer();
            if (manuallyPaused || hovered) return;
            if (delay > 0) timer = setInterval(next_, delay);
        }

        function stopTimer() {
            if (timer) { clearInterval(timer); timer = null; }
        }

        function setPaused(state) {
            manuallyPaused = !!state;
            if (pause) {
                pause.setAttribute('aria-pressed', state ? 'true' : 'false');
                pause.setAttribute(
                    'aria-label',
                    state ? 'Reanudar carrusel' : 'Pausar carrusel'
                );
                slider.classList.toggle('is-paused', !!state);
            }
            if (state) { stopTimer(); } else { startTimer(); }
        }

        // Dots → jump-to
        Array.prototype.forEach.call(dots, function (dot, idx) {
            dot.addEventListener('click', function (e) {
                e.preventDefault();
                show(idx);
                if (!manuallyPaused) startTimer(); // reset
            });
        });

        // Flechas
        if (prev) {
            prev.addEventListener('click', function (e) {
                e.preventDefault();
                prev_();
                if (!manuallyPaused) startTimer();
            });
        }
        if (next) {
            next.addEventListener('click', function (e) {
                e.preventDefault();
                next_();
                if (!manuallyPaused) startTimer();
            });
        }

        // Pause / play
        if (pause) {
            pause.addEventListener('click', function (e) {
                e.preventDefault();
                setPaused(!manuallyPaused);
            });
        }

        // Pausar en hover (sin tocar el estado de "manuallyPaused")
        slider.addEventListener('mouseenter', function () {
            hovered = true;
            stopTimer();
        });
        slider.addEventListener('mouseleave', function () {
            hovered = false;
            startTimer();
        });

        // Pausar en background
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                stopTimer();
            } else if (!manuallyPaused && !hovered) {
                startTimer();
            }
        });

        startTimer();
    }

    function boot() {
        var sliders = document.querySelectorAll('[data-oggi-hero-mosaic-slider]');
        Array.prototype.forEach.call(sliders, initMosaicSlider);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
