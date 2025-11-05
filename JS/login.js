// Código do login
import { mostrarNotificao } from "./notificacao.js";

let campoEmail;
let campoSenha;
let idUsuario;
let toggleSenha;

document.addEventListener('DOMContentLoaded', () => {
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
                    mostrarNotificao(dados.mensagem, 'sucesso')
                    localStorage.setItem('token', dados.token)
                    setTimeout(() => {
                        window.location.href = '../HTML/inicio.html';
                    }, 1000);
                }
                else {
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

    // Event listener do toggle senha
    document.querySelector('.toggle-senha').addEventListener('click', function () {
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
    });
});