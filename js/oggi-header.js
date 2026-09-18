/* ============================================================
   OGGI FARMA — Header interactions
   - Custom dropdown del buscador (categoría de producto)
   Fase 4 (mobile) sumará: toggle del drawer.
   ============================================================ */
(function () {
    'use strict';

    /* ───────── Custom dropdown de categorías ───────── */
    function initCatPicker(root) {
        var toggle   = root.querySelector('.oggi-hdr__cat-toggle');
        var menu     = root.querySelector('.oggi-hdr__cat-menu');
        var label    = root.querySelector('.oggi-hdr__cat-label');
        var hidden   = root.querySelector('[data-oggi-cat-value]');
        var items    = menu ? menu.querySelectorAll('.oggi-hdr__cat-item') : [];

        if (!toggle || !menu || !hidden || !items.length) return;

        function open() {
            root.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
            // Scroll al item seleccionado
            var sel = menu.querySelector('.oggi-hdr__cat-item.is-selected');
            if (sel) {
                menu.scrollTop = Math.max(0, sel.offsetTop - 40);
            }
        }
        function close() {
            root.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            clearFocus();
        }
        function toggleMenu() {
            if (root.classList.contains('is-open')) close();
            else open();
        }

        function select(item) {
            var value = item.getAttribute('data-value') || '';
            var text  = item.getAttribute('data-label') || item.textContent.trim();

            hidden.value = value;
            label.textContent = text;

            items.forEach(function (i) {
                i.classList.remove('is-selected');
                i.setAttribute('aria-selected', 'false');
            });
            item.classList.add('is-selected');
            item.setAttribute('aria-selected', 'true');

            close();
            toggle.focus();
        }

        function clearFocus() {
            items.forEach(function (i) { i.classList.remove('is-focused'); });
        }

        function focusIndex(idx) {
            clearFocus();
            if (idx < 0) idx = items.length - 1;
            if (idx >= items.length) idx = 0;
            items[idx].classList.add('is-focused');
            items[idx].scrollIntoView({ block: 'nearest' });
        }

        function focusedIndex() {
            for (var i = 0; i < items.length; i++) {
                if (items[i].classList.contains('is-focused')) return i;
            }
            return -1;
        }

        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            toggleMenu();
        });

        items.forEach(function (item) {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                select(item);
            });
            item.addEventListener('mouseenter', function () {
                clearFocus();
                item.classList.add('is-focused');
            });
        });

        // Click fuera: cerrar
        document.addEventListener('click', function (e) {
            if (!root.contains(e.target)) close();
        });

        // Teclado
        toggle.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
                focusIndex(0);
            }
        });
        root.addEventListener('keydown', function (e) {
            if (!root.classList.contains('is-open')) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                close();
                toggle.focus();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                focusIndex(focusedIndex() + 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                focusIndex(focusedIndex() - 1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                var idx = focusedIndex();
                if (idx >= 0) select(items[idx]);
            }
        });
    }

    function boot() {
        document.querySelectorAll('[data-oggi-cat-picker]').forEach(initCatPicker);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
