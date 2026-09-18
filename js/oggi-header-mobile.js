/* ============================================================
   OGGI FARMA — Header mobile interactions
   - Scroll-hide de pills (colapsa al scrollear abajo, vuelve al subir)
   - Bounce hint del track cuando no se interactuó
   - Toggle de visibilidad del float WhatsApp
   ============================================================ */
(function () {
    'use strict';

    /* ───────── Promo bar auto-slide ───────── */
    function initPromoSlider(slider) {
        var slides = slider.querySelectorAll('.oggi-hdr-m__promo-slide');
        if (!slides.length) return;

        if (slides.length < 2) {
            slider.setAttribute('data-single', '1');
            return;
        }

        var interval = parseInt(slider.getAttribute('data-interval'), 10) || 4000;
        var current = 0;
        var paused = false;
        var timer;

        function showNext() {
            if (paused) return;
            var prev = current;
            current = (current + 1) % slides.length;

            slides[prev].classList.remove('is-active');
            slides[prev].classList.add('is-leaving');
            setTimeout(function () {
                slides[prev].classList.remove('is-leaving');
            }, 500);
            slides[current].classList.add('is-active');
        }

        function start() { timer = setInterval(showNext, interval); }
        function stop()  { clearInterval(timer); }

        // Pausar cuando la pestaña está oculta (ahorra trabajo de CPU/batería)
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stop();
            else { stop(); start(); }
        });

        // Pausar al hover/touch (evita interrumpir la lectura)
        slider.addEventListener('mouseenter', function () { paused = true; });
        slider.addEventListener('mouseleave', function () { paused = false; });
        slider.addEventListener('touchstart', function () {
            paused = true;
            setTimeout(function () { paused = false; }, 6000); // auto-resume
        }, { passive: true });

        start();
    }

    /* ───────── Body padding dinámico (compensa header fixed) ───────── */
    function syncHeaderHeight(wrapper) {
        if (!wrapper) return function () {};

        var root = document.documentElement;
        var mq   = window.matchMedia('(max-width: 768px)');

        function update() {
            // En desktop no toca padding (header mobile oculto)
            if (!mq.matches) {
                root.style.removeProperty('--oggi-hdr-m-h');
                return;
            }
            var h = wrapper.getBoundingClientRect().height;
            if (h > 0) {
                root.style.setProperty('--oggi-hdr-m-h', Math.round(h) + 'px');
            }
        }

        update();

        if (window.ResizeObserver) {
            var ro = new ResizeObserver(update);
            ro.observe(wrapper);
        }
        window.addEventListener('resize', update);
        // Por si la altura cambia después de las transiciones CSS
        wrapper.addEventListener('transitionend', update);
        // Re-evaluar cuando cruza el breakpoint
        if (mq.addEventListener) mq.addEventListener('change', update);
        else if (mq.addListener) mq.addListener(update);

        return update;
    }

    function init() {
        // Promo slider(s) — pueden haber múltiples si se usa en más de un lugar
        document.querySelectorAll('[data-oggi-promo-slider]').forEach(initPromoSlider);

        var wrapper = document.querySelector('.oggi-hdr-m');
        var track   = document.querySelector('[data-oggi-hdr-m-pills-track]');
        var wpp     = document.querySelector('[data-oggi-hdr-m-wpp]');

        if (!wrapper && !wpp) return;

        // Altura dinámica del wrapper → --oggi-hdr-m-h (compensa el fixed)
        syncHeaderHeight(wrapper);

        var lastY = 0;
        var ticking = false;
        var THRESHOLD_TOP   = 10;  // px — "estás en el tope"
        var THRESHOLD_DIR   = 8;   // px — mínimo movimiento para cambiar dirección

        // Estado inicial: arrancar en el tope
        if (wrapper) wrapper.classList.add('is-at-top');

        function onScroll() {
            var y = Math.max(0, window.pageYOffset || 0);

            if (wrapper) {
                if (y < THRESHOLD_TOP) {
                    // Estamos arriba del todo: muestra promo + pills
                    wrapper.classList.add('is-at-top');
                    wrapper.classList.remove('is-scroll-down');
                } else {
                    wrapper.classList.remove('is-at-top');
                    // Actualiza la dirección solo si hay movimiento significativo
                    if (y > lastY + THRESHOLD_DIR) {
                        wrapper.classList.add('is-scroll-down');
                    } else if (y < lastY - THRESHOLD_DIR) {
                        wrapper.classList.remove('is-scroll-down');
                    }
                }
            }

            if (wpp) {
                if (y <= 60) {
                    wpp.classList.add('is-top');
                    wpp.classList.remove('is-hidden');
                } else {
                    wpp.classList.remove('is-top');
                    // Bajando → esconder; subiendo → mostrar de nuevo.
                    if (y > lastY + THRESHOLD_DIR) {
                        wpp.classList.add('is-hidden');
                    } else if (y < lastY - THRESHOLD_DIR) {
                        wpp.classList.remove('is-hidden');
                    }
                }
            }

            lastY = y;
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(onScroll);
                ticking = true;
            }
        }, { passive: true });

        /* Bounce hint: animación que insinúa el scroll horizontal del track */
        if (track) {
            var wrap = track.parentElement;
            var bounceTimer;
            var doBounce = function () {
                if (wrap && wrap.scrollLeft < 30) {
                    track.classList.add('is-hinting');
                    setTimeout(function () {
                        track.classList.remove('is-hinting');
                    }, 800);
                }
            };
            setTimeout(doBounce, 1200);
            bounceTimer = setInterval(doBounce, 9000);

            var stopHint = function () {
                clearInterval(bounceTimer);
                track.classList.remove('is-hinting');
            };
            if (wrap) {
                wrap.addEventListener('touchstart', stopHint, { passive: true });
                wrap.addEventListener('scroll', stopHint, { passive: true });
            }
        }

        // Estado inicial del WhatsApp (si arranca en top, oculto)
        if (wpp && (window.pageYOffset || 0) <= 60) {
            wpp.classList.add('is-top');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
