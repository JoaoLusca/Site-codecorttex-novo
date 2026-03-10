(function () {
    'use strict';

    /* ── REFERÊNCIAS ────────────────────────────────────── */
    var section    = document.querySelector('.depoimentos');
    var track      = document.getElementById('dpTrack');
    var colOuter   = document.getElementById('dpCarouselCol');
    var dotsRow    = document.getElementById('dpDotsRow');
    var navPrev    = document.getElementById('dpNavPrev');
    var navNext    = document.getElementById('dpNavNext');
    var currentNum = document.getElementById('dpCurrentNum');
    var totalNum   = document.getElementById('dpTotalNum');

    if (!section || !track) return;

    var slides  = Array.prototype.slice.call(track.querySelectorAll('.dp-slide'));
    var TOTAL   = slides.length;
    var current = 0;
    var GAP     = 16; /* Deve bater com o gap do CSS */


    /* ══════════════════════════════════════════════════════
       CÁLCULO DO OFFSET DE CENTRALIZAÇÃO
       Soma as larguras de todos os slides anteriores ao alvo
       e subtrai metade do container para centralizar.
    ══════════════════════════════════════════════════════ */
    function calcOffset(index) {
        var containerW = colOuter.offsetWidth;
        var offsetX    = 0;
        var trackPad   = 80; /* Padding lateral do .dp-track no CSS */

        /* Padding inicial da trilha */
        offsetX += trackPad;

        /* Soma larguras + gaps dos slides anteriores */
        for (var i = 0; i < index; i++) {
            offsetX += slides[i].offsetWidth + GAP;
        }

        /* Subtrai para centralizar o slide alvo */
        offsetX -= (containerW / 2) - (slides[index].offsetWidth / 2);

        return -offsetX;
    }


    /* ══════════════════════════════════════════════════════
       GERAÇÃO DOS DOTS
    ══════════════════════════════════════════════════════ */
    function buildDots() {
        dotsRow.innerHTML = '';
        slides.forEach(function (_, i) {
            var btn = document.createElement('button');
            btn.className = 'dp-dot' + (i === 0 ? ' dp-dot-active' : '');
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-label', 'Depoimento ' + (i + 1));
            btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            btn.addEventListener('click', function () { goTo(i); resetTimer(); });
            dotsRow.appendChild(btn);
        });
    }


    /* ══════════════════════════════════════════════════════
       ATUALIZA DOTS
    ══════════════════════════════════════════════════════ */
    function updateDots() {
        Array.prototype.forEach.call(
            dotsRow.querySelectorAll('.dp-dot'),
            function (dot, i) {
                var active = i === current;
                dot.classList.toggle('dp-dot-active', active);
                dot.setAttribute('aria-selected', active ? 'true' : 'false');
            }
        );
    }


    /* ══════════════════════════════════════════════════════
       ATUALIZA CONTADOR DO SIDEBAR
       Fade out → troca número → fade in
    ══════════════════════════════════════════════════════ */
    function updateCounter() {
        var n = (current + 1 < 10 ? '0' : '') + (current + 1);
        var t = '/ ' + (TOTAL < 10 ? '0' : '') + TOTAL;

        if (currentNum) {
            currentNum.style.opacity   = '0';
            currentNum.style.transform = 'translateY(-6px)';
            setTimeout(function () {
                currentNum.textContent     = n;
                currentNum.style.opacity   = '1';
                currentNum.style.transform = 'translateY(0)';
            }, 200);
        }
        if (totalNum) totalNum.textContent = t;
    }


    /* ══════════════════════════════════════════════════════
       NAVEGAR PARA SLIDE N
    ══════════════════════════════════════════════════════ */
    function goTo(newIndex) {
        /* Loop circular */
        newIndex = ((newIndex % TOTAL) + TOTAL) % TOTAL;
        if (newIndex === current && track.style.transform !== '') return;

        current = newIndex;

        /* 1. Atualiza classes ativas */
        slides.forEach(function (slide, i) {
            slide.classList.toggle('dp-slide-active', i === current);
        });

        /* 2. Aguarda dois frames (o CSS muda flex-basis antes de medir)
              e então calcula + aplica o translateX com animação       */
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                track.style.transition = 'transform 0.62s cubic-bezier(0.4, 0, 0.2, 1)';
                track.style.transform  = 'translateX(' + calcOffset(current) + 'px)';
            });
        });

        /* 3. UI secundária */
        updateDots();
        updateCounter();
    }


    /* ══════════════════════════════════════════════════════
       INICIALIZAÇÃO — posiciona sem animação
    ══════════════════════════════════════════════════════ */
    function init() {
        buildDots();
        updateCounter();

        /* Transition do contador no sidebar */
        if (currentNum) {
            currentNum.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
        }

        /* Posição inicial sem transition */
        track.style.transition = 'none';
        requestAnimationFrame(function () {
            track.style.transform = 'translateX(' + calcOffset(0) + 'px)';
        });
    }

    /* Recalcula ao redimensionar */
    var resizeT;
    window.addEventListener('resize', function () {
        clearTimeout(resizeT);
        resizeT = setTimeout(function () {
            track.style.transition = 'none';
            track.style.transform  = 'translateX(' + calcOffset(current) + 'px)';
        }, 160);
    }, { passive: true });


    /* ══════════════════════════════════════════════════════
       AUTO-PLAY — avança a cada 6s, pausa no hover
    ══════════════════════════════════════════════════════ */
    var timer;
    var paused = false;

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(function () {
            if (!paused) goTo(current + 1);
        }, 6000);
    }
    function resetTimer() { clearInterval(timer); startTimer(); }

    section.addEventListener('mouseenter', function () { paused = true;  });
    section.addEventListener('mouseleave', function () { paused = false; });


    /* ══════════════════════════════════════════════════════
       EVENTOS DE INTERAÇÃO
    ══════════════════════════════════════════════════════ */

    /* Setas */
    navPrev.addEventListener('click', function () { goTo(current - 1); resetTimer(); });
    navNext.addEventListener('click', function () { goTo(current + 1); resetTimer(); });

    /* Clicar em card lateral ativa ele */
    slides.forEach(function (slide, i) {
        slide.addEventListener('click', function () {
            if (i !== current) { goTo(i); resetTimer(); }
        });
    });

    /* Swipe touch */
    var tx = 0, ty = 0;
    section.addEventListener('touchstart', function (e) {
        tx = e.touches[0].clientX;
        ty = e.touches[0].clientY;
    }, { passive: true });
    section.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - tx;
        var dy = e.changedTouches[0].clientY - ty;
        if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) {
            goTo(dx < 0 ? current + 1 : current - 1);
            resetTimer();
        }
    }, { passive: true });

    /* Teclado (só quando a seção está visível) */
    document.addEventListener('keydown', function (e) {
        var r = section.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        if (e.key === 'ArrowLeft')  { goTo(current - 1); resetTimer(); }
        if (e.key === 'ArrowRight') { goTo(current + 1); resetTimer(); }
    });


    /* ══════════════════════════════════════════════════════
       REVEAL AO SCROLL
       Anima os elementos do sidebar ao entrar na viewport.
    ══════════════════════════════════════════════════════ */
    var revealEls = Array.prototype.slice.call(
        document.querySelectorAll('[data-dp-reveal]')
    );
    var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                /* Delay escalonado por ordem no DOM */
                var idx = revealEls.indexOf(e.target);
                setTimeout(function () {
                    e.target.classList.add('dp-visible');
                }, idx * 90);
                revealObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.25 });
    revealEls.forEach(function (el) { revealObs.observe(el); });


    /* ══════════════════════════════════════════════════════
       EXECUTA
       Aguarda load completo para medir larguras corretas.
    ══════════════════════════════════════════════════════ */
    if (document.readyState === 'complete') {
        init(); startTimer();
    } else {
        window.addEventListener('load', function () { init(); startTimer(); });
    }

})();