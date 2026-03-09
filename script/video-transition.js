const video = document.querySelector('.hero-video');

if (video) {
    video.addEventListener('timeupdate', function() {
        // Calcula quanto tempo falta para o vídeo acabar
        // Vamos disparar o fade 0.5 segundos antes do fim
        const tempoRestante = video.duration - video.currentTime;

        if (tempoRestante < 0.5 && !video.classList.contains('video-fade')) {
            video.classList.add('video-fade');
        }
    });

    // Remove a classe quando o vídeo reiniciar para poder disparar de novo no próximo loop
    video.addEventListener('play', () => {
        // Um pequeno delay para garantir que a animação terminou de rodar
        setTimeout(() => {
            video.classList.remove('video-fade');
        }, 1000);
    });
}