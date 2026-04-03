/* ══════════════════════════════════════════════════════════════
   PORTFOLIO.JS — Code Corttex
   Carregado APÓS main.min.js (que já inicializa cursor,
   header compacto, drawer mobile e animação do footer).
   Este arquivo cuida apenas do que é exclusivo do portfólio.
══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. FILTRO DE CATEGORIAS ─────────────────────────────── */
  var filterBtns = document.querySelectorAll('.pf-filter__btn');
  var catSections = document.querySelectorAll('.pf-cat');
  var dividers    = document.querySelectorAll('.pf-divider');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.dataset.filter;

      /* Atualiza botão ativo */
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      if (filter === 'all') {
        catSections.forEach(function (s) { s.classList.remove('is-hidden'); });
        dividers.forEach(function (d)    { d.style.display = ''; });
      } else {
        catSections.forEach(function (s) {
          s.classList.toggle('is-hidden', s.dataset.cat !== filter);
        });
        dividers.forEach(function (d) { d.style.display = 'none'; });
      }

      /* Re-observa cards que ainda não apareceram */
      observeCards();
    });
  });

  /* ── 2. REVEAL DOS CARDS ─────────────────────────────────── */
  var cardIO = null;

  function observeCards() {
    if (cardIO) cardIO.disconnect();

    cardIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          cardIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07 });

    document.querySelectorAll('.js-card-reveal:not(.is-visible)').forEach(function (el) {
      cardIO.observe(el);
    });
  }

  observeCards();

  /* ── 3. REVEAL DOS CABEÇALHOS DE SEÇÃO ──────────────────── */
  var headerIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        headerIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll('.js-header-reveal').forEach(function (el) {
    headerIO.observe(el);
  });

  /* ── 4. REVEAL GERAL (.js-reveal — CTA etc.) ─────────────── */
  var generalIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, idx) {
      if (entry.isIntersecting) {
        /* Escalonamento leve entre elementos irmãos */
        entry.target.style.transitionDelay = (idx * 110) + 'ms';
        entry.target.classList.add('is-visible');
        generalIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.js-reveal').forEach(function (el) {
    generalIO.observe(el);
  });

  /* ── 5. CURSOR — ATIVA O ANEL NO HOVER ──────────────────── */
  /* main.min.js já rastreia elementos a,button.
     Aqui adicionamos os cards de portfólio. */
  document.querySelectorAll('.pf-card-new, .pf-filter__btn').forEach(function (el) {
    el.addEventListener('mouseenter', function () { document.body.classList.add('h'); },    { passive: true });
    el.addEventListener('mouseleave', function () { document.body.classList.remove('h'); }, { passive: true });
  });

  /* ── 6. DIVIDERS — FADE IN AO SCROLL ─────────────────────── */
  var divIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity  = '1';
        entry.target.style.transform = 'translateX(0)';
        divIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  dividers.forEach(function (d) {
    d.style.opacity    = '0';
    d.style.transform  = 'translateX(-20px)';
    d.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    divIO.observe(d);
  });

})();
