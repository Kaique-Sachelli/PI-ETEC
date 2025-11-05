import { mostrarNotificacao } from "./notificacao.js"
//verifica token sempre que a página for iniciada
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        mostrarNotificacao('Sessão inválida. Por favor, faça o login.', "erro");
        setTimeout(() => {
            window.location.href = '../HTML/login.html';
        }, 1000);
        return;
    }
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        //calcula o tempo para expiração do token
        const agoraEmSegundos = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp < agoraEmSegundos) {
            localStorage.removeItem('token');
            mostrarNotificacao('Sua sessão expirou. Por favor, faça o login novamente.', "erro");
            window.location.href = '../HTML/login.html';
            return;
        }
    } catch (e) {
        // Se o token for inválido, limpa e redireciona para o login
        console.error("Erro ao decodificar o token:", e);
        localStorage.removeItem('token');
        mostrarNotificacao('Sessão inválida. Por favor, faça o login novamente.', 'erro');
        window.location.href = '../HTML/login.html';
    }
});

export function erroToken() {
    mostrarNotificacao('Token inválido. Por favor, faça o login.', "erro");
    setTimeout(() => {
        window.location.href = '../HTML/login.html';
    }, 1000);
    return;
}


export function getIdUsuario() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return null
        } else {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const idDoUsuario = payload.idUsuario;
            return idDoUsuario
        }
    } catch {
        return null
    }

}

export function getPermissaoUsuario() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return null
        } else {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const permissao = payload.permissao;
            return permissao
        }
    } catch {
        return null
    }
}

export function getNomeUsuario() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return null
        } else {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const nome = payload.nome;
            return nome
        }
    } catch {
        return null
    }
}