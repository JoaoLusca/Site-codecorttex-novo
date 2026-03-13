/* ============================================================
   CTA SECTION — cta-section.js
   Code Corttex
   ============================================================
   COMO INTEGRAR:
   Salve como script/cta.js e inclua no index.html assim:
   <script src="script/cta.js"></script>
   Coloque antes do </body>, após os outros scripts.

   IIFE (Immediately Invoked Function Expression):
   Toda a lógica fica num escopo privado.
   Nenhuma variável vaza para o escopo global (window).
   Prefixo interno: "ct" + camelCase.

   ────────────────────────────────────────────────────────────
   MÓDULOS:
   ┌─ 1. REVEAL AO SCROLL ──────────────────────────────────┐
   │  Anima entrada de [data-ct-reveal] via .ct-visible.     │
   └────────────────────────────────────────────────────────┘
   ┌─ 2. TITLE SPLIT — REVEAL PALAVRA A PALAVRA ────────────┐
   │  Divide o título em spans, sobe cada palavra com mola. │
   └────────────────────────────────────────────────────────┘
   ┌─ 3. CANVAS — PARTÍCULAS ASCENDENTES ───────────────────┐
   │  Partículas de luz que sobem da base, como energia     │
   │  emergindo. Pausa quando fora da viewport (economy).   │
   └────────────────────────────────────────────────────────┘
   ┌─ 4. MOUSE LIGHT — ONDA NO BOTÃO PRIMÁRIO ──────────────┐
   │  Luz radial no ::before do botão segue o cursor.       │
   └────────────────────────────────────────────────────────┘
   ┌─ 5. HALO PARALLAX — HALO SEGUE O MOUSE ────────────────┐
   │  O halo de fundo se desloca levemente com o mouse.     │
   └────────────────────────────────────────────────────────┘
   ┌─ 6. RIPPLE — ONDA DE CLIQUE NOS BOTÕES ────────────────┐
   │  Onda de luz se expande do ponto de clique.            │
   └────────────────────────────────────────────────────────┘
   ============================================================ */

(function () {
    'use strict';

    /* ──────────────────────────────────────────────────────
       REFERÊNCIA DA SEÇÃO
       Sai silenciosamente se não existir na página.
    ────────────────────────────────────────────────────── */
    var section = document.querySelector('.ct-section');
    if (!section) return;


    /* ══════════════════════════════════════════════════════
       MÓDULO 1 — REVEAL AO SCROLL
       ──────────────────────────────────────────────────────
       Observa todos os elementos com [data-ct-reveal].
       Ao entrar na viewport (threshold 15%), adiciona
       .ct-visible após o delay em ms do data-ct-delay.
       O CSS cuida da animação via transition.
    ══════════════════════════════════════════════════════ */
    var revealEls = Array.prototype.slice.call(
        section.querySelectorAll('[data-ct-reveal]')
    );

    var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            var el    = entry.target;
            var delay = parseInt(el.getAttribute('data-ct-delay') || '0', 10);

            /* Aguarda o delay e então adiciona a classe de visibilidade */
            setTimeout(function () {
                el.classList.add('ct-visible');
            }, delay);

            /* Para de observar — não precisa mais após revelar */
            revealObs.unobserve(el);
        });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { revealObs.observe(el); });


    /* ══════════════════════════════════════════════════════
       MÓDULO 2 — TITLE SPLIT: REVEAL PALAVRA A PALAVRA
       ──────────────────────────────────────────────────────
       CONCEITO:
       Pegar o título e fazer cada palavra "emergir de baixo"
       individualmente, com delay escalonado entre elas.
       A sensação é de desbloqueio progressivo — como se o
       texto fosse sendo "liberado" para o usuário.

       COMO FUNCIONA:
       1. Percorre os nós filhos do elemento [data-ct-title-split]
       2. Texto puro → divide por palavra → cada palavra vira:
          <span class="ct-word">
            <span class="ct-word-inner">palavra</span>
          </span>
       3. .ct-word tem overflow: hidden (CSS)
          .ct-word-inner começa em translateY(115%) — escondido
       4. Ao entrar na viewport, .ct-word-up é adicionado a cada
          .ct-word-inner com delay escalonado de 80ms
       5. CSS faz a animação: translateY(115%) → translateY(0)
          com spring (cubic-bezier(0.34, 1.56, 0.64, 1))

       ELEMENTOS INLINE (em, strong, etc.):
       São tratados como um bloco único — o elemento inteiro
       é embrulhado no .ct-word, preservando seu HTML interno.
    ══════════════════════════════════════════════════════ */
    var titleEl = section.querySelector('[data-ct-title-split]');

    if (titleEl) {
        var fragments = []; /* Array de { html, isWord } */

        /* Percorre nós filhos do título */
        Array.prototype.forEach.call(titleEl.childNodes, function (node) {

            if (node.nodeType === 3) {
                /* Nó de texto puro — divide em palavras */
                node.textContent.split(/(\s+)/).forEach(function (piece) {
                    if (!piece.trim()) return; /* Ignora espaços isolados */
                    fragments.push({ html: piece, isWord: true });
                });

            } else if (node.nodeType === 1) {
                var tag = node.tagName.toLowerCase();

                if (tag === 'br') {
                    /* Quebra de linha — preserva */
                    fragments.push({ html: '<br>', isWord: false });
                } else {
                    /* Elemento inline (em, strong…) — trata como uma palavra */
                    fragments.push({ html: node.outerHTML, isWord: true });
                }
            }
        });

        /* Monta o novo HTML do título com os wrappers */
        var builtHTML = '';
        fragments.forEach(function (frag, i) {
            if (!frag.isWord) {
                builtHTML += frag.html;
                return;
            }
            builtHTML +=
                '<span class="ct-word">' +
                    '<span class="ct-word-inner" data-ct-word-idx="' + i + '">' +
                        frag.html +
                    '</span>' +
                '</span> '; /* Espaço após cada palavra */
        });

        titleEl.innerHTML   = builtHTML;
        /* Marca como processado para o CSS torná-lo visível */
        titleEl.classList.add('ct-title-ready');

        /* Coleta todos os .ct-word-inner para animar */
        var wordInners = Array.prototype.slice.call(
            titleEl.querySelectorAll('.ct-word-inner')
        );

        /* Observa o título — dispara ao entrar na viewport */
        var titleObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                /* Anima cada palavra com delay escalonado de 80ms */
                wordInners.forEach(function (inner, idx) {
                    setTimeout(function () {
                        inner.classList.add('ct-word-up');
                    }, idx * 80 + 150); /* +150ms de delay inicial */
                });

                titleObs.unobserve(entry.target);
            });
        }, { threshold: 0.3 });

        titleObs.observe(titleEl);
    }


    /* ══════════════════════════════════════════════════════
       MÓDULO 3 — CANVAS: PARTÍCULAS ASCENDENTES
       ──────────────────────────────────────────────────────
       CONCEITO VISUAL:
       Partículas roxas pequenas sobem continuamente da base
       da seção (onde o halo de luz está), criando a sensação
       de energia ascendente — "algo está subindo, mudando,
       passando para um nível acima".

       São como pixels se libertando, energia se acumulando,
       uma transição de fase acontecendo.

       ECONOMIA DE CPU:
       O loop de animação só roda quando a seção está visível
       na viewport. Pausa automaticamente ao sair.

       PARÂMETROS (ajuste aqui conforme necessário):
       - COUNT:       número de partículas simultâneas
       - SIZE_MIN/MAX: tamanho em pixels
       - SPEED_MIN/MAX: velocidade (px por frame a 60fps)
       - OPACITY_MAX:  opacidade máxima das partículas
       - DRIFT:        deriva horizontal (0 = reto, 1 = errático)
    ══════════════════════════════════════════════════════ */
    var canvas = document.getElementById('ctCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');

    /* ── PARÂMETROS DAS PARTÍCULAS ── */
    var PARTS = {
        COUNT:       60,    /* Quantidade simultânea */
        SIZE_MIN:    0.8,   /* Tamanho mínimo em px */
        SIZE_MAX:    3.2,   /* Tamanho máximo em px */
        SPEED_MIN:   0.25,  /* Velocidade mínima px/frame */
        SPEED_MAX:   1.1,   /* Velocidade máxima px/frame */
        OPACITY_MAX: 0.6,   /* Opacidade máxima */
        DRIFT:       0.25,  /* Deriva horizontal (px/frame máx) */
        /* Zona de spawn horizontal: fração da largura centrada */
        SPREAD:      0.65,

        /* Paleta de cores — roxo com variações e pontos brancos */
        COLORS: [
            [180, 36,  251],  /* Roxo principal */
            [210, 100, 255],  /* Roxo claro */
            [150, 20,  220],  /* Roxo profundo */
            [220, 150, 255],  /* Lilás */
            [255, 255, 255],  /* Branco (highlight raro) */
        ]
    };

    var particles = []; /* Pool de partículas ativas */
    var animActive = false; /* Flag para controle do loop */

    /* ── Ajusta o canvas ao tamanho da seção ── */
    function resizeCanvas() {
        canvas.width  = section.offsetWidth;
        canvas.height = section.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    /* ── Fábrica de partícula ── */
    /* Retorna um objeto com todas as propriedades de uma partícula nova */
    function makeParticle(randomizeY) {
        var cw = canvas.width;
        var ch = canvas.height;

        /* Zona de spawn: base do canvas, centralizada */
        var zoneW  = cw * PARTS.SPREAD;
        var startX = (cw - zoneW) / 2 + Math.random() * zoneW;

        /* Se randomizeY = true, começa em posição aleatória na tela
           (para preencher imediatamente ao carregar, sem esperar spawn) */
        var startY = randomizeY
            ? Math.random() * ch
            : ch + Math.random() * 40; /* Nasce logo abaixo do canvas */

        /* Cor aleatória da paleta */
        var rgb     = PARTS.COLORS[Math.floor(Math.random() * PARTS.COLORS.length)];
        var opacity = Math.random() * PARTS.OPACITY_MAX * 0.7 + 0.05;

        return {
            x:        startX,
            y:        startY,
            originY:  startY,          /* Posição Y de nascimento */
            size:     PARTS.SIZE_MIN + Math.random() * (PARTS.SIZE_MAX - PARTS.SIZE_MIN),
            speedY:   PARTS.SPEED_MIN + Math.random() * (PARTS.SPEED_MAX - PARTS.SPEED_MIN),
            speedX:   (Math.random() - 0.5) * PARTS.DRIFT * 2,
            opacity:  opacity,
            rgb:      rgb,
            /* Distância que a partícula percorre antes de desaparecer */
            lifespan: ch * (0.45 + Math.random() * 0.5),
        };
    }

    /* ── Inicializa o pool ── */
    for (var i = 0; i < PARTS.COUNT; i++) {
        particles.push(makeParticle(true)); /* randomizeY: preenche a tela */
    }

    /* ── Loop de animação ── */
    function drawFrame() {
        if (!animActive) return;

        var cw = canvas.width;
        var ch = canvas.height;

        /* Limpa o canvas completamente */
        ctx.clearRect(0, 0, cw, ch);

        for (var j = 0; j < particles.length; j++) {
            var p = particles[j];

            /* Move a partícula */
            p.y -= p.speedY;
            p.x += p.speedX;

            /* Progresso de vida: 0 (nasceu) → 1 (morreu) */
            var progress = Math.max(0, (p.originY - p.y) / p.lifespan);

            /*
              Curva de opacidade ao longo da vida:
              0%–20%: fade in (nasce suavemente)
              20%–75%: opacidade plena
              75%–100%: fade out (desaparece suavemente)
            */
            var alpha;
            if (progress < 0.2) {
                alpha = p.opacity * (progress / 0.2);
            } else if (progress < 0.75) {
                alpha = p.opacity;
            } else {
                alpha = p.opacity * (1 - (progress - 0.75) / 0.25);
            }
            alpha = Math.max(0, Math.min(1, alpha));

            /* Desenha a partícula */
            ctx.save();
            ctx.globalAlpha = alpha;

            /* Glow suave ao redor */
            ctx.shadowColor = 'rgba(' + p.rgb[0] + ',' + p.rgb[1] + ',' + p.rgb[2] + ', 0.8)';
            ctx.shadowBlur  = p.size * 5;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgb(' + p.rgb[0] + ',' + p.rgb[1] + ',' + p.rgb[2] + ')';
            ctx.fill();
            ctx.restore();

            /* Reinicia a partícula ao concluir o ciclo ou sair da tela */
            if (progress >= 1 || p.y < -20 || p.x < -20 || p.x > cw + 20) {
                particles[j] = makeParticle(false);
            }
        }

        requestAnimationFrame(drawFrame);
    }

    /* ── Inicia/pausa com base na visibilidade da seção ── */
    var canvasObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !animActive) {
                /* Seção entrou na tela — inicia o loop */
                animActive = true;
                drawFrame();
            } else if (!entry.isIntersecting) {
                /* Saiu da tela — pausa para economizar CPU */
                animActive = false;
            }
        });
    }, { threshold: 0.05 });

    canvasObs.observe(section);


    /* ══════════════════════════════════════════════════════
       MÓDULO 4 — MOUSE LIGHT: ONDA NO BOTÃO PRIMÁRIO
       ──────────────────────────────────────────────────────
       O botão .ct-btn-wa tem um ::before com radial-gradient
       centrado em --ct-bx / --ct-by (CSS variables).

       Este módulo atualiza essas variáveis em tempo real
       com a posição do mouse dentro do botão.
       Resultado: uma "mancha de luz" segue o cursor.
    ══════════════════════════════════════════════════════ */
    var btnWa = section.querySelector('.ct-btn-wa');

    if (btnWa) {
        btnWa.addEventListener('mousemove', function (e) {
            var rect = btnWa.getBoundingClientRect();
            /* Posição relativa em porcentagem dentro do botão */
            var x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
            var y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
            btnWa.style.setProperty('--ct-bx', x);
            btnWa.style.setProperty('--ct-by', y);
        }, { passive: true });
    }


    /* ══════════════════════════════════════════════════════
       MÓDULO 5 — HALO PARALLAX: HALO SEGUE O MOUSE
       ──────────────────────────────────────────────────────
       O halo de luz roxa se desloca suavemente na direção
       do mouse, dando vida ao background.

       Usa lerp (interpolação linear) para suavizar o movimento.
       O halo se move com inércia — não instantâneo.

       AJUSTE:
       - speed: 0.04 = muito suave / 0.15 = responsivo
       - maxX: deslocamento horizontal máximo (px)
       - maxY: deslocamento vertical máximo (px)
    ══════════════════════════════════════════════════════ */
    var haloOuter = document.getElementById('ctHaloOuter');

    if (haloOuter) {
        var htX = 0, htY = 0; /* Target (mouse) */
        var hcX = 0, hcY = 0; /* Current (lerp) */
        var HALO_SPEED = 0.04;
        var HALO_MAX_X = 70;  /* Máximo px horizontal */
        var HALO_MAX_Y = 40;  /* Máximo px vertical */

        /* Captura a posição do mouse dentro da seção */
        section.addEventListener('mousemove', function (e) {
            var rect = section.getBoundingClientRect();
            /* Normaliza de -0.5 a +0.5 (centro = 0) */
            htX = (e.clientX - rect.left)  / rect.width  - 0.5;
            htY = (e.clientY - rect.top)   / rect.height - 0.5;
        }, { passive: true });

        /* Loop de animação do halo — independente do canvas */
        function animateHalo() {
            /* Lerp: aproxima suavemente do alvo */
            hcX += (htX - hcX) * HALO_SPEED;
            hcY += (htY - hcY) * HALO_SPEED;

            /* Aplica o deslocamento */
            var dx = hcX * HALO_MAX_X * 2;
            var dy = hcY * HALO_MAX_Y * 2;

            haloOuter.style.transform =
                'translateX(calc(-50% + ' + dx.toFixed(2) + 'px))' +
                ' translateY(' + dy.toFixed(2) + 'px)';

            requestAnimationFrame(animateHalo);
        }
        animateHalo();
    }


    /* ══════════════════════════════════════════════════════
       MÓDULO 6 — RIPPLE: ONDA DE CLIQUE NOS BOTÕES
       ──────────────────────────────────────────────────────
       Ao clicar em qualquer botão da seção, uma onda de luz
       branca se expande a partir do ponto de clique.

       IMPLEMENTAÇÃO:
       1. Injeta @keyframes ctRippleOut no <head> (uma vez)
       2. Ao clicar, cria um <span> posicionado no ponto de clique
       3. Aplica a animação de expansão + fade out
       4. Remove o <span> após a animação completar

       O botão precisa de position: relative e overflow: hidden
       (já definidos no CSS) para conter o ripple.
    ══════════════════════════════════════════════════════ */

    /* Injeta os keyframes no <head> — executa apenas uma vez */
    var styleTag = document.createElement('style');
    styleTag.textContent =
        '@keyframes ctRippleOut {' +
        '  0%   { transform: translate(-50%, -50%) scale(0); opacity: 0.5; }' +
        '  100% { transform: translate(-50%, -50%) scale(6); opacity: 0;   }' +
        '}';
    document.head.appendChild(styleTag);

    /* Seleciona todos os botões da seção */
    var allBtns = Array.prototype.slice.call(
        section.querySelectorAll('.ct-btn-wa, .ct-btn-portfolio')
    );

    allBtns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            var rect  = btn.getBoundingClientRect();
            var x     = e.clientX - rect.left; /* X relativo ao botão */
            var y     = e.clientY - rect.top;  /* Y relativo ao botão */

            /* Cria o elemento de ripple */
            var ripple      = document.createElement('span');
            ripple.style.cssText = [
                'position: absolute',
                'left: ' + x + 'px',
                'top: ' + y + 'px',
                'width: 60px',
                'height: 60px',
                'border-radius: 50%',
                'background: rgba(255, 255, 255, 0.22)',
                'pointer-events: none',
                'z-index: 10',
                'animation: ctRippleOut 0.7s ease-out forwards',
            ].join('; ');

            btn.appendChild(ripple);

            /* Remove após a animação para não acumular elementos */
            setTimeout(function () {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 720);
        });
    });


})(); /* Fim do IIFE */
