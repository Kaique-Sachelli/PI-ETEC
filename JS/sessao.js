import { mostrarNotificao } from "./notificacao.js"

//verifica token sempre que a página for iniciada
document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token');
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
            sessionStorage.removeItem('token');
            mostrarNotificao('Sua sessão expirou. Por favor, faça o login novamente.', "erro");
            window.location.href = '../HTML/login.html';
            return;
        }    
    } catch (e) {
        // Se o token for inválido, limpa e redireciona para o login
        console.error("Erro ao decodificar o token:", e);
        sessionStorage.removeItem('token');
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
    //verificador de atividade
    usuarioAtivo();
});    

export function erroToken() {
    sessionStorage.removeItem("token")
    mostrarNotificao('Token inválido. Por favor, faça o login.', "erro");
    setTimeout(() => {
        window.location.href = '../HTML/login.html';
    }, 1000);    
    return;
}    


export function getIdUsuario() {
    try {
        const token = sessionStorage.getItem('token');
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
        const token = sessionStorage.getItem('token');
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
        const token = sessionStorage.getItem('token');
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

// Script para filtrar o modo de usar para cada tipo de usuário
export function applyRoleVisibility() {
  const permissao = (getPermissaoUsuario() || 'guest').toString().toLowerCase();

  const roleMap = {
    administrador: ['adm','tecnico','professor','containerprodutos', 'btn-pronto'],
    tecnico: ['tecnico','professor'],
    professor: ['professor'],
    guest: []
  };

  const allowed = roleMap[permissao] || [];

  // Seleciona todos os elementos marcados ou usa classes como fallback
  document.querySelectorAll('[data-role], .professor, .tecnico, .adm').forEach(el => {
    const role = el.dataset.role ? el.dataset.role.toString().toLowerCase() :
                 (el.classList.contains('adm') ? 'adm' :
                  el.classList.contains('tecnico') ? 'tecnico' :
                  el.classList.contains('professor') ? 'professor' : 'all');

    if (role === 'all') {
      el.style.display = '';
      return;
    }

    el.style.display = allowed.includes(role) ? '' : 'none';
  });
}

// chama ao carregar a página (colocar dentro do DOMContentLoaded ou após validação do token)
document.addEventListener('DOMContentLoaded', () => {
  // aplica visibilidade
  applyRoleVisibility();
});

export function getToken() {
    try {
        const token = sessionStorage.getItem('token')
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
    sessionStorage.removeItem("token")
    mostrarNotificao("Sessão encerrada com sucesso", "sucesso")
    setTimeout(() => {
        window.location.href = "../HTML/login.html"
    }, 1000);
}

//função de  encerramento de sessão
export function encerrarSessao() {
    sessionStorage.removeItem("token")
    setTimeout(() => {
        window.location.href = "../HTML/login.html"
    }, 1000);
}

//função para inatividade
let timerInatividade;
const tempoDeInatividade = 20 * 60 * 1000; //20 minutos em milisegundos

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
