/* ============================================================
   FOOTER — Code Corttex
   footer-section.js
   ============================================================
   Salve como script/footer.js e inclua no index.html:
   <script src="script/footer.js"></script>
   Coloque antes do </body>, após os outros scripts.

   IIFE — zero poluição no escopo global. Prefixo: ft.

   ────────────────────────────────────────────────────────────
   MÓDULOS:
   ┌─ 1. BOTÃO "VOLTAR AO TOPO" ───────────────────────────┐
   │  Smooth scroll para o topo ao clicar.                 │
   └───────────────────────────────────────────────────────┘
   ┌─ 2. ANIMAÇÃO SCROLL-DRIVEN DA LOGO GRANDE ────────────┐
   │  Cada .ft-logo-part tem translateY controlado pelo    │
   │  scroll em tempo real.                                │
   │                                                       │
   │  CÁLCULO:                                             │
   │  - Encontra o [data-ft-stage] na página               │
   │  - No scroll, calcula o "progresso" do footer         │
   │    (0 = footer começa a entrar, 1 = base da página)  │
   │  - Cada parte tem um índice i que define o stagger    │
   │  - translateY = DROP × (1 - progress_com_stagger)    │
   │  - Resultado: partes sobem gradualmente da esquerda  │
   │    para a direita conforme o scroll avança            │
   │                                                       │
   │  FUNCIONA com qualquer quantidade de partes.          │
   └───────────────────────────────────────────────────────┘
   ============================================================ */

(function () {
    'use strict';

    /* ──────────────────────────────────────────────────────
       Sai silenciosamente se o footer não existir
    ────────────────────────────────────────────────────── */
    var footer = document.querySelector('.ft-footer');
    if (!footer) return;


    /* ══════════════════════════════════════════════════════
       MÓDULO 1 — BOTÃO "VOLTAR AO TOPO"
       ──────────────────────────────────────────────────────
       Intercepta o clique no #ftTopBtn e executa smooth
       scroll para o topo da página.
       Suporta behavior: 'smooth' nativamente onde disponível,
       com fallback para browsers mais antigos.
    ══════════════════════════════════════════════════════ */
    var topBtn = document.getElementById('ftTopBtn');

    if (topBtn) {
        topBtn.addEventListener('click', function (e) {
            e.preventDefault(); /* Impede o salto imediato do href="#" */

            /* Usa scroll nativo com smooth behavior */
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


    /* ══════════════════════════════════════════════════════
       MÓDULO 2 — ANIMAÇÃO SCROLL-DRIVEN DA LOGO GRANDE
       ──────────────────────────────────────────────────────
       ALGORITMO PRINCIPAL:

       Definições:
       - stageEl: o container [data-ft-stage]
       - parts:   todos os [data-ft-part] dentro do stage
       - DROP:    deslocamento inicial de cada parte em px
                  (começa abaixo por este valor)
       - STAGGER: atraso de progresso entre cada parte
                  (ex: 0.08 = 8% de progresso entre letras)

       A cada evento 'scroll':
       1. Calcula stageTop = posição do topo do stage em px
          relativo ao documento (scrollTop + getBoundingClientRect)
       2. Calcula scrollProgress:
          - 0 quando o topo do viewport está em stageTop (stage
            acabou de entrar na tela)
          - 1 quando o fundo do viewport passa por stageBottom
       3. Para cada parte i:
          - partProgress = clamp(scrollProgress - i * STAGGER, 0, 1)
          - partProgress 0 = parte ainda no início
          - partProgress 1 = parte na posição final
       4. Apply translateY = DROP × (1 - partProgress) em px
          - Quando partProgress = 0: translateY = DROP (abaixo)
          - Quando partProgress = 1: translateY = 0 (posição final)

       EFEITO VISUAL RESULTANTE:
       - Ao rolar para baixo: partes sobem da esquerda p/ direita
       - Ao rolar para cima: partes descem (efeito reverso)
       - Cada parte tem stagger independente
    ══════════════════════════════════════════════════════ */
    var stageEl = footer.querySelector('[data-ft-stage]');
    if (!stageEl) return;

    /* Coleta todas as partes e ordena pelo data-ft-part */
    var parts = Array.prototype.slice.call(
        stageEl.querySelectorAll('[data-ft-part]')
    );

    /* Ordena pelo índice (segurança caso o HTML não esteja em ordem) */
    parts.sort(function (a, b) {
        return parseInt(a.getAttribute('data-ft-part') || '0', 10) -
               parseInt(b.getAttribute('data-ft-part') || '0', 10);
    });

    if (parts.length === 0) return;

    /* ── PARÂMETROS DA ANIMAÇÃO (ajuste aqui) ── */

    /*
      DROP: quanto cada parte começa abaixo (em px).
      Valor maior = partes mais escondidas no início.
      Sugerido: 80-120% da altura do stage.
      Usamos porcentagem do stage para ser responsivo.
    */
    var DROP_PERCENT = 1.1; /* 110% da altura do stage */

    /*
      STAGGER: atraso entre cada parte (em unidades de progresso).
      0.08 = 8% de progresso entre cada letra.
      Valor menor = letras quase juntas.
      Valor maior = letras muito separadas.
    */
    var STAGGER = 0.08;

    /*
      SCROLL_WINDOW: fração da viewport usada para a animação.
      0.5 = a animação acontece nos primeiros 50% de scroll
             dentro da seção visible window.
      1.0 = a animação dura o scroll completo pela seção.
    */
    var SCROLL_WINDOW = 0.8;

    /* ── Variáveis de estado ── */
    var stageH    = 0;  /* Altura do stage em px */
    var dropPx    = 0;  /* DROP em px (recalculado no resize) */
    var ticking   = false; /* Flag para throttle via rAF */

    /* ── Calcula dimensões (chamado no load e no resize) ── */
    function calcDimensions() {
        stageH = stageEl.offsetHeight;
        dropPx = stageH * DROP_PERCENT;
    }
    calcDimensions();

    /* ── Aplica o translateY de cada parte ── */
    function updateParts() {
        var stageRect    = stageEl.getBoundingClientRect();
        var viewH        = window.innerHeight;

        /*
          scrollProgress:
          - 0: topo do stage na base da viewport (começando a aparecer)
          - 1: base do stage na base da viewport (totalmente visível)

          Fórmula:
          progress = (viewH - stageRect.top) / (viewH + stageRect.height × SCROLL_WINDOW)

          Clamped entre 0 e 1.
        */
        var rawProgress = (viewH - stageRect.top) /
                          (viewH + stageRect.height * SCROLL_WINDOW);
        var scrollProg = Math.max(0, Math.min(1, rawProgress));

        /* Atualiza cada parte */
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];

            /*
              partProgress: progresso individual desta parte,
              subtraindo o stagger acumulado.
              Clamped entre 0 e 1.
            */
            var partProg = Math.max(0, Math.min(1,
                scrollProg - i * STAGGER
            ));

            /*
              translateY em px:
              - Quando partProg = 0: translate = dropPx (abaixo, escondido)
              - Quando partProg = 1: translate = 0 (posição final)
              A interpolação é linear; o "ease" visual vem do
              comportamento natural do scroll.
            */
            var ty = dropPx * (1 - partProg);

            /* Aplica via CSS custom property para evitar
               conflito com outras transforms que possam existir */
            part.style.setProperty('--ft-ty', ty.toFixed(2) + 'px');
        }

        ticking = false;
    }

    /* ── Listener de scroll com throttle via requestAnimationFrame ──
       rAF garante que updateParts() roda no máximo 1x por frame (60fps).
       Sem rAF, o scroll dispararia updateParts() centenas de vezes/s.
    ── */
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateParts);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── Resize: recalcula dimensões ── */
    window.addEventListener('resize', function () {
        calcDimensions();
        onScroll(); /* Força atualização imediata após resize */
    }, { passive: true });

    /* ── Inicialização ──
       Roda uma vez no carregamento para definir a posição
       inicial correta (caso o usuário já tenha scrollado).
    ── */
    updateParts();


    /* ══════════════════════════════════════════════════════
       BÔNUS: COMPATIBILIDADE COM LOCOMOTIVE SCROLL
       ──────────────────────────────────────────────────────
       O site usa Locomotive Scroll (smooth scroll library).
       Se o Locomotive Scroll estiver ativo, os eventos
       'scroll' nativos podem não disparar como esperado.

       Esta seção detecta o LocomotiveScroll e, se encontrado,
       usa o evento 'scroll' do próprio Locomotive para
       sincronizar a animação do footer.

       NOTA: O Locomotive usa 'scroll' no elemento #app,
       não no window. Ambos os listeners estão registrados
       para cobrir os dois casos.
    ══════════════════════════════════════════════════════ */
    var appEl = document.querySelector('#app');
    if (appEl) {
        appEl.addEventListener('scroll', onScroll, { passive: true });
    }

    /*
      Se o LocomotiveScroll estiver instanciado na window,
      tenta registrar um listener via sua API.
      (O scroll global é criado em script.js com a var 'scroll'.)
    */
    if (typeof window !== 'undefined' &&
        typeof window.LocomotiveScrollInstance !== 'undefined') {
        try {
            window.LocomotiveScrollInstance.on('scroll', function () {
                onScroll();
            });
        } catch (e) {
            /* Silencia erros — o fallback com window.scroll ainda funciona */
        }
    }

})(); /* Fim do IIFE */
