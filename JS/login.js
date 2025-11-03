// Código do login
document.getElementById('botaoLogin').addEventListener('click', async function (e) {
    e.preventDefault();

    const email = document.getElementById('emailLogin').value;
    const senha = document.getElementById('senhaLogin').value;

    if (email && senha) {
        try {
            const resposta = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            const dados = await resposta.json();
            campoEmail = document.getElementById('emailLogin')
            campoSenha = document.getElementById('senhaLogin')
            if (dados.sucesso) {
                mostrarNotificao(dados.mensagem,'sucesso')
                setTimeout(() => {
                    window.location.href = '../HTML/inicio.html';
                }, 1500);
            }
            else{
                mostrarNotificao(dados.mensagem, 'erro')
                    document.getElementById('emailLogin').value = ''
                    document.getElementById('senhaLogin').value = ''

            }
        } catch (erro) {
            console.error('Erro ao tentar fazer login:', erro);
        }
    } else {
        mostrarNotificao('Preencha todos os campos!', 'erro')
    }
});
//função para notificação
function mostrarNotificao(mensagem, tipo) {
    const notificação = document.getElementById('notificacao')
    let timerNotificacao = null;
    clearTimeout(timerNotificacao)

    notificação.textContent = mensagem;
    notificação.className = ''
    notificação.classList.add(tipo)

    notificação.classList.add('show')

    timerNotificacao = setTimeout(() => {
        notificação.classList.remove('show')
    }, 2000)
}


// Código de Mostrar Senha / Ocultar Senha
function toggleSenha() {
    const input = document.getElementById("senhaLogin");
    const icon = document.querySelector(".toggle-senha");

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    }
}