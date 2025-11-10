export function mostrarNotificacao(mensagem, tipo) {
    let timerNotificacao = null;
    const notificação = document.getElementById('notificacao')
    clearTimeout(timerNotificacao)

    notificação.textContent = mensagem;
    notificação.className = ''
    notificação.classList.add(tipo)

    notificação.classList.add('show')

    timerNotificacao = setTimeout(() => {
        notificação.classList.remove('show')
    }, 2000)
}