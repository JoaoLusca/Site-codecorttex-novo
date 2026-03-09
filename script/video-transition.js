const video = document.querySelector('.hero-video');

if (video) {
    video.addEventListener('timeupdate', function() {
        const tempoRestante = video.duration - video.currentTime;

        // Disparamos 0.6s antes do fim
        if (tempoRestante < 0.6 && !video.classList.contains('video-fade')) {
            video.classList.add('video-fade');
        }
    });

    // O segredo está aqui: ao reiniciar o vídeo, removemos a classe
    video.addEventListener('seeked', () => {
        video.classList.remove('video-fade');
        
        // Forçamos um "reflow" (recalculo) para o navegador entender 
        // que a animação deve rodar novamente no próximo loop
        void video.offsetWidth; 
    });

    // Caso o atributo 'loop' do HTML não dispare o 'seeked' em alguns navegadores
    video.addEventListener('play', () => {
        setTimeout(() => {
            video.classList.remove('video-fade');
        }, 1000);
    });
}