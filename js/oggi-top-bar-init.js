/**
 * Oggi Farma — Topbar marquee
 *
 * Rota los mensajes [data-oggi-topbar-marquee] cada N ms y actualiza el
 * data-bg del topbar para que el fondo + color cambie de a poco vía CSS
 * transition (definidos en topbar.css).
 *
 * Pausa cuando el tab está oculto (Page Visibility API) — evita que el
 * usuario vuelva y se pierda 5 mensajes que pasaron en background.
 *
 * Pausa al hover sobre el topbar — facilita que el usuario lea con calma.
 */
(function () {
    'use strict';

    function initTopbar(bar) {
        var marquee = bar.querySelector('[data-oggi-topbar-marquee]');
        if (!marquee) return;

        var msgs = Array.prototype.slice.call(
            marquee.querySelectorAll('.oggi-topbar__msg')
        );
        if (msgs.length < 2) return;

        var rotateMs = parseInt(bar.getAttribute('data-rotate-ms'), 10);
        if (isNaN(rotateMs) || rotateMs < 1500) rotateMs = 4500;

        var idx = 0;
        var timer = null;
        var paused = false;

        // aria-hidden y tabindex se mueven JUNTOS: si el mensaje tiene enlace,
        // dejarlo enfocable mientras está oculto manda al teclado a un link que
        // nadie ve.
        function ocultar(msg, si) {
            msg.setAttribute('aria-hidden', si ? 'true' : 'false');
            var a = msg.querySelector('a.oggi-topbar__msg-inner');
            if (!a) { return; }
            if (si) { a.setAttribute('tabindex', '-1'); }
            else    { a.removeAttribute('tabindex'); }
        }

        function show(i) {
            // Marcamos al saliente con is-leaving para que slide a la izquierda
            // (el CSS define translateX(-60px) cuando is-leaving). Mantenemos
            // is-active hasta el siguiente tick para que la transición se vea.
            var prev = msgs[idx];
            prev.classList.add('is-leaving');
            prev.classList.remove('is-active');
            ocultar(prev, true);

            // Limpiamos is-leaving después de que termine la transition.
            setTimeout(function () {
                prev.classList.remove('is-leaving');
            }, 600);

            idx = (i + msgs.length) % msgs.length;
            msgs[idx].classList.add('is-active');
            ocultar(msgs[idx], false);
            var bg = msgs[idx].getAttribute('data-bg') || 'navy';
            bar.setAttribute('data-bg', bg);
        }

        function tick() {
            if (paused) return;
            show(idx + 1);
        }

        function start() {
            stop();
            timer = setInterval(tick, rotateMs);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        // Pausa al hover (más cómodo para leer)
        bar.addEventListener('mouseenter', function () { paused = true; });
        bar.addEventListener('mouseleave', function () { paused = false; });

        // Pausa cuando el tab está en background
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                stop();
            } else {
                start();
            }
        });

        start();
    }

    function init() {
        var bars = document.querySelectorAll('[data-oggi-topbar]');
        Array.prototype.forEach.call(bars, initTopbar);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
