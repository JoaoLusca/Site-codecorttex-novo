(function () {
    'use strict';

    /* ──────────────────────────────────────────────────────────
       CONFIGURAÇÃO DA RODA
       Todos os tamanhos são em unidades do viewBox (0 0 500 500).
       ────────────────────────────────────────────────────────── */
    var VB      = 500;     /* Tamanho do viewBox */
    var CX      = 250;     /* Centro X */
    var CY      = 250;     /* Centro Y */

    /* Raios dos anéis (de fora para dentro) */
    var R1      = 238;     /* Raio externo do anel de arcos */
    var R2      = 168;     /* Raio interno do anel de arcos */
    var R3      = 148;     /* Segundo anel decorativo */
    var R4      = 120;     /* Terceiro anel decorativo */
    var R5      = 95;      /* Círculo central */
    var R5I     = 78;      /* Anel interno do círculo central */

    var GAP     = 3.5;     /* Gap em graus entre arcos */

    /*
      DESLOCAMENTO DO ARCO ATIVO:
      Quando o arco fica ativo, ele se translada radialmente
      para fora do centro da roda (efeito de "sair" da roda).
      O valor abaixo é em pixels do viewBox.
    */
    var ARC_ACTIVE_OFFSET = 14; /* px no viewBox */

    /* Índice da etapa ativa (0–3) */
    var currentStep = 0;

    /* ──────────────────────────────────────────────────────────
       REFERÊNCIAS DO DOM
       ────────────────────────────────────────────────────────── */
    var wheelContainer = document.getElementById('mtWheelContainer');
    var icons          = Array.prototype.slice.call(document.querySelectorAll('[data-mt-icon]'));
    var tabs           = Array.prototype.slice.call(document.querySelectorAll('[data-mt-tab]'));
    var panels         = Array.prototype.slice.call(document.querySelectorAll('[data-mt-panel]'));
    var revealEls      = Array.prototype.slice.call(document.querySelectorAll('[data-mt-reveal]'));

    if (!wheelContainer) return;

    /* ──────────────────────────────────────────────────────────
       FUNÇÕES UTILITÁRIAS SVG
       ────────────────────────────────────────────────────────── */

    function deg2rad(d) { return d * Math.PI / 180; }

    /* Ponto na circunferência — ângulo 0 = topo (12h) */
    function pt(r, angleDeg) {
        var rad = deg2rad(angleDeg - 90);
        return {
            x: CX + r * Math.cos(rad),
            y: CY + r * Math.sin(rad)
        };
    }

    /* Path de um arco (setor de anel) */
    function arcPath(startDeg, endDeg, rOuter, rInner) {
        var s = startDeg + GAP / 2;
        var e = endDeg   - GAP / 2;
        var p1 = pt(rOuter, s), p2 = pt(rOuter, e);
        var p3 = pt(rInner, e), p4 = pt(rInner, s);
        var la = (e - s) > 180 ? 1 : 0;
        return [
            'M', p1.x, p1.y,
            'A', rOuter, rOuter, 0, la, 1, p2.x, p2.y,
            'L', p3.x, p3.y,
            'A', rInner, rInner, 0, la, 0, p4.x, p4.y,
            'Z'
        ].join(' ');
    }

    /* Ponto médio de um arco (para posicionar label/número) */
    function arcMid(startDeg, endDeg, r) {
        return pt(r, (startDeg + endDeg) / 2);
    }

    /* Vetor de translação radial (para deslocar o arco ativo) */
    function radialTranslate(midAngleDeg, dist) {
        var rad = deg2rad(midAngleDeg - 90);
        return {
            x: dist * Math.cos(rad),
            y: dist * Math.sin(rad)
        };
    }

    /* ──────────────────────────────────────────────────────────
       CONSTRUÇÃO DO SVG DA RODA
       ────────────────────────────────────────────────────────── */
    function buildWheel() {
        var ns  = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 ' + VB + ' ' + VB);
        svg.setAttribute('width',  '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('class',  'mt-wheel-svg');
        svg.setAttribute('id',     'mtWheelSVG');
        svg.setAttribute('aria-hidden', 'true');
        svg.style.overflow = 'visible';

        /* ── <defs>: gradientes e filtros ── */
        var defs = document.createElementNS(ns, 'defs');

        /* Gradiente roxo para arco ativo */
        var ga = document.createElementNS(ns, 'radialGradient');
        ga.id = 'mtArcGrad';
        ga.setAttribute('cx', '50%'); ga.setAttribute('cy', '50%'); ga.setAttribute('r', '50%');
        [
            { off: '0%',   color: '#c94aff' },
            { off: '60%',  color: '#9010d0' },
            { off: '100%', color: '#5a0880' }
        ].forEach(function(s) {
            var stop = document.createElementNS(ns, 'stop');
            stop.setAttribute('offset', s.off);
            stop.setAttribute('stop-color', s.color);
            ga.appendChild(stop);
        });
        defs.appendChild(ga);

        /* Gradiente escuro para arcos inativos */
        var gi = document.createElementNS(ns, 'radialGradient');
        gi.id = 'mtArcGradInactive';
        gi.setAttribute('cx', '50%'); gi.setAttribute('cy', '50%'); gi.setAttribute('r', '50%');
        [
            { off: '0%',   color: '#28103e' },
            { off: '100%', color: '#120820' }
        ].forEach(function(s) {
            var stop = document.createElementNS(ns, 'stop');
            stop.setAttribute('offset', s.off);
            stop.setAttribute('stop-color', s.color);
            gi.appendChild(stop);
        });
        defs.appendChild(gi);

        /* Filtro de glow para arco ativo */
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
        ['glow', 'SourceGraphic'].forEach(function(inp) {
            var n = document.createElementNS(ns, 'feMergeNode');
            n.setAttribute('in', inp);
            fm.appendChild(n);
        });
        flt.appendChild(fb); flt.appendChild(fco); flt.appendChild(fm);
        defs.appendChild(flt);

        svg.appendChild(defs);

        /* ── Halo externo (sutíl, decorativo) ── */
        var halo = document.createElementNS(ns, 'circle');
        halo.setAttribute('cx', CX); halo.setAttribute('cy', CY);
        halo.setAttribute('r',  R1 + 6);
        halo.setAttribute('fill', 'none');
        halo.setAttribute('stroke', 'rgba(180,36,251,0.04)');
        halo.setAttribute('stroke-width', '1');
        svg.appendChild(halo);

        /* ── 4 ARCOS (as fatias da roda) ── */
        /*
          Cada arco ocupa 90° (360°/4).
          startAngles: 0°, 90°, 180°, 270° (em sentido horário a partir do topo).

          Cada arco vive num <g class="mt-arc-group">.
          Quando ativo, o <g> recebe um transform de translação radial
          via JS (calculado com radialTranslate).
        */
        var arcGroups = [];

        /*
          Posicionamento dos arcos conforme solicitado:
          Superior esquerdo = 01 (Imersão)   → começa em 225° (=-135°)
          Superior direito  = 02 (Estratégia) → começa em 315°
          Inferior direito  = 03 (Execução)   → começa em  45°
          Inferior esquerdo = 04 (Entrega)    → começa em 135°

          A função pt() usa ângulo 0 = topo (12h), sentido horário.
          Superior esquerdo = quadrante que vai de 225° a 315°.
          Offset base: 225° (== -135°) para o arco 0.
        */
        var ARC_START_OFFSET = 225; /* graus — posiciona arco 0 no superior esquerdo */

        for (var i = 0; i < 4; i++) {
            var startDeg = ARC_START_OFFSET + i * 90;
            var endDeg   = startDeg + 90;
            var midAngle = (startDeg + endDeg) / 2;

            /* <g> do arco — recebe o transform de deslocamento */
            var g = document.createElementNS(ns, 'g');
            g.setAttribute('class', 'mt-arc-group' + (i === 0 ? ' mt-arc-active' : ''));
            g.setAttribute('data-mt-arc', i);
            g.setAttribute('data-mid-angle', midAngle);

            /* Aplica deslocamento inicial: arco 0 já está ativo */
            var off = (i === 0) ? radialTranslate(midAngle, ARC_ACTIVE_OFFSET) : { x: 0, y: 0 };
            g.style.transform = 'translate(' + off.x + 'px,' + off.y + 'px)';
            g.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1)';

            /* Path do arco */
            var path = document.createElementNS(ns, 'path');
            path.setAttribute('class', 'mt-arc-path');
            path.setAttribute('d', arcPath(startDeg, endDeg, R1, R2));
            path.setAttribute('fill', i === 0 ? 'url(#mtArcGrad)' : 'url(#mtArcGradInactive)');
            if (i === 0) path.setAttribute('filter', 'url(#mtGlowActive)');

            /* Número "01"–"04" no centro do arco */
            var mid = arcMid(startDeg, endDeg, (R1 + R2) / 2);
            var numEl = document.createElementNS(ns, 'text');
            numEl.setAttribute('x', mid.x);
            numEl.setAttribute('y', mid.y);
            numEl.setAttribute('text-anchor', 'middle');
            numEl.setAttribute('dominant-baseline', 'middle');
            numEl.setAttribute('class', 'mt-arc-num');
            numEl.setAttribute('data-mt-arc-num', i);
            /* Rotaciona o número para acompanhar o arco */
            numEl.setAttribute('transform',
                'rotate(' + midAngle + ' ' + mid.x + ' ' + mid.y + ')'
            );
            numEl.textContent = (i < 9 ? '0' : '') + (i + 1);

            g.appendChild(path);
            g.appendChild(numEl);
            svg.appendChild(g);
            arcGroups.push(g);
        }

        /* ── Anéis concêntricos decorativos ── */
        [
            { r: R3, stroke: 'rgba(180,36,251,0.10)', sw: 1   },
            { r: R4, stroke: 'rgba(180,36,251,0.06)', sw: 1   }
        ].forEach(function(ring) {
            var c = document.createElementNS(ns, 'circle');
            c.setAttribute('cx', CX); c.setAttribute('cy', CY); c.setAttribute('r', ring.r);
            c.setAttribute('fill', 'none');
            c.setAttribute('stroke', ring.stroke);
            c.setAttribute('stroke-width', ring.sw);
            c.setAttribute('pointer-events', 'none');
            svg.appendChild(c);
        });

        /* ── Círculo central (fundo escuro) ── */
        var cc = document.createElementNS(ns, 'circle');
        cc.setAttribute('cx', CX); cc.setAttribute('cy', CY); cc.setAttribute('r', R5);
        cc.setAttribute('fill', '#0d0b18');
        cc.setAttribute('stroke', 'rgba(180,36,251,0.22)');
        cc.setAttribute('stroke-width', '1.5');
        cc.setAttribute('pointer-events', 'none');
        svg.appendChild(cc);

        /* Anel interno decorativo do círculo central */
        var ci = document.createElementNS(ns, 'circle');
        ci.setAttribute('cx', CX); ci.setAttribute('cy', CY); ci.setAttribute('r', R5I);
        ci.setAttribute('fill', 'none');
        ci.setAttribute('stroke', 'rgba(180,36,251,0.07)');
        ci.setAttribute('stroke-width', '1');
        ci.setAttribute('pointer-events', 'none');
        svg.appendChild(ci);

        return { svg: svg, arcGroups: arcGroups };
    }

    /* Constrói e injeta a roda */
    var wheel = buildWheel();
    wheelContainer.insertBefore(wheel.svg, wheelContainer.firstChild);
    var arcGroups = wheel.arcGroups;

    /* ──────────────────────────────────────────────────────────
       TROCA DE ETAPA
       ────────────────────────────────────────────────────────── */
    function activateStep(newStep) {
        if (newStep === currentStep) return;
        var oldStep = currentStep;
        currentStep = newStep;

        /* ── 1. Arcos: retira deslocamento do antigo, aplica no novo ── */
        arcGroups.forEach(function(g, i) {
            var midAngle = parseFloat(g.getAttribute('data-mid-angle'));
            var isActive = (i === newStep);

            g.classList.toggle('mt-arc-active',   isActive);

            /* Calcula o translate radial */
            var off = isActive
                ? radialTranslate(midAngle, ARC_ACTIVE_OFFSET)
                : { x: 0, y: 0 };
            g.style.transform = 'translate(' + off.x + 'px,' + off.y + 'px)';

            /* Atualiza fill e filter do path */
            var path = g.querySelector('.mt-arc-path');
            if (path) {
                path.setAttribute('fill', isActive ? 'url(#mtArcGrad)' : 'url(#mtArcGradInactive)');
                if (isActive) path.setAttribute('filter', 'url(#mtGlowActive)');
                else          path.removeAttribute('filter');
            }
        });

        /* ── 2. Ícone central: sai o antigo, entra o novo ── */
        var oldIcon = icons[oldStep];
        var newIcon = icons[newStep];
        if (oldIcon) {
            oldIcon.classList.add('mt-icon-exit');
            /* Remove as classes após a transição */
            setTimeout(function () {
                oldIcon.classList.remove('mt-icon-active', 'mt-icon-exit');
            }, 320);
        }
        if (newIcon) {
            /* Pequeno delay para a entrada ser ligeiramente após a saída */
            setTimeout(function () {
                newIcon.classList.add('mt-icon-active');
            }, 120);
        }

        /* ── 3. Tabs ── */
        tabs.forEach(function(tab, i) {
            tab.classList.toggle('mt-tab-active', i === newStep);
            tab.setAttribute('aria-selected', i === newStep ? 'true' : 'false');
        });

        /* ── 4. Painéis ── */
        var oldPanel = panels[oldStep];
        var newPanel = panels[newStep];

        /* Sai o painel antigo */
        oldPanel.classList.remove('mt-panel-active');
        oldPanel.classList.add('mt-panel-exit');
        setTimeout(function () {
            oldPanel.classList.remove('mt-panel-exit');
            /* Restaura position absolute para o painel inativo */
            oldPanel.style.position = '';
        }, 480);

        /* Entra o novo painel */
        newPanel.classList.add('mt-panel-active');
    }

    /* ──────────────────────────────────────────────────────────
       EVENT LISTENERS
       ────────────────────────────────────────────────────────── */

    /* Clique nos arcos da roda */
    wheel.svg.addEventListener('click', function (e) {
        var g = e.target.closest('[data-mt-arc]');
        if (!g) return;
        activateStep(parseInt(g.getAttribute('data-mt-arc'), 10));
    });

    /* Cursor pointer sobre os arcos */
    wheel.svg.addEventListener('mouseover', function (e) {
        wheel.svg.style.cursor = e.target.closest('[data-mt-arc]') ? 'pointer' : 'default';
    });

    /* Clique nas tabs */
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            activateStep(parseInt(tab.getAttribute('data-mt-tab'), 10));
        });
    });

    /* ──────────────────────────────────────────────────────────
       REVEAL AO ENTRAR NA VIEWPORT
       ────────────────────────────────────────────────────────── */
    var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('mt-visible');
                ro.unobserve(e.target);
            }
        });
    }, { threshold: 0.2 });
    revealEls.forEach(function (el) { ro.observe(el); });

})();