// Seleção dos elementos
const cur = document.getElementById('cur');
const curR = document.getElementById('cur-r');

let mx = 0, my = 0, rx = 0, ry = 0;

// Atualiza a posição real do mouse
document.addEventListener('mousemove', e => { 
  mx = e.clientX; 
  my = e.clientY; 
}, { passive: true });

// Loop de animação para o efeito de perseguição suave
(function loop() { 
  // O ponto central segue instantaneamente
  cur.style.left = mx + 'px'; 
  cur.style.top = my + 'px'; 
  
  // O círculo externo (curR) segue com atraso (suavização de 0.11)
  rx += (mx - rx) * .11; 
  ry += (my - ry) * .11; 
  curR.style.left = rx + 'px'; 
  curR.style.top = ry + 'px'; 
  
  requestAnimationFrame(loop); 
})();

// Lógica de Hover: Adiciona a classe .h ao body para aumentar o cursor
// Adicione aqui as tags que devem reagir (a, button, etc.)
const hovEls = document.querySelectorAll('a, button, .sc, .dpcard, .cc, .dc, .ppc');

hovEls.forEach(el => { 
  el.addEventListener('mouseenter', () => document.body.classList.add('h'), { passive: true }); 
  el.addEventListener('mouseleave', () => document.body.classList.remove('h'), { passive: true }); 
});