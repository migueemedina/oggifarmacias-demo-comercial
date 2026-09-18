/**
 * Oggi Farma — Carrusel de las tiras (banners horizontales).
 *
 * Sólo se encola cuando el slot tiene MÁS DE UN banner: con uno solo la tira
 * es una imagen fija y este archivo no hace falta (lo decide el PHP).
 *
 * Mismo comportamiento que el slider del hero mosaico, a propósito: los dos
 * carruseles del home se mueven igual.
 *   · pausa al pasar el mouse por encima
 *   · pausa cuando la pestaña se va a segundo plano
 *   · pausa cuando la tira no está en pantalla (IntersectionObserver): no tiene
 *     sentido rotar banners que nadie está mirando
 */
(function () {
    'use strict';

    function initTira(root) {
        if (root.dataset.oggiTiraBound === '1') { return; }
        root.dataset.oggiTiraBound = '1';

        var viewport = root.querySelector('[data-oggi-tira-viewport]');
        if (!viewport) { return; }

        var slides = Array.prototype.slice.call(viewport.querySelectorAll('.oggi-tira__slide'));
        if (slides.length < 2) { return; }

        var dots  = Array.prototype.slice.call(root.querySelectorAll('[data-oggi-tira-dot]'));
        var prev  = root.querySelector('[data-oggi-tira-prev]');
        var next  = root.querySelector('[data-oggi-tira-next]');
        var pause = root.querySelector('[data-oggi-tira-pause]');

        var autoplay = parseInt(root.getAttribute('data-autoplay'), 10);
        if (isNaN(autoplay) || autoplay < 1500) { autoplay = 0; } // 0 = no rotar solo

        var idx = 0;
        var timer = null;
        var manual = false;   // el usuario tocó pausa: no reanudar por hover ni scroll
        var hover = false;
        var visible = true;

        // aria-hidden y tabindex se mueven JUNTOS: un enlace enfocable dentro
        // de un aria-hidden manda al teclado a un banner que nadie está viendo.
        function ocultar(slide, si) {
            slide.setAttribute('aria-hidden', si ? 'true' : 'false');
            if (slide.tagName === 'A') {
                if (si) { slide.setAttribute('tabindex', '-1'); }
                else    { slide.removeAttribute('tabindex'); }
            }
        }

        function show(i) {
            var target = (i + slides.length) % slides.length;
            if (target === idx) { return; }

            var out = slides[idx];
            out.classList.add('is-leaving');
            out.classList.remove('is-active');
            ocultar(out, true);
            // Limpiamos is-leaving cuando termina la transición, si no el
            // slide queda con transform y reaparece corrido la vuelta siguiente.
            setTimeout(function () { out.classList.remove('is-leaving'); }, 600);

            idx = target;
            slides[idx].classList.add('is-active');
            ocultar(slides[idx], false);

            dots.forEach(function (d, n) { d.classList.toggle('is-active', n === idx); });
        }

        function corriendo() { return autoplay > 0 && !manual && !hover && visible; }

        function start() {
            stop();
            if (!corriendo()) { return; }
            timer = setInterval(function () { show(idx + 1); }, autoplay);
        }
        function stop() {
            if (timer) { clearInterval(timer); timer = null; }
        }

        if (prev) { prev.addEventListener('click', function () { show(idx - 1); start(); }); }
        if (next) { next.addEventListener('click', function () { show(idx + 1); start(); }); }

        dots.forEach(function (d, n) {
            d.addEventListener('click', function () { show(n); start(); });
        });

        if (pause) {
            pause.addEventListener('click', function () {
                manual = !manual;
                pause.setAttribute('aria-pressed', manual ? 'true' : 'false');
                pause.setAttribute('aria-label', manual ? 'Reanudar carrusel' : 'Pausar carrusel');
                start();
            });
        }

        root.addEventListener('mouseenter', function () { hover = true;  stop();  });
        root.addEventListener('mouseleave', function () { hover = false; start(); });

        document.addEventListener('visibilitychange', function () {
            visible = !document.hidden;
            start();
        });

        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    visible = e.isIntersecting && !document.hidden;
                    start();
                });
            }, { threshold: 0.25 });
            io.observe(root);
        }

        start();
    }

    function init() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-oggi-tira]'), initTira);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
