// Código do login
import { mostrarNotificao } from "./notificacao.js";

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
            if (dados.sucesso) {
                mostrarNotificao(dados.mensagem,'sucesso')
                localStorage.setItem('token', dados.token)
                setTimeout(() => {
                    window.location.href = '../HTML/inicio.html';
                }, 1000);
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

    // let tipoUsuarioLogado;

    // Simulação de verificação (substitua pela lógica real)
    // if (username === 'professor' && password === 'senha') {
    //     tipoUsuarioLogado = 'professor';
    // } else if (username === 'tecnico' && password === 'senha') {
    //     tipoUsuarioLogado = 'tecnico';
    // } else if (username === 'administrador' && password === 'senha') {
    //     tipoUsuarioLogado = 'adm';
    // } else {
    //     alert('Usuário ou senha inválidos');
    //     return;
    // }

    // Chama a função para verificar o tipo de usuário
    // verificarTipoUsuario(tipoUsuarioLogado);
});

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


// Função para mostrar a seção correta com base no tipo de usuário

// function verificarTipoUsuario(tipoUsuario) {

    // Esconder todas as seções inicialmente
    
    // document.querySelectorAll('.professor, .tecnico, .adm').forEach(section => {
    //     section.style.display = 'none';
    // });

    // Mostrar a seção correspondente ao tipo de usuário

//     if (tipoUsuario === 'professor') {
//         document.querySelectorAll('.professor').forEach(section => {
//             section.style.display = 'block';
//         });
//     } else if (tipoUsuario === 'tecnico') {
//         document.querySelectorAll('.tecnico').forEach(section => {
//             section.style.display = 'block';
//         });
//     } else if (tipoUsuario === 'adm') {
//         document.querySelectorAll('.adm').forEach(section => {
//             section.style.display = 'block';
//         });
//     }
// }