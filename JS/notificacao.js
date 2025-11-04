let timerNotificacao = null;
export function mostrarNotificao(mensagem, tipo) {
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