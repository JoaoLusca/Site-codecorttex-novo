/* ============================================================
   MAIN.JS — Code Corttex
   ============================================================
   Arquivo único consolidado com todos os módulos de interação.
   Estrutura:
   ┌─ 0a. HEADER SCROLL (original desaparece, compacto aparece)
   ├─ 0b. MENU HAMBÚRGUER MOBILE
   ├─ 1. CURSOR CUSTOMIZADO
   ├─ 2. VIDEO TRANSITION (hero)
   ├─ 3. SPOTLIGHT (efeito dramático)
   ├─ 4. SEÇÃO SOBRE (reveal + contadores + parallax)
   ├─ 5. SEÇÃO MÉTODO — RODA INTERATIVA
   ├─ 6. SEÇÃO DEPOIMENTOS — CARROSSEL
   ├─ 7. SEÇÃO PORTFÓLIO — CASES
   ├─ 8. SEÇÃO FAQ — ACCORDION + FORMULÁRIO
   ├─ 9. SEÇÃO CTA
   └─ 10. FOOTER (botão topo + logo scroll-driven)
   ============================================================ */

/* ============================================================
   0a. HEADER — comportamento de scroll
   ============================================================
   LÓGICA:
   - No topo (scrollY < THRESHOLD): header original visível,
     compacto invisível
   - Ao rolar (scrollY >= THRESHOLD): header original faz
     fade-out + slide-up, depois compacto faz slide-down + fade-in
   - Ao voltar ao topo: estado original restaurado
   - Quando footer visível: volta ao estado inicial
   ============================================================ */
(function () {
    'use strict';

    var headerMain    = document.getElementById('headerMain');
    var headerCompact = document.getElementById('headerCompact');
    if (!headerMain || !headerCompact) return;

    var THRESHOLD = 80; /* px de scroll para ativar a troca */
    var isCompact = false;
    var footerVisible = false;
    var ticking   = false;

    function updateHeader() {
        var y = window.scrollY || window.pageYOffset || 0;

        /* No mobile (≤768px): header principal sempre visível, sem troca */
        if (window.innerWidth <= 768) {
            headerMain.classList.remove('header-hidden');
            headerCompact.classList.remove('compact-visible');
            isCompact = false;
            updateActiveLink();
            ticking = false;
            return;
        }

        if (footerVisible) {
            // Quando footer está visível, força estado inicial
            if (isCompact) {
                isCompact = false;
                headerCompact.classList.remove('compact-visible');
                setTimeout(function () {
                    headerMain.classList.remove('header-hidden');
                }, 200);
            }
        } else {
            // Lógica normal
            if (y >= THRESHOLD && !isCompact) {
                isCompact = true;
                headerMain.classList.add('header-hidden');
                /* Delay pequeno para o fade-out do original antes do compacto aparecer */
                setTimeout(function () {
                    headerCompact.classList.add('compact-visible');
                }, 180);

            } else if (y < THRESHOLD && isCompact) {
                isCompact = false;
                headerCompact.classList.remove('compact-visible');
                /* Aguarda o compacto sumir antes de restaurar o original */
                setTimeout(function () {
                    headerMain.classList.remove('header-hidden');
                }, 200);
            }
        }

        /* Atualiza link ativo no header compacto */
        updateActiveLink();

        ticking = false;
    }

    /* Marca o link ativo com base na seção visível */
    function updateActiveLink() {
        var sections = document.querySelectorAll('section[id], div[id]');
        var links    = headerCompact.querySelectorAll('.hc-nav a');
        var current  = '';
        var scrollY  = window.scrollY || 0;

        sections.forEach(function (sec) {
            if (sec.offsetTop - 120 <= scrollY) {
                current = '#' + sec.id;
            }
        });

        links.forEach(function (link) {
            link.classList.toggle('hc-active', link.getAttribute('href') === current);
        });
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }

    // IntersectionObserver para o footer
    var footer = document.getElementById('footer');
    if (footer) {
        var footerObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                footerVisible = entry.isIntersecting;
                updateHeader(); // Atualiza imediatamente quando footer entra/sai
            });
        }, { threshold: 0.1 }); // 10% visível
        footerObserver.observe(footer);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateHeader(); /* Estado inicial */

})();


/* ============================================================
   0b. MENU HAMBÚRGUER MOBILE
   ============================================================ */
(function () {
    'use strict';

    var btn    = document.getElementById('hamburgerBtn');
    var drawer = document.getElementById('mobileDrawer');
    if (!btn || !drawer) return;

    var isOpen = false;

    function openDrawer() {
        isOpen = true;
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        drawer.classList.add('drawer-open');
        document.body.style.overflow = 'hidden'; /* Trava scroll */
    }

    function closeDrawer() {
        isOpen = false;
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        drawer.classList.remove('drawer-open');
        document.body.style.overflow = '';
    }

    /* Expõe closeDrawer globalmente para o onclick inline */
    window.closeDrawer = closeDrawer;

    btn.addEventListener('click', function () {
        if (isOpen) closeDrawer();
        else openDrawer();
    });

    /* Fecha ao pressionar Escape */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) closeDrawer();
    });

    /* Fecha ao clicar fora do drawer (no overlay) */
    drawer.addEventListener('click', function (e) {
        if (e.target === drawer) closeDrawer();
    });

})();


/* ============================================================
   1. CURSOR CUSTOMIZADO
   ============================================================ */
(function () {
    'use strict';

    var cur  = document.getElementById('cur');
    var curR = document.getElementById('cur-r');
    if (!cur || !curR) return;

    var mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', function (e) {
        mx = e.clientX;
        my = e.clientY;
    }, { passive: true });

    (function loop() {
        cur.style.left  = mx + 'px';
        cur.style.top   = my + 'px';
        rx += (mx - rx) * 0.11;
        ry += (my - ry) * 0.11;
        curR.style.left = rx + 'px';
        curR.style.top  = ry + 'px';
        requestAnimationFrame(loop);
    })();

    /* Hover state */
    var hovEls = document.querySelectorAll('a, button, .sc, .dpcard, .cc, .dc, .ppc');
    hovEls.forEach(function (el) {
        el.addEventListener('mouseenter', function () { document.body.classList.add('h'); },    { passive: true });
        el.addEventListener('mouseleave', function () { document.body.classList.remove('h'); }, { passive: true });
    });

    /* Atualiza variáveis CSS do spotlight */
    document.addEventListener('mousemove', function (e) {
        document.documentElement.style.setProperty('--x', e.clientX + 'px');
        document.documentElement.style.setProperty('--y', e.clientY + 'px');
    }, { passive: true });

})();


/* ============================================================
   2. VIDEO TRANSITION (fade no loop do hero)
   ============================================================ */
(function () {
    'use strict';

    var video = document.querySelector('.hero-video');
    if (!video) return;

    video.addEventListener('timeupdate', function () {
        var restante = video.duration - video.currentTime;
        if (restante < 0.6 && !video.classList.contains('video-fade')) {
            video.classList.add('video-fade');
        }
    });

    video.addEventListener('seeked', function () {
        video.classList.remove('video-fade');
        void video.offsetWidth; /* Força reflow para reiniciar animation */
    });

    video.addEventListener('play', function () {
        setTimeout(function () {
            video.classList.remove('video-fade');
        }, 1000);
    });

})();


/* ============================================================
   3. SPOTLIGHT — efeito dramático na seção de dor
   ============================================================ */
(function () {
    'use strict';

    var trigger = document.querySelector('.spotlight-trigger');
    if (!trigger) return;

    /* Overlay criado dinamicamente */
    var overlay = document.createElement('div');
    overlay.className = 'spotlight-overlay';
    document.body.appendChild(overlay);

    trigger.addEventListener('mouseenter', function () {
        document.body.classList.add('spotlight-active');
    });
    trigger.addEventListener('mouseleave', function () {
        document.body.classList.remove('spotlight-active');
    });

})();


/* ============================================================
   4. SEÇÃO SOBRE — reveal + contadores animados + parallax
   ============================================================ */
(function () {
    'use strict';

    /* ── Reveal ao scroll ── */
    var sbRevealEls = document.querySelectorAll('[data-sb-reveal]');
    var sbRevealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var delay = parseInt(entry.target.dataset.sbDelay || '0', 10);
            setTimeout(function () {
                entry.target.classList.add('sb-visible');
            }, delay);
            sbRevealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.15 });
    sbRevealEls.forEach(function (el) { sbRevealObserver.observe(el); });

    /* ── Contadores animados ── */
    function sbAnimateCounter(numEl, target, prefix, suffix) {
        var duration  = 1800;
        var startTime = performance.now();
        function update(now) {
            var progress = Math.min((now - startTime) / duration, 1);
            var ease     = 1 - Math.pow(1 - progress, 3);
            numEl.innerHTML = prefix + Math.round(ease * target) + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    var sbStatCards = document.querySelectorAll('.sb-stat-card[data-sb-stat-value]');
    var sbStatObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var card   = entry.target;
            var numEl  = card.querySelector('.sb-stat-number');
            var target = parseInt(card.dataset.sbStatValue, 10);
            var prefix = card.dataset.sbStatPrefix || '';
            var suffix = card.dataset.sbStatSuffix || '';
            var delay  = parseInt(card.dataset.sbDelay || '0', 10);
            if (numEl) {
                numEl.innerHTML = prefix + '0' + suffix;
                setTimeout(function () {
                    sbAnimateCounter(numEl, target, prefix, suffix);
                }, delay + 200);
            }
            sbStatObserver.unobserve(card);
        });
    }, { threshold: 0.5 });
    sbStatCards.forEach(function (card) { sbStatObserver.observe(card); });

    /* ── Parallax no número fantasma ── */
    var sbGhost = document.querySelector('.sb-ghost-number');
    if (sbGhost) {
        window.addEventListener('scroll', function () {
            requestAnimationFrame(function () {
                sbGhost.style.transform =
                    'translateY(' + (window.scrollY * 0.15) + 'px) rotate(-2deg)';
            });
        }, { passive: true });
    }

})();


/* ============================================================
   5. SEÇÃO MÉTODO — roda SVG interativa + tabs
   ============================================================ */
(function () {
    'use strict';

    var VB  = 500, CX = 250, CY = 250;
    var R1  = 238, R2 = 168, R3 = 148, R4 = 120, R5 = 95, R5I = 78;
    var GAP = 3.5;
    var ARC_ACTIVE_OFFSET = 14;
    var currentStep = 0;

    var wheelContainer = document.getElementById('mtWheelContainer');
    var icons          = Array.prototype.slice.call(document.querySelectorAll('[data-mt-icon]'));
    var tabs           = Array.prototype.slice.call(document.querySelectorAll('[data-mt-tab]'));
    var panels         = Array.prototype.slice.call(document.querySelectorAll('[data-mt-panel]'));
    var revealEls      = Array.prototype.slice.call(document.querySelectorAll('[data-mt-reveal]'));

    if (!wheelContainer) return;

    function deg2rad(d) { return d * Math.PI / 180; }

    function pt(r, angleDeg) {
        var rad = deg2rad(angleDeg - 90);
        return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
    }

    function arcPath(startDeg, endDeg, rOuter, rInner) {
        var s = startDeg + GAP / 2, e = endDeg - GAP / 2;
        var p1 = pt(rOuter, s), p2 = pt(rOuter, e);
        var p3 = pt(rInner, e), p4 = pt(rInner, s);
        var la = (e - s) > 180 ? 1 : 0;
        return ['M', p1.x, p1.y, 'A', rOuter, rOuter, 0, la, 1, p2.x, p2.y,
                'L', p3.x, p3.y, 'A', rInner, rInner, 0, la, 0, p4.x, p4.y, 'Z'].join(' ');
    }

    function arcMid(s, e, r) { return pt(r, (s + e) / 2); }

    function radialTranslate(midAngleDeg, dist) {
        var rad = deg2rad(midAngleDeg - 90);
        return { x: dist * Math.cos(rad), y: dist * Math.sin(rad) };
    }

    function buildWheel() {
        var ns  = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 ' + VB + ' ' + VB);
        svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
        svg.setAttribute('class', 'mt-wheel-svg'); svg.setAttribute('id', 'mtWheelSVG');
        svg.setAttribute('aria-hidden', 'true'); svg.style.overflow = 'visible';

        var defs = document.createElementNS(ns, 'defs');

        /* Gradiente ativo */
        var ga = document.createElementNS(ns, 'radialGradient');
        ga.id = 'mtArcGrad';
        ga.setAttribute('cx', '50%'); ga.setAttribute('cy', '50%'); ga.setAttribute('r', '50%');
        [{ off: '0%', color: '#c94aff' }, { off: '60%', color: '#9010d0' }, { off: '100%', color: '#5a0880' }]
            .forEach(function (s) {
                var stop = document.createElementNS(ns, 'stop');
                stop.setAttribute('offset', s.off); stop.setAttribute('stop-color', s.color);
                ga.appendChild(stop);
            });
        defs.appendChild(ga);

        /* Gradiente inativo */
        var gi = document.createElementNS(ns, 'radialGradient');
        gi.id = 'mtArcGradInactive';
        gi.setAttribute('cx', '50%'); gi.setAttribute('cy', '50%'); gi.setAttribute('r', '50%');
        [{ off: '0%', color: '#28103e' }, { off: '100%', color: '#120820' }]
            .forEach(function (s) {
                var stop = document.createElementNS(ns, 'stop');
                stop.setAttribute('offset', s.off); stop.setAttribute('stop-color', s.color);
                gi.appendChild(stop);
            });
        defs.appendChild(gi);

        /* Filtro glow */
        var flt = document.createElementNS(ns, 'filter');
        flt.id = 'mtGlowActive';
        flt.setAttribute('x', '-30%'); flt.setAttribute('y', '-30%');
        flt.setAttribute('width', '160%'); flt.setAttribute('height', '160%');
        var fb = document.createElementNS(ns, 'feGaussianBlur');
        fb.setAttribute('stdDeviation', '8'); fb.setAttribute('result', 'blur');
        var fco = document.createElementNS(ns, 'feColorMatrix');
        fco.setAttribute('in', 'blur'); fco.setAttribute('type', 'matrix');
        fco.setAttribute('values', '0 0 0 0 0.7  0 0 0 0 0.14  0 0 0 0 1  0 0 0 1 0');
        fco.setAttribute('result', 'glow');
        var fm = document.createElementNS(ns, 'feMerge');
        ['glow', 'SourceGraphic'].forEach(function (inp) {
            var n = document.createElementNS(ns, 'feMergeNode');
            n.setAttribute('in', inp); fm.appendChild(n);
        });
        flt.appendChild(fb); flt.appendChild(fco); flt.appendChild(fm);
        defs.appendChild(flt);
        svg.appendChild(defs);

        /* Halo externo */
        var halo = document.createElementNS(ns, 'circle');
        halo.setAttribute('cx', CX); halo.setAttribute('cy', CY); halo.setAttribute('r', R1 + 6);
        halo.setAttribute('fill', 'none'); halo.setAttribute('stroke', 'rgba(180,36,251,0.04)');
        halo.setAttribute('stroke-width', '1'); svg.appendChild(halo);

        /* 4 arcos */
        var arcGroups = [];
        var ARC_START_OFFSET = 225;
        for (var i = 0; i < 4; i++) {
            var startDeg = ARC_START_OFFSET + i * 90;
            var endDeg   = startDeg + 90;
            var midAngle = (startDeg + endDeg) / 2;
            var g = document.createElementNS(ns, 'g');
            g.setAttribute('class', 'mt-arc-group' + (i === 0 ? ' mt-arc-active' : ''));
            g.setAttribute('data-mt-arc', i);
            g.setAttribute('data-mid-angle', midAngle);
            var off = (i === 0) ? radialTranslate(midAngle, ARC_ACTIVE_OFFSET) : { x: 0, y: 0 };
            g.style.transform  = 'translate(' + off.x + 'px,' + off.y + 'px)';
            g.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1)';

            var path = document.createElementNS(ns, 'path');
            path.setAttribute('class', 'mt-arc-path');
            path.setAttribute('d', arcPath(startDeg, endDeg, R1, R2));
            path.setAttribute('fill', i === 0 ? 'url(#mtArcGrad)' : 'url(#mtArcGradInactive)');
            if (i === 0) path.setAttribute('filter', 'url(#mtGlowActive)');

            var mid   = arcMid(startDeg, endDeg, (R1 + R2) / 2);
            var numEl = document.createElementNS(ns, 'text');
            numEl.setAttribute('x', mid.x); numEl.setAttribute('y', mid.y);
            numEl.setAttribute('text-anchor', 'middle'); numEl.setAttribute('dominant-baseline', 'middle');
            numEl.setAttribute('class', 'mt-arc-num'); numEl.setAttribute('data-mt-arc-num', i);
            numEl.setAttribute('transform', 'rotate(' + midAngle + ' ' + mid.x + ' ' + mid.y + ')');
            numEl.textContent = (i < 9 ? '0' : '') + (i + 1);

            g.appendChild(path); g.appendChild(numEl);
            svg.appendChild(g); arcGroups.push(g);
        }

        /* Anéis decorativos */
        [{ r: R3, stroke: 'rgba(180,36,251,0.10)', sw: 1 }, { r: R4, stroke: 'rgba(180,36,251,0.06)', sw: 1 }]
            .forEach(function (ring) {
                var c = document.createElementNS(ns, 'circle');
                c.setAttribute('cx', CX); c.setAttribute('cy', CY); c.setAttribute('r', ring.r);
                c.setAttribute('fill', 'none'); c.setAttribute('stroke', ring.stroke);
                c.setAttribute('stroke-width', ring.sw); c.setAttribute('pointer-events', 'none');
                svg.appendChild(c);
            });

        /* Círculo central */
        var cc = document.createElementNS(ns, 'circle');
        cc.setAttribute('cx', CX); cc.setAttribute('cy', CY); cc.setAttribute('r', R5);
        cc.setAttribute('fill', '#0d0b18'); cc.setAttribute('stroke', 'rgba(180,36,251,0.22)');
        cc.setAttribute('stroke-width', '1.5'); cc.setAttribute('pointer-events', 'none');
        svg.appendChild(cc);

        var ci = document.createElementNS(ns, 'circle');
        ci.setAttribute('cx', CX); ci.setAttribute('cy', CY); ci.setAttribute('r', R5I);
        ci.setAttribute('fill', 'none'); ci.setAttribute('stroke', 'rgba(180,36,251,0.07)');
        ci.setAttribute('stroke-width', '1'); ci.setAttribute('pointer-events', 'none');
        svg.appendChild(ci);

        return { svg: svg, arcGroups: arcGroups };
    }

    var wheel = buildWheel();
    wheelContainer.insertBefore(wheel.svg, wheelContainer.firstChild);
    var arcGroups = wheel.arcGroups;

    function activateStep(newStep) {
        if (newStep === currentStep) return;
        var oldStep = currentStep;
        currentStep = newStep;

        arcGroups.forEach(function (g, i) {
            var midAngle = parseFloat(g.getAttribute('data-mid-angle'));
            var isActive = (i === newStep);
            g.classList.toggle('mt-arc-active', isActive);
            var off = isActive ? radialTranslate(midAngle, ARC_ACTIVE_OFFSET) : { x: 0, y: 0 };
            g.style.transform = 'translate(' + off.x + 'px,' + off.y + 'px)';
            var p = g.querySelector('.mt-arc-path');
            if (p) {
                p.setAttribute('fill', isActive ? 'url(#mtArcGrad)' : 'url(#mtArcGradInactive)');
                if (isActive) p.setAttribute('filter', 'url(#mtGlowActive)');
                else          p.removeAttribute('filter');
            }
        });

        var oldIcon = icons[oldStep], newIcon = icons[newStep];
        if (oldIcon) {
            oldIcon.classList.add('mt-icon-exit');
            setTimeout(function () { oldIcon.classList.remove('mt-icon-active', 'mt-icon-exit'); }, 320);
        }
        if (newIcon) { setTimeout(function () { newIcon.classList.add('mt-icon-active'); }, 120); }

        tabs.forEach(function (tab, i) {
            tab.classList.toggle('mt-tab-active', i === newStep);
            tab.setAttribute('aria-selected', i === newStep ? 'true' : 'false');
        });

        var oldPanel = panels[oldStep], newPanel = panels[newStep];
        oldPanel.classList.remove('mt-panel-active'); oldPanel.classList.add('mt-panel-exit');
        setTimeout(function () { oldPanel.classList.remove('mt-panel-exit'); oldPanel.style.position = ''; }, 480);
        newPanel.classList.add('mt-panel-active');
    }

    wheel.svg.addEventListener('click', function (e) {
        var g = e.target.closest('[data-mt-arc]');
        if (g) activateStep(parseInt(g.getAttribute('data-mt-arc'), 10));
    });
    wheel.svg.addEventListener('mouseover', function (e) {
        wheel.svg.style.cursor = e.target.closest('[data-mt-arc]') ? 'pointer' : 'default';
    });
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            activateStep(parseInt(tab.getAttribute('data-mt-tab'), 10));
        });
    });

    var mtRevObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('mt-visible'); mtRevObs.unobserve(e.target); }
        });
    }, { threshold: 0.2 });
    revealEls.forEach(function (el) { mtRevObs.observe(el); });

})();


/* ============================================================
   6. SEÇÃO DEPOIMENTOS — carrossel orbital com loop infinito
   ============================================================
   TÉCNICA: Clone infinito com flag explícita de "estou num clone"

   Track:  [cloneLast · S0 · S1 · S2 · cloneFirst]
   índices:      0      1    2    3        4

   `current`    = índice real (0 a TOTAL-1), nunca muda de semântica
   `trackPos`   = índice corrente no track (inclui clones)

   Fluxo do loop:
     1. Navega animado para cloneFirst (trackPos = TOTAL+1) ou
        cloneLast (trackPos = 0)
     2. transitionend detecta via flag `pendingSnap`
     3. Desliga transição, salta para o real sem piscar
   ============================================================ */
(function () {
    'use strict';

    var section    = document.querySelector('.depoimentos');
    var track      = document.getElementById('dpTrack');
    var colOuter   = document.getElementById('dpCarouselCol');
    var dotsRow    = document.getElementById('dpDotsRow');
    var navPrev    = document.getElementById('dpNavPrev');
    var navNext    = document.getElementById('dpNavNext');
    var currentNum = document.getElementById('dpCurrentNum');
    var totalNum   = document.getElementById('dpTotalNum');

    if (!section || !track) return;

    /* ── Slides reais ────────────────────────────────────────── */
    var realSlides = Array.prototype.slice.call(track.querySelectorAll('.dp-slide'));
    var TOTAL      = realSlides.length;
    if (TOTAL < 2) return;

    var SLIDE_GAP = 24;   /* px — mesmo valor do gap CSS */
    var current   = 0;    /* índice real ativo (0 … TOTAL-1) */
    var trackPos  = 1;    /* posição no track com clones (1 = S0 no início) */
    var busy      = false;
    var pendingSnap = false; /* true quando animamos para um clone */
    var snapToTrack = 0;     /* trackPos real para o qual vamos pular */

    /* ── Injeta clones ───────────────────────────────────────── */
    /* Track final: [cLast, S0, S1, …, S(n-1), cFirst] */
    var cFirst = realSlides[0].cloneNode(true);
    var cLast  = realSlides[TOTAL - 1].cloneNode(true);
    cFirst.setAttribute('aria-hidden', 'true');
    cLast.setAttribute('aria-hidden', 'true');
    cFirst.classList.add('dp-clone');
    cLast.classList.add('dp-clone');
    track.appendChild(cFirst);
    track.insertBefore(cLast, realSlides[0]);

    /* Array com TODOS os slides (inclui clones) */
    var all = Array.prototype.slice.call(track.querySelectorAll('.dp-slide'));
    /* all = [cLast, S0, S1, …, S(n-1), cFirst]  — tamanho TOTAL+2 */

    /* ── Calcula translateX para centralizar um trackPos ─────── */
    function offsetFor(tp) {
        if (!colOuter) return 0;
        var W   = colOuter.offsetWidth;
        var el  = all[tp];
        if (!el) return 0;
        var pos = 0;
        for (var i = 0; i < tp; i++) {
            pos += (all[i] ? all[i].offsetWidth : 0) + SLIDE_GAP;
        }
        return (W / 2) - (el.offsetWidth / 2) - pos;
    }

    /* ── Aplica estados orbitais sem mexer em transition ──────── */
    function applyOrbits(activeTp) {
        all.forEach(function (slide, i) {
            var d = i - activeTp;
            slide.classList.remove('dp-slide-active', 'dp-orbit-adj', 'dp-orbit-far');

            if (d === 0) {
                slide.classList.add('dp-slide-active');
                slide.style.transform     = 'scale(1)';
                slide.style.opacity       = '1';
                slide.style.filter        = 'none';
                slide.style.zIndex        = '5';
            } else if (Math.abs(d) === 1) {
                slide.classList.add('dp-orbit-adj');
                slide.style.transform     = 'scale(0.82) translateX(' + (d > 0 ? '18px' : '-18px') + ')';
                slide.style.opacity       = '0.45';
                slide.style.filter        = 'blur(3px)';
                slide.style.zIndex        = '3';
            } else {
                slide.classList.add('dp-orbit-far');
                slide.style.transform     = 'scale(0.65)';
                slide.style.opacity       = '0.12';
                slide.style.filter        = 'blur(8px)';
                slide.style.zIndex        = '1';
            }
        });
    }

    /* ── Move track ──────────────────────────────────────────── */
    function moveTo(tp, animate) {
        if (!animate) {
            /* Força reflow para garantir que a remoção da transição seja aplicada
               antes de mudar o transform — evita o flash */
            track.style.transition = 'none';
            track.getBoundingClientRect(); /* reflow */
        } else {
            track.style.transition = 'transform 0.68s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        track.style.transform = 'translateX(' + offsetFor(tp) + 'px)';
    }

    /* ── Navegação principal ─────────────────────────────────── */
    function goTo(newReal, dir) {
        if (busy) return;

        newReal = ((newReal % TOTAL) + TOTAL) % TOTAL;

        var toTp;
        pendingSnap  = false;

        if (dir === 'next' && newReal === 0) {
            /* Último → primeiro: anima para cFirst (fim do track) */
            toTp         = TOTAL + 1;
            pendingSnap  = true;
            snapToTrack  = 1; /* depois salta para S0 */
        } else if (dir === 'prev' && newReal === TOTAL - 1) {
            /* Primeiro → último: anima para cLast (início do track) */
            toTp         = 0;
            pendingSnap  = true;
            snapToTrack  = TOTAL; /* depois salta para S(n-1) */
        } else {
            toTp = newReal + 1;
        }

        busy     = true;
        current  = newReal;
        trackPos = toTp;

        applyOrbits(toTp);
        moveTo(toTp, true);
        updateDots();
        updateCounter();
    }

    /* ── transitionend: só ouve o transform DO TRACK ─────────── */
    track.addEventListener('transitionend', function (e) {
        /* Ignora eventos de outros elementos filhos (opacity, filter…) */
        if (e.target !== track) return;
        if (e.propertyName !== 'transform') return;

        busy = false;

        if (pendingSnap) {
            pendingSnap = false;
            trackPos    = snapToTrack;

            /* Desliga transition em TODOS os slides antes do teleporte.
               Sem isso, o CSS transition de 0.68s anima os slides saindo
               do estado do clone, criando o flash de "sumir e reaparecer". */
            all.forEach(function (s) { s.style.transition = 'none'; });

            /* Aplica estilos orbitais finais instantaneamente */
            applyOrbits(trackPos);

            /* Pula o track para a posicao real sem animacao */
            moveTo(trackPos, false);

            /* Forca reflow: o browser aplica tudo acima antes de reativar */
            track.getBoundingClientRect();

            /* Reativa transitions nos slides para as proximas navegacoes */
            all.forEach(function (s) { s.style.transition = ''; });
        }
    });

    /* ── Dots ────────────────────────────────────────────────── */
    function buildDots() {
        if (!dotsRow) return;
        dotsRow.innerHTML = '';
        for (var i = 0; i < TOTAL; i++) {
            (function (idx) {
                var btn = document.createElement('button');
                btn.className = 'dp-dot' + (idx === 0 ? ' dp-dot-active' : '');
                btn.setAttribute('role', 'tab');
                btn.setAttribute('aria-label', 'Depoimento ' + (idx + 1));
                btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
                btn.addEventListener('click', function () {
                    if (idx === current) return;
                    goTo(idx, idx > current ? 'next' : 'prev');
                    resetTimer();
                });
                dotsRow.appendChild(btn);
            })(i);
        }
    }

    function updateDots() {
        if (!dotsRow) return;
        Array.prototype.forEach.call(dotsRow.querySelectorAll('.dp-dot'), function (dot, i) {
            var on = (i === current);
            dot.classList.toggle('dp-dot-active', on);
            dot.setAttribute('aria-selected', on ? 'true' : 'false');
        });
    }

    /* ── Contador ────────────────────────────────────────────── */
    function updateCounter() {
        var n = (current + 1 < 10 ? '0' : '') + (current + 1);
        if (currentNum) {
            currentNum.style.opacity   = '0';
            currentNum.style.transform = 'translateY(-6px)';
            setTimeout(function () {
                currentNum.textContent     = n;
                currentNum.style.opacity   = '1';
                currentNum.style.transform = 'translateY(0)';
            }, 180);
        }
        if (totalNum) totalNum.textContent = '/ ' + (TOTAL < 10 ? '0' : '') + TOTAL;
    }

    /* ── Init ────────────────────────────────────────────────── */
    function init() {
        track.style.gap = SLIDE_GAP + 'px';
        buildDots();

        if (currentNum) currentNum.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        updateCounter();

        /* Começa em S0 (trackPos = 1) sem animação */
        applyOrbits(1);
        moveTo(1, false);
    }

    /* Resize */
    var resizeT;
    window.addEventListener('resize', function () {
        clearTimeout(resizeT);
        resizeT = setTimeout(function () { moveTo(trackPos, false); }, 160);
    }, { passive: true });

    /* ── Autoplay ────────────────────────────────────────────── */
    var timer, paused = false;
    function startTimer() {
        clearInterval(timer);
        timer = setInterval(function () { if (!paused) goTo(current + 1, 'next'); }, 6000);
    }
    function resetTimer() { clearInterval(timer); startTimer(); }

    section.addEventListener('mouseenter', function () { paused = true; });
    section.addEventListener('mouseleave', function () { paused = false; });

    /* ── Botões ──────────────────────────────────────────────── */
    if (navPrev) navPrev.addEventListener('click', function () { goTo(current - 1, 'prev'); resetTimer(); });
    if (navNext) navNext.addEventListener('click', function () { goTo(current + 1, 'next'); resetTimer(); });

    /* Clique em slide adjacente */
    all.forEach(function (slide, tp) {
        slide.addEventListener('click', function () {
            if (slide.classList.contains('dp-clone')) return;
            var ri = tp - 1;
            if (ri !== current) { goTo(ri, ri > current ? 'next' : 'prev'); resetTimer(); }
        });
    });

    /* Swipe */
    var tx = 0, ty = 0;
    section.addEventListener('touchstart', function (e) {
        tx = e.touches[0].clientX; ty = e.touches[0].clientY;
    }, { passive: true });
    section.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - tx;
        var dy = e.changedTouches[0].clientY - ty;
        if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) {
            goTo(dx < 0 ? current + 1 : current - 1, dx < 0 ? 'next' : 'prev');
            resetTimer();
        }
    }, { passive: true });

    /* Teclado */
    document.addEventListener('keydown', function (e) {
        var r = section.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        if (e.key === 'ArrowLeft')  { goTo(current - 1, 'prev'); resetTimer(); }
        if (e.key === 'ArrowRight') { goTo(current + 1, 'next'); resetTimer(); }
    });

    /* Reveal sidebar */
    var dpRevEls = Array.prototype.slice.call(document.querySelectorAll('[data-dp-reveal]'));
    var dpObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                var idx = dpRevEls.indexOf(e.target);
                setTimeout(function () { e.target.classList.add('dp-visible'); }, idx * 90);
                dpObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.25 });
    dpRevEls.forEach(function (el) { dpObs.observe(el); });

    if (document.readyState === 'complete') { init(); startTimer(); }
    else { window.addEventListener('load', function () { init(); startTimer(); }); }

})();


/* ============================================================
   7. SEÇÃO PORTFÓLIO — reveal + paralaxe
   ============================================================ */
(function () {
    'use strict';

    var section = document.querySelector('.portfolio');
    if (!section) return;

    /* Reveal */
    var pfRevEls = Array.prototype.slice.call(section.querySelectorAll('[data-pf-reveal]'));
    var pfRevObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el    = entry.target;
            var delay = parseInt(el.getAttribute('data-pf-delay') || '0', 10);
            setTimeout(function () { el.classList.add('pf-visible'); }, delay);
            pfRevObs.unobserve(el);
        });
    }, { threshold: 0.10 });
    pfRevEls.forEach(function (el) { pfRevObs.observe(el); });

    /* Paralaxe fundo dos cards */
    var STRENGTH = 10;
    section.addEventListener('mousemove', function (e) {
        var card = e.target.closest('.pf-card:not(.pf-card-soon)');
        if (!card) return;
        var r = card.getBoundingClientRect();
        card.style.setProperty('--pf-rx', ((e.clientX - r.left) / r.width  - 0.5) * STRENGTH + 'px');
        card.style.setProperty('--pf-ry', ((e.clientY - r.top)  / r.height - 0.5) * STRENGTH + 'px');
    }, { passive: true });
    section.addEventListener('mouseout', function (e) {
        var card = e.target.closest('.pf-card:not(.pf-card-soon)');
        if (card && !card.contains(e.relatedTarget)) {
            card.style.removeProperty('--pf-rx'); card.style.removeProperty('--pf-ry');
        }
    }, { passive: true });
    section.addEventListener('mouseleave', function () {
        section.querySelectorAll('.pf-card:not(.pf-card-soon)').forEach(function (c) {
            c.style.removeProperty('--pf-rx'); c.style.removeProperty('--pf-ry');
        });
    }, { passive: true });

})();


/* ============================================================
   8. SEÇÃO FAQ — accordion + formulário Formspree
   ============================================================ */
(function () {
    'use strict';

    var section = document.querySelector('.faq-section');
    if (!section) return;

    /* Reveal */
    var fqRevEls = Array.prototype.slice.call(section.querySelectorAll('[data-fq-reveal]'));
    var fqRevObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el    = entry.target;
            var delay = parseInt(el.getAttribute('data-fq-delay') || '0', 10);
            setTimeout(function () { el.classList.add('fq-visible'); }, delay);
            fqRevObs.unobserve(el);
        });
    }, { threshold: 0.15 });
    fqRevEls.forEach(function (el) { fqRevObs.observe(el); });

    /* Accordion */
    var accordion = document.getElementById('fqAccordion');
    if (!accordion) return;

    var items = Array.prototype.slice.call(accordion.querySelectorAll('.fq-item'));
    var itemObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('fq-visible');
            itemObs.unobserve(entry.target);
        });
    }, { threshold: 0.1 });

    items.forEach(function (item, i) {
        item.style.setProperty('--fq-item-delay', (i * 60 + 200) + 'ms');
        itemObs.observe(item);

        var btn    = item.querySelector('.fq-question');
        var answer = item.querySelector('.fq-answer');
        var inner  = item.querySelector('.fq-answer-inner');
        if (!btn || !answer || !inner) return;

        btn.addEventListener('click', function () {
            var isOpen = item.classList.contains('fq-open');

            items.forEach(function (other) {
                if (other === item) return;
                var otherAnswer = other.querySelector('.fq-answer');
                other.classList.remove('fq-open');
                other.querySelector('.fq-question').setAttribute('aria-expanded', 'false');
                if (otherAnswer) otherAnswer.style.removeProperty('--fq-h');
            });

            if (isOpen) {
                item.classList.remove('fq-open');
                btn.setAttribute('aria-expanded', 'false');
                answer.style.removeProperty('--fq-h');
            } else {
                answer.style.setProperty('--fq-h', inner.scrollHeight + 'px');
                item.classList.add('fq-open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* Formulário Formspree */
    var form    = document.getElementById('fqForm');
    var submit  = document.getElementById('fqSubmit');
    var success = document.getElementById('fqSuccess');
    if (!form || !submit || !success) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var valid = true;
        Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (field) {
            if (!field.value.trim()) {
                valid = false;
                field.style.borderColor = 'rgba(251,100,36,0.6)';
                field.addEventListener('input', function () { field.style.borderColor = ''; }, { once: true });
            }
        });
        if (!valid) return;

        submit.classList.add('fq-loading'); submit.disabled = true;

        fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
            .then(function (res) {
                if (res.ok) {
                    form.style.display = 'none'; success.classList.add('fq-show');
                } else {
                    res.json().then(function (data) {
                        alert((data && data.errors) ? data.errors.map(function (e) { return e.message; }).join(', ') : 'Erro ao enviar.');
                        submit.classList.remove('fq-loading'); submit.disabled = false;
                    });
                }
            })
            .catch(function () {
                alert('Erro de conexão. Verifique sua internet.');
                submit.classList.remove('fq-loading'); submit.disabled = false;
            });
    });

})();


/* ============================================================
   9. SEÇÃO CTA
   ============================================================ */
(function () {
    'use strict';

    var section = document.querySelector('.ct-section');
    if (!section) return;

    /* Reveal */
    var ctRevEls = Array.prototype.slice.call(section.querySelectorAll('[data-ct-reveal]'));
    var ctRevObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el    = entry.target;
            var delay = parseInt(el.getAttribute('data-ct-delay') || '0', 10);
            setTimeout(function () { el.classList.add('ct-visible'); }, delay);
            ctRevObs.unobserve(el);
        });
    }, { threshold: 0.15 });
    ctRevEls.forEach(function (el) { ctRevObs.observe(el); });

    /* Title split */
    var titleEl = section.querySelector('[data-ct-title-split]');
    if (titleEl) {
        var fragments = [];
        Array.prototype.forEach.call(titleEl.childNodes, function (node) {
            if (node.nodeType === 3) {
                node.textContent.split(/(\s+)/).forEach(function (piece) {
                    if (!piece.trim()) return;
                    fragments.push({ html: piece, isWord: true });
                });
            } else if (node.nodeType === 1) {
                fragments.push({ html: node.tagName.toLowerCase() === 'br' ? '<br>' : node.outerHTML, isWord: node.tagName.toLowerCase() !== 'br' });
            }
        });

        var builtHTML = '';
        fragments.forEach(function (frag, i) {
            if (!frag.isWord) { builtHTML += frag.html; return; }
            builtHTML += '<span class="ct-word"><span class="ct-word-inner" data-ct-word-idx="' + i + '">' + frag.html + '</span></span> ';
        });
        titleEl.innerHTML = builtHTML;
        titleEl.classList.add('ct-title-ready');

        var wordInners = Array.prototype.slice.call(titleEl.querySelectorAll('.ct-word-inner'));
        var titleObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                wordInners.forEach(function (inner, idx) {
                    setTimeout(function () { inner.classList.add('ct-word-up'); }, idx * 80 + 150);
                });
                titleObs.unobserve(entry.target);
            });
        }, { threshold: 0.3 });
        titleObs.observe(titleEl);
    }

    /* Canvas partículas */
    var canvas = section.querySelector('.ct-canvas');
    if (canvas) {
        var ctx = canvas.getContext('2d');
        var animActive = false;
        var particles  = [];
        var COUNT      = 45;
        var COLORS     = [[180, 36, 251], [140, 20, 200], [220, 80, 255]];

        function resizeCanvas() {
            canvas.width  = section.offsetWidth;
            canvas.height = section.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas, { passive: true });

        function makeParticle(fromStart) {
            var cw = canvas.width, ch = canvas.height;
            var startY = fromStart ? ch * (0.5 + Math.random() * 0.5) : ch + 10;
            return {
                x: Math.random() * cw,
                y: startY, originY: startY,
                size:    0.8 + Math.random() * 2.2,
                speedY:  0.4 + Math.random() * 1.2,
                speedX:  (Math.random() - 0.5) * 0.5,
                opacity: 0.15 + Math.random() * 0.5,
                lifespan: ch * (0.4 + Math.random() * 0.6),
                rgb: COLORS[Math.floor(Math.random() * COLORS.length)]
            };
        }

        for (var k = 0; k < COUNT; k++) { particles.push(makeParticle(true)); }

        function drawFrame() {
            if (!animActive) return;
            var cw = canvas.width, ch = canvas.height;
            ctx.clearRect(0, 0, cw, ch);
            for (var j = 0; j < particles.length; j++) {
                var p = particles[j];
                p.y -= p.speedY; p.x += p.speedX;
                var progress = Math.max(0, (p.originY - p.y) / p.lifespan);
                var alpha;
                if      (progress < 0.2)  alpha = p.opacity * (progress / 0.2);
                else if (progress < 0.75) alpha = p.opacity;
                else                       alpha = p.opacity * (1 - (progress - 0.75) / 0.25);
                alpha = Math.max(0, Math.min(1, alpha));
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.shadowColor = 'rgba(' + p.rgb[0] + ',' + p.rgb[1] + ',' + p.rgb[2] + ', 0.8)';
                ctx.shadowBlur  = p.size * 5;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgb(' + p.rgb[0] + ',' + p.rgb[1] + ',' + p.rgb[2] + ')';
                ctx.fill(); ctx.restore();
                if (progress >= 1 || p.y < -20 || p.x < -20 || p.x > cw + 20) { particles[j] = makeParticle(false); }
            }
            requestAnimationFrame(drawFrame);
        }

        var canvasObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !animActive) { animActive = true; drawFrame(); }
                else if (!entry.isIntersecting) { animActive = false; }
            });
        }, { threshold: 0.05 });
        canvasObs.observe(section);
    }

    /* Mouse light no botão */
    var btnWa = section.querySelector('.ct-btn-wa');
    if (btnWa) {
        btnWa.addEventListener('mousemove', function (e) {
            var rect = btnWa.getBoundingClientRect();
            btnWa.style.setProperty('--ct-bx', ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%');
            btnWa.style.setProperty('--ct-by', ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%');
        }, { passive: true });
    }

    /* Halo parallax */
    var haloOuter = document.getElementById('ctHaloOuter');
    if (haloOuter) {
        var htX = 0, htY = 0, hcX = 0, hcY = 0;
        section.addEventListener('mousemove', function (e) {
            var rect = section.getBoundingClientRect();
            htX = (e.clientX - rect.left) / rect.width  - 0.5;
            htY = (e.clientY - rect.top)  / rect.height - 0.5;
        }, { passive: true });
        (function animateHalo() {
            hcX += (htX - hcX) * 0.04;
            hcY += (htY - hcY) * 0.04;
            haloOuter.style.transform = 'translateX(calc(-50% + ' + (hcX * 140).toFixed(2) + 'px)) translateY(' + (hcY * 80).toFixed(2) + 'px)';
            requestAnimationFrame(animateHalo);
        })();
    }

    /* Ripple nos botões */
    var styleTag = document.createElement('style');
    styleTag.textContent = '@keyframes ctRippleOut { 0% { transform:translate(-50%,-50%) scale(0); opacity:.5; } 100% { transform:translate(-50%,-50%) scale(6); opacity:0; } }';
    document.head.appendChild(styleTag);

    Array.prototype.slice.call(section.querySelectorAll('.ct-btn-wa, .ct-btn-portfolio'))
        .forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var rect   = btn.getBoundingClientRect();
                var ripple = document.createElement('span');
                ripple.style.cssText = 'position:absolute;left:' + (e.clientX - rect.left) + 'px;top:' + (e.clientY - rect.top) + 'px;width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.22);pointer-events:none;z-index:10;animation:ctRippleOut 0.7s ease-out forwards';
                btn.appendChild(ripple);
                setTimeout(function () { if (ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 720);
            });
        });

})();


/* ============================================================
   10. FOOTER — botão topo + logo scroll-driven
   ============================================================
   CORREÇÃO DO BUG DA LOGO:
   O problema original era que o site usa Locomotive Scroll,
   que captura o scroll nativo e dispara seus próprios eventos.
   O JS do footer escutava apenas window 'scroll', que o
   Locomotive não dispara da mesma forma.

   Solução: múltiplas estratégias combinadas:
   1. Listener no window.scroll (scroll nativo, quando disponível)
   2. Listener no #app (elemento do Locomotive Scroll)
   3. Polling via requestAnimationFrame (fallback universal)
   4. IntersectionObserver para detectar quando o footer está visível

   ALÉM DISSO: o stage não tinha overflow:visible no eixo Y para
   o conteúdo acima do bottom aparecer — corrigido com a variável
   CSS --ft-ty que o JS seta diretamente a 0 quando o footer
   está na tela (estado "completo"), independente do scroll.
   ============================================================ */
(function () {
    'use strict';

    var footer = document.querySelector('.ft-footer');
    if (!footer) return;

    /* Botão "voltar ao topo" */
    var topBtn = document.getElementById('ftTopBtn');
    if (topBtn) {
        topBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ── Logo scroll-driven ── */
    var stageEl = footer.querySelector('[data-ft-stage]');
    if (!stageEl) return;

    var parts = Array.prototype.slice.call(stageEl.querySelectorAll('[data-ft-part]'));
    parts.sort(function (a, b) {
        return parseInt(a.getAttribute('data-ft-part') || '0', 10) -
               parseInt(b.getAttribute('data-ft-part') || '0', 10);
    });
    if (parts.length === 0) return;

    var DROP_PERCENT  = 1.1;
    var STAGGER       = 0.08;
    var SCROLL_WINDOW = 0.8;
    var stageH = 0, dropPx = 0, ticking = false;

    function calcDimensions() {
        stageH = stageEl.offsetHeight;
        dropPx = stageH * DROP_PERCENT;
    }
    calcDimensions();

    function updateParts() {
        var stageRect = stageEl.getBoundingClientRect();
        var viewH     = window.innerHeight;
        var rawProg   = (viewH - stageRect.top) / (viewH + stageRect.height * SCROLL_WINDOW);
        var scrollProg = Math.max(0, Math.min(1, rawProg));

        for (var i = 0; i < parts.length; i++) {
            var partProg = Math.max(0, Math.min(1, scrollProg - i * STAGGER));
            var ty = dropPx * (1 - partProg);
            parts[i].style.setProperty('--ft-ty', ty.toFixed(2) + 'px');
        }
        ticking = false;
    }

    function onScroll() {
        if (!ticking) { requestAnimationFrame(updateParts); ticking = true; }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { calcDimensions(); onScroll(); }, { passive: true });

    /* Compatibilidade Locomotive Scroll */
    var appEl = document.querySelector('#app');
    if (appEl) { appEl.addEventListener('scroll', onScroll, { passive: true }); }

    /* Polling via rAF como fallback universal para Locomotive Scroll */
    var lastScrollY = -1;
    function poll() {
        var y = window.scrollY || window.pageYOffset || 0;
        if (y !== lastScrollY) { lastScrollY = y; updateParts(); }
        requestAnimationFrame(poll);
    }
    poll();

    /* Garante que as letras aparecem quando o footer entra na viewport,
       mesmo que o scroll não dispare (ex: página pequena).
       Threshold 0 = dispara assim que qualquer pixel aparece */
    var footerObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                calcDimensions();
                updateParts();
            }
        });
    }, { threshold: [0, 0.05, 0.1, 0.3, 0.5, 1.0] });
    footerObs.observe(stageEl);

    /* Init */
    updateParts();

})();