(function () {
    'use strict';

    var section = document.querySelector('.portfolio');
    var cursor  = document.getElementById('pfCursor');
    if (!section) return;


    /* ── 1. REVEAL AO SCROLL ──────────────────────────────
       Cada [data-pf-reveal] recebe .pf-visible ao entrar
       na viewport, com o delay de data-pf-delay (ms).
    ─────────────────────────────────────────────────────── */
    var revealEls = Array.prototype.slice.call(
        section.querySelectorAll('[data-pf-reveal]')
    );
    var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el    = entry.target;
            var delay = parseInt(el.getAttribute('data-pf-delay') || '0', 10);
            setTimeout(function () { el.classList.add('pf-visible'); }, delay);
            revealObs.unobserve(el); /* Dispara só uma vez */
        });
    }, { threshold: 0.10 });
    revealEls.forEach(function (el) { revealObs.observe(el); });


    /* ── 3. PARALAXE DO FUNDO (.pf-card-bg) ─────────────
       Injeta --pf-rx e --pf-ry no card ao mover o mouse.
       O CSS usa esses valores em translate() dentro do
       .pf-card-bg, criando o efeito de profundidade.
    ─────────────────────────────────────────────────────── */
    var STRENGTH = 10; /* Máximo de deslocamento em px */

    section.addEventListener('mousemove', function (e) {
        var card = e.target.closest('.pf-card:not(.pf-card-soon)');
        if (!card) return;
        var r    = card.getBoundingClientRect();
        var relX = (e.clientX - r.left) / r.width  - 0.5; /* -0.5 a +0.5 */
        var relY = (e.clientY - r.top)  / r.height - 0.5;
        card.style.setProperty('--pf-rx', (relX * STRENGTH) + 'px');
        card.style.setProperty('--pf-ry', (relY * STRENGTH) + 'px');
    }, { passive: true });

    /* Reseta ao sair do card */
    section.addEventListener('mouseout', function (e) {
        var card = e.target.closest('.pf-card:not(.pf-card-soon)');
        if (card && !card.contains(e.relatedTarget)) {
            card.style.removeProperty('--pf-rx');
            card.style.removeProperty('--pf-ry');
        }
    }, { passive: true });

    /* Reseta tudo ao sair da seção */
    section.addEventListener('mouseleave', function () {
        section.querySelectorAll('.pf-card:not(.pf-card-soon)')
            .forEach(function (c) {
                c.style.removeProperty('--pf-rx');
                c.style.removeProperty('--pf-ry');
            });
    }, { passive: true });

})();