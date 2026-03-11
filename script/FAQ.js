(function () {
    'use strict';

    var section = document.querySelector('.faq-section');
    if (!section) return; /* Sai se a seção não existir */


    /* ══════════════════════════════════════════════════════
       MÓDULO 1 — REVEAL AO SCROLL
       ──────────────────────────────────────────────────────
       Observa [data-fq-reveal]. Quando 15% do elemento entra
       na viewport, adiciona .fq-visible após data-fq-delay ms.
       O CSS cuida da animação (opacity + transform).
    ══════════════════════════════════════════════════════ */
    var revealEls = Array.prototype.slice.call(
        section.querySelectorAll('[data-fq-reveal]')
    );

    var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el    = entry.target;
            var delay = parseInt(el.getAttribute('data-fq-delay') || '0', 10);
            setTimeout(function () { el.classList.add('fq-visible'); }, delay);
            revealObs.unobserve(el);
        });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { revealObs.observe(el); });


    /* ══════════════════════════════════════════════════════
       MÓDULO 2 — ACCORDION
       ──────────────────────────────────────────────────────
       Cada .fq-item tem um botão .fq-question.
       Ao clicar:
       - O item atual alterna entre aberto (.fq-open) e fechado
       - Todos os outros fecham (comportamento exclusivo)
       - --fq-h é setada com o scrollHeight real do conteúdo
         para que a animação CSS height: 0 → var(--fq-h) funcione

       Também cuida do reveal escalonado dos itens:
       cada item recebe --fq-item-delay com 60ms de diferença.
    ══════════════════════════════════════════════════════ */
    var accordion = document.getElementById('fqAccordion');
    if (!accordion) return;

    var items = Array.prototype.slice.call(
        accordion.querySelectorAll('.fq-item')
    );

    /* Aplica delay escalonado e dispara reveal individual por item */
    var itemObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('fq-visible');
            itemObs.unobserve(entry.target);
        });
    }, { threshold: 0.1 });

    items.forEach(function (item, i) {
        /* Delay de 60ms entre cada item */
        item.style.setProperty('--fq-item-delay', (i * 60 + 200) + 'ms');
        itemObs.observe(item);

        var btn    = item.querySelector('.fq-question');
        var answer = item.querySelector('.fq-answer');
        var inner  = item.querySelector('.fq-answer-inner');

        if (!btn || !answer || !inner) return;

        btn.addEventListener('click', function () {
            var isOpen = item.classList.contains('fq-open');

            /* Fecha todos os outros itens */
            items.forEach(function (other) {
                if (other === item) return;
                var otherAnswer = other.querySelector('.fq-answer');
                other.classList.remove('fq-open');
                other.querySelector('.fq-question')
                     .setAttribute('aria-expanded', 'false');
                if (otherAnswer) {
                    otherAnswer.style.removeProperty('--fq-h');
                }
            });

            /* Alterna o item clicado */
            if (isOpen) {
                /* Fecha: limpa a altura para animar para 0 */
                item.classList.remove('fq-open');
                btn.setAttribute('aria-expanded', 'false');
                answer.style.removeProperty('--fq-h');
            } else {
                /* Abre: mede o conteúdo e define --fq-h */
                var h = inner.scrollHeight;
                answer.style.setProperty('--fq-h', h + 'px');
                item.classList.add('fq-open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });


    /* ══════════════════════════════════════════════════════
       MÓDULO 3 — FORMULÁRIO (Formspree)
       ──────────────────────────────────────────────────────
       Envio assíncrono via fetch para não redirecionar a página.
       Estados: normal → loading → sucesso / erro.

       DEPENDÊNCIA: o action do <form> precisa ter o ID real
       do Formspree. Enquanto for YOUR_FORM_ID, o envio falha
       com 404 — isso é esperado até você configurar.
    ══════════════════════════════════════════════════════ */
    var form    = document.getElementById('fqForm');
    var submit  = document.getElementById('fqSubmit');
    var success = document.getElementById('fqSuccess');

    if (!form || !submit || !success) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault(); /* Impede o redirecionamento padrão */

        /* Validação simples — verifica campos required */
        var valid = true;
        Array.prototype.forEach.call(
            form.querySelectorAll('[required]'),
            function (field) {
                if (!field.value.trim()) {
                    valid = false;
                    /* Destaca o campo inválido */
                    field.style.borderColor = 'rgba(251, 100, 36, 0.6)';
                    field.addEventListener('input', function () {
                        field.style.borderColor = '';
                    }, { once: true });
                }
            }
        );
        if (!valid) return;

        /* Estado: carregando */
        submit.classList.add('fq-loading');
        submit.disabled = true;

        /* Envia via fetch (sem redirecionar) */
        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        })
        .then(function (res) {
            if (res.ok) {
                /* Sucesso: oculta o form e mostra mensagem */
                form.style.display = 'none';
                success.classList.add('fq-show');
            } else {
                /* Erro do servidor */
                res.json().then(function (data) {
                    var msg = (data && data.errors)
                        ? data.errors.map(function (e) { return e.message; }).join(', ')
                        : 'Erro ao enviar. Tente novamente.';
                    alert(msg);
                    submit.classList.remove('fq-loading');
                    submit.disabled = false;
                });
            }
        })
        .catch(function () {
            /* Erro de rede */
            alert('Erro de conexão. Verifique sua internet e tente novamente.');
            submit.classList.remove('fq-loading');
            submit.disabled = false;
        });
    });

})(); /* Fim do IIFE */