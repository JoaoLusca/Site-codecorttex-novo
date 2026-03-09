(function () {
    'use strict';

    /* ── 1. REVEAL AO SCROLL (IntersectionObserver) ─────────────
       Observa todos os elementos com [data-sb-reveal].
       Ao entrar na viewport, adiciona a classe .sb-visible após
       o delay definido em [data-sb-delay] (ms).               */
    const sbRevealEls = document.querySelectorAll('[data-sb-reveal]');

    const sbRevealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.sbDelay || '0', 10);
                setTimeout(function () {
                    entry.target.classList.add('sb-visible');
                }, delay);
                sbRevealObserver.unobserve(entry.target); /* Roda só uma vez */
            }
        });
    }, { threshold: 0.15 });

    sbRevealEls.forEach(function (el) {
        sbRevealObserver.observe(el);
    });


    /* ── 2. CONTADOR ANIMADO NOS STATS ──────────────────────────
       Lê o valor alvo em [data-sb-stat-value] e os prefixos/
       sufixos em [data-sb-stat-prefix] / [data-sb-stat-suffix].
       Anima de 0 até o valor com easing cubic-out.            */
    function sbAnimateCounter(numEl, target, prefix, suffix) {
        const duration = 1800; /* ms */
        const startTime = performance.now();

        function sbUpdateCounter(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            /* Easing: cubic ease-out */
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(ease * target);
            numEl.innerHTML = prefix + current + suffix;
            if (progress < 1) requestAnimationFrame(sbUpdateCounter);
        }

        requestAnimationFrame(sbUpdateCounter);
    }

    const sbStatCards = document.querySelectorAll('.sb-stat-card[data-sb-stat-value]');

    const sbStatObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const card    = entry.target;
                const numEl   = card.querySelector('.sb-stat-number');
                const target  = parseInt(card.dataset.sbStatValue, 10);
                const prefix  = card.dataset.sbStatPrefix  || '';
                const suffix  = card.dataset.sbStatSuffix  || '';
                const delay   = parseInt(card.dataset.sbDelay || '0', 10);

                /* Zera o número antes de animar */
                numEl.innerHTML = prefix + '0' + suffix;

                setTimeout(function () {
                    sbAnimateCounter(numEl, target, prefix, suffix);
                }, delay + 200); /* Delay do card + pequena pausa extra */

                sbStatObserver.unobserve(card); /* Roda só uma vez */
            }
        });
    }, { threshold: 0.5 });

    sbStatCards.forEach(function (card) {
        sbStatObserver.observe(card);
    });


    /* ── 3. PARALLAX NO NÚMERO FANTASMA ─────────────────────────
       Move o "03" de fundo suavemente no scroll, criando
       profundidade. O fator 0.15 define a intensidade.        */
    const sbGhostNumber = document.querySelector('.sb-ghost-number');

    if (sbGhostNumber) {
        window.addEventListener('scroll', function () {
            /* requestAnimationFrame para performance */
            requestAnimationFrame(function () {
                const offset = window.scrollY * 0.15;
                sbGhostNumber.style.transform =
                    'translateY(' + offset + 'px) rotate(-2deg)';
            });
        }, { passive: true });
    }

})(); /* IIFE: encapsula tudo, zero poluição no escopo global */