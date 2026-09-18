/* ============================================================
   OGGI FARMA — Category nav + mega-menú (desktop)
   - "Todas las categorías" es un <a> que linkea a la tienda; el click NO
     hace toggle (deja que el browser navegue).
   - Hover sobre el wrapper → abre el mega-menú (CSS-driven, ver catnav.css).
   - Side items: hover/focus activa su panel.
   - ESC: cierra (sólo aplica al estado "is-open" si lo hubiera vía hover).
   ============================================================ */
(function () {
    'use strict';

    function initCatNav() {
        var wrap   = document.querySelector('[data-oggi-catnav-wrap]');
        var allBtn = document.querySelector('[data-oggi-catnav-all]');
        if (!allBtn || !wrap) return;

        var mega   = wrap.querySelector('[data-oggi-megamenu]');
        var items  = mega ? mega.querySelectorAll('[data-oggi-megamenu-side-item]') : [];
        var panels = mega ? mega.querySelectorAll('[data-oggi-megamenu-panel]')     : [];

        if (!mega) return;

        /* Evita que clicks DENTRO del mega-menú cierren el panel */
        mega.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        /* Side items: hover/focus activa el panel correspondiente */
        function activate(item) {
            var id = item.getAttribute('data-cat-id');

            items.forEach(function (i) {
                i.classList.toggle('is-active', i === item);
            });
            panels.forEach(function (p) {
                p.classList.toggle('is-active', p.getAttribute('data-panel-id') === id);
            });
        }

        items.forEach(function (item) {
            item.addEventListener('mouseenter', function () { activate(item); });
            item.addEventListener('focus',      function () { activate(item); });
        });

        /* Click fuera del wrapper → cerrar */
        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target) && allBtn.classList.contains('is-open')) {
                allBtn.classList.remove('is-open');
                allBtn.setAttribute('aria-expanded', 'false');
            }
        });

        /* ESC → cerrar */
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && allBtn.classList.contains('is-open')) {
                allBtn.classList.remove('is-open');
                allBtn.setAttribute('aria-expanded', 'false');
                allBtn.focus();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCatNav);
    } else {
        initCatNav();
    }
})();
