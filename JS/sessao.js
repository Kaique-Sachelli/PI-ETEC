
import { mostrarNotificao } from "./notificacao.js"
//verifica token sempre que a página for iniciada
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    //logica para verificar o token de todas as paginas que forem carregadas
    if (!token) {
        mostrarNotificao('Sessão inválida. Por favor, faça o login.', "erro");
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
            mostrarNotificao('Sua sessão expirou. Por favor, faça o login novamente.', "erro");
            window.location.href = '../HTML/login.html';
            return;
        }    
    } catch (e) {
        // Se o token for inválido, limpa e redireciona para o login
        console.error("Erro ao decodificar o token:", e);
        localStorage.removeItem('token');
        mostrarNotificao('Sessão inválida. Por favor, faça o login novamente.', 'erro');
        window.location.href = '../HTML/login.html';
    } 
    // logica para escutar o botao de sair
    const botaoSair = document.getElementById("botaoSair")
    if (botaoSair) {
        botaoSair.addEventListener('click', (e) => {
            e.preventDefault();
            logOut()
        })
    }



});    

export function erroToken() {
    localStorage.removeItem("token")
    mostrarNotificao('Token inválido. Por favor, faça o login.', "erro");
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

export function getToken() {
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            return null
            
        } else {
            return token
        }
    } catch{
        return null
    }
}


//função para limpar a memoria do navegador apos logout
function logOut() {
    localStorage.removeItem("token")
    mostrarNotificao("Saida realizada com sucesso", "sucesso")
    setTimeout(() => {
        window.location.href = "../HTML/login.html"
    }, 1000);
}

//função de  encerramento de sessão
export function encerrarSessao() {
    localStorage.removeItem("token")
    setTimeout(() => {
        window.location.href = "../HTML/login.html"
    }, 1000);
}

//função para inatividade
let timerInatividade;
const tempoDeInatividade = 15 * 60 * 1000; //15 minutos em milisegundos

function usuarioAtivo() {
    clearTimeout(timerInatividade);
    timerInatividade = setTimeout(() => {
        mostrarNotificao("Sessão encerrada por inatividade.", "erro");
        encerrarSessao()
    }, tempoDeInatividade);
}
const eventosAtividade = ['mousemove', 'mousedown', 'keypress', 'keydown', 'touchstart', 'scroll'];
eventosAtividade.forEach(evento => {
    document.addEventListener(evento, usuarioAtivo, true);
});