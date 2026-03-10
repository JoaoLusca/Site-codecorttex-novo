(function () {
    'use strict';

    /* ── CONFIGURAÇÃO ────────────────────────────────────────
       Ajuste estes valores para personalizar o efeito.     */
    var CFG = {
        count:        22,    /* Bolhas simultâneas na tela */
        minR:         12,    /* Raio mínimo (px) */
        maxR:         52,    /* Raio máximo (px) */
        minSpeed:    0.15,   /* Velocidade mínima de subida */
        maxSpeed:    0.50,   /* Velocidade máxima de subida */
        wobbleAmp:    0.45,  /* Amplitude do balanço horizontal */
        wobbleFreq:  0.008,  /* Frequência do seno de balanço */
        hue:          283,   /* Matiz HSL — 283 ≈ roxo #B424FB */
        popParticles: 12,    /* Estilhaços ao estourar */
        popSpeed:      5.5,  /* Velocidade inicial dos estilhaços */
        popLife:       38    /* Frames de vida dos estilhaços */
    };

    /* ── REFERÊNCIAS DO DOM ─────────────────────────────── */
    var section = document.querySelector('.servicos');
    var canvas  = document.getElementById('svBubblesCanvas');
    if (!section || !canvas) return;
    var ctx = canvas.getContext('2d');

    /* ── TAMANHO DO CANVAS ──────────────────────────────── */
    function resize() {
        canvas.width  = section.offsetWidth;
        canvas.height = section.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* ── UTILITÁRIO ─────────────────────────────────────── */
    function rand(a, b) { return a + Math.random() * (b - a); }

    /* ── FÁBRICA DE BOLHA ────────────────────────────────
       randomY=true: começa em posição aleatória na seção
       (primeiro lote não aparece todo do fundo de uma vez). */
    function makeBubble(randomY) {
        var r = rand(CFG.minR, CFG.maxR);
        return {
            x:          rand(r, canvas.width - r),
            y:          randomY
                            ? rand(r + 20, canvas.height - r - 20)
                            : canvas.height + r + rand(0, 80),
            r:          r,
            speedY:     rand(CFG.minSpeed, CFG.maxSpeed),
            wobbleOff:  rand(0, Math.PI * 2),
            sat:        rand(72, 96),   /* Saturação HSL por bolha */
            lit:        rand(52, 68),   /* Luminosidade HSL por bolha */
            alpha:      rand(0.28, 0.52),
            age:        randomY ? 999 : 0, /* Sem fade in no primeiro lote */
            popped:     false
        };
    }

    /* ── POOL DE PARTÍCULAS (estouro) ─────────────────── */
    var particles = [];

    function burst(b) {
        b.popped = true;

        /* Anel expansivo de onda */
        particles.push({
            isRing: true,
            x: b.x, y: b.y,
            r: b.r, maxR: b.r * 2.6,
            life: 22, maxLife: 22,
            sat: b.sat, lit: b.lit
        });

        /* Estilhaços radiais */
        for (var i = 0; i < CFG.popParticles; i++) {
            var ang = (Math.PI * 2 / CFG.popParticles) * i + rand(-0.25, 0.25);
            var spd = rand(CFG.popSpeed * 0.5, CFG.popSpeed * 1.4);
            particles.push({
                isRing: false,
                x: b.x, y: b.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                r:  rand(1.5, b.r * 0.2),
                life: CFG.popLife, maxLife: CFG.popLife,
                sat: b.sat, lit: b.lit
            });
        }
    }

    /* ── RENDERIZA UMA BOLHA ────────────────────────────
       Preenchimento gradiente + anel + dois reflexos.   */
    function drawBubble(b) {
        var fade = Math.min(b.age / 55, 1);
        var a    = b.alpha * fade;
        if (a < 0.01) return;

        ctx.save();

        /* Preenchimento translúcido */
        var g = ctx.createRadialGradient(
            b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.05,
            b.x, b.y, b.r
        );
        g.addColorStop(0,    'hsla(' + CFG.hue + ',' + b.sat + '%,' + b.lit + '%,' + (a * 0.22) + ')');
        g.addColorStop(0.65, 'hsla(' + CFG.hue + ',' + b.sat + '%,' + (b.lit-12) + '%,' + (a * 0.07) + ')');
        g.addColorStop(1,    'hsla(' + CFG.hue + ',' + b.sat + '%,' + (b.lit-20) + '%,' + (a * 0.02) + ')');
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        /* Anel externo */
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'hsla(' + CFG.hue + ',' + b.sat + '%,' + b.lit + '%,' + (a * 0.8) + ')';
        ctx.lineWidth   = 1.2;
        ctx.stroke();

        /* Reflexo superior esquerdo */
        var gr = ctx.createRadialGradient(
            b.x - b.r * 0.3, b.y - b.r * 0.32, 0,
            b.x - b.r * 0.3, b.y - b.r * 0.32, b.r * 0.28
        );
        gr.addColorStop(0, 'rgba(255,255,255,' + (a * 0.5) + ')');
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.32, b.r * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();

        /* Reflexo inferior direito (profundidade) */
        ctx.beginPath();
        ctx.arc(b.x + b.r * 0.36, b.y + b.r * 0.38, b.r * 0.11, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + (a * 0.18) + ')';
        ctx.fill();

        ctx.restore();
    }

    /* ── RENDERIZA PARTÍCULAS DE ESTOURO ────────────── */
    function tickParticles() {
        for (var i = particles.length - 1; i >= 0; i--) {
            var p = particles[i];
            p.life--;
            if (p.life <= 0) { particles.splice(i, 1); continue; }
            var t = p.life / p.maxLife; /* 1 → 0 */

            if (p.isRing) {
                /* Anel expansivo */
                var rr = p.r + (p.maxR - p.r) * (1 - t);
                ctx.save();
                ctx.globalAlpha = t * 0.55;
                ctx.beginPath();
                ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
                ctx.strokeStyle = 'hsla(' + CFG.hue + ',' + p.sat + '%,' + p.lit + '%,1)';
                ctx.lineWidth   = 1.8 * t;
                ctx.stroke();
                ctx.restore();
            } else {
                /* Gotícula com gravidade */
                p.x  += p.vx;
                p.y  += p.vy;
                p.vy += 0.13;  /* Gravidade suave */
                p.vx *= 0.97;  /* Atrito horizontal */
                ctx.save();
                ctx.globalAlpha = t * 0.9;
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(p.r * t, 0.5), 0, Math.PI * 2);
                ctx.fillStyle = 'hsla(' + CFG.hue + ',' + p.sat + '%,' + (p.lit + 18) + '%,1)';
                ctx.fill();
                ctx.restore();
            }
        }
    }

    /* ── ESTADO INICIAL: bolhas já na tela ──────────── */
    var bubbles = [];
    for (var i = 0; i < CFG.count; i++) bubbles.push(makeBubble(true));

    /* ── DETECÇÃO DE CLIQUE ──────────────────────────
       Percorre de trás para frente (bolha do topo primeiro).
       Estoura apenas UMA bolha por clique.             */
    canvas.addEventListener('click', function (e) {
        var rect = canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        for (var i = bubbles.length - 1; i >= 0; i--) {
            var b  = bubbles[i];
            var dx = mx - b.x, dy = my - b.y;
            if (Math.sqrt(dx * dx + dy * dy) <= b.r) {
                burst(b);
                break;
            }
        }
    });

    /* Muda cursor para pointer ao passar sobre bolha */
    canvas.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left, my = e.clientY - rect.top;
        var hit = false;
        for (var i = bubbles.length - 1; i >= 0; i--) {
            var b  = bubbles[i];
            var dx = mx - b.x, dy = my - b.y;
            if (Math.sqrt(dx * dx + dy * dy) <= b.r) { hit = true; break; }
        }
        /* Nota: o cursor customizado do site (#cur/#cur-r) cuida da
           aparência visual; este cursor no canvas serve de fallback  */
        canvas.style.cursor = hit ? 'pointer' : 'default';
    });

    /* ── LOOP PRINCIPAL ─────────────────────────────── */
    var frame = 0;

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame++;

        for (var i = bubbles.length - 1; i >= 0; i--) {
            var b = bubbles[i];

            if (b.popped) {
                bubbles.splice(i, 1);
                /* Reabastece com nova bolha vinda por baixo */
                ;(function () {
                    setTimeout(function () {
                        if (bubbles.length < CFG.count) {
                            bubbles.push(makeBubble(false));
                        }
                    }, rand(300, 1400));
                })();
                continue;
            }

            b.age++;
            b.y -= b.speedY;
            b.x += Math.sin(frame * CFG.wobbleFreq + b.wobbleOff) * CFG.wobbleAmp;

            /* Recicla bolha que saiu pelo topo */
            if (b.y + b.r < 0) {
                b.x         = rand(b.r, canvas.width - b.r);
                b.y         = canvas.height + b.r + rand(0, 40);
                b.speedY    = rand(CFG.minSpeed, CFG.maxSpeed);
                b.wobbleOff = rand(0, Math.PI * 2);
                b.alpha     = rand(0.28, 0.52);
                b.age       = 0;
            }

            drawBubble(b);
        }

        tickParticles();
        requestAnimationFrame(loop);
    }

    loop();

})(); /* Fim do IIFE */