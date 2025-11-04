import { mostrarNotificao } from "./notificacao.js";

//função para carregar a página e executar métodos
document.addEventListener('DOMContentLoaded', function () {
   carregarUsuarios()
})
//função para cadastro de usuários
document.getElementById("formCadastro").addEventListener("submit", async (e) => {
   e.preventDefault();

   const nome = document.getElementById("nomeCadastro").value
   const email = document.getElementById("emailCadastro").value
   const senha = document.getElementById("senhaCadastro").value
   const login = document.getElementById("loginCadastro").value

   if (nome && email && senha && login) {
      try {
         const resposta = await fetch('http://localhost:3000/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, login })
         })
         dados = await resposta.json()
         if (dados.sucesso) {
            mostrarNotificao(dados.mensagem, 'sucesso')
            document.getElementById("formCadastro").reset()
         } else {
            mostrarNotificao(dados.mensagem, 'erro')
         }

      } catch (error) {
         mostrarNotificao("erro ao se conectar com o servidor", error)
         console.error("erro ao se conectar com o servidor", error)
      }
   }
   else {
      mostrarNotificao("Preencha todos os campos!", 'erro')
   }
})

// função para carregar usuários
async function carregarUsuarios() {
   selectUsuarios = document.getElementById("selectAlterar")
   try {
      const resposta = await fetch('http://localhost:3000/usuarios')
      const dados = await resposta.json()
      if (dados.sucesso) {
         selectUsuarios.innerHTML = '<option value="">Selecione um usuário</option>'
         dados.usuarios.forEach(usuario => {
            const option = document.createElement('option')
            option.value = usuario.idUsuario
            option.textContent = `${usuario.nome} - ${usuario.permissao}`
            selectUsuarios.appendChild(option)
         })
      } else {
         mostrarNotificao('falha ao carregar usuários', 'erro')
         console.log(dados.mensagem)
      }

   } catch (error) {
      mostrarNotificao('Erro interno de conexão', 'erro')
      console.log(error)
   }
}

//verifica se algum item do label foi selecionado
const usuarioSelecionado = document.getElementById("selectAlterar")
usuarioSelecionado.addEventListener('change', async function () {
   const idUsuarioSelecionado = this.value
   if (idUsuarioSelecionado) {
      dadosUsuario(idUsuarioSelecionado)
   }
})

//função para preencher os dados do usuário selecionado
async function dadosUsuario(id) {
   try {
      const resposta = await fetch(`http://localhost:3000/usuarios/${id}`)
      const dados = await resposta.json()
      if (dados.sucesso) {
         document.getElementById("emailAlterar").value = dados.usuario.email
         document.getElementById("senhaAlterar").value = "" //retorna a senha vazia por segurança
         document.getElementById("loginAlterar").value = dados.usuario.permissao
      } else {
         mostrarNotificao(dados.mensagem, "erro")
      }
   } catch (error) {
      mostrarNotificao('Erro interno de conexão', 'erro')
      console.log(error)
   }
}
//função para armazenar os dados alterados
async function atualizaUsuario(idUsuario, email, novaSenha, permissao) {
   resultado = await fetch('http://localhost:3000/usuarios/atualizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, novaSenha, permissao, idUsuario })
   })
   dados = await resultado.json()
   return dados
}

//listener para ouvir o botao de enviar 
document.getElementById("alterarForm").addEventListener("submit", async (e) => {
   e.preventDefault()
   email = document.getElementById('emailAlterar').value
   senha = document.getElementById('senhaAlterar').value
   permissao = document.getElementById('loginAlterar').value
   idUsuario = document.getElementById('selectAlterar').value
   if (email && senha && permissao) {
      try {
         dados = await atualizaUsuario(idUsuario, email, senha, permissao)
         if (dados.sucesso) {
            mostrarNotificao(dados.mensagem, 'sucesso')
            document.getElementById("alterarForm").reset()
            carregarUsuarios() //refresh nos usuários do banco
         } else {
            mostrarNotificao(dados.mensagem, 'erro')
            console.log(dados.mensagem, 'erro')
         }
      } catch (error) {
         mostrarNotificao('erro ao se conectar com o servidor', 'erro')
      }
   } else {
      mostrarNotificao('Preencha todos os campos!','erro')
   }
})

// Função para alternar a visibilidade da senha
document.addEventListener('DOMContentLoaded', function () {
   const toggleButtons = document.querySelectorAll('.toggle-password');

   toggleButtons.forEach(button => {
      button.addEventListener('click', function () {
         const targetId = this.getAttribute('data-target');
         const passwordInput = document.getElementById(targetId);
         const eyeClosed = this.querySelector('#eye-closed');
         const eyeOpen = this.querySelector('#eye-open');

         if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeClosed.style.display = 'none';
            eyeOpen.style.display = 'block';
         } else {
            passwordInput.type = 'password';
            eyeClosed.style.display = 'block';
            eyeOpen.style.display = 'none';
         }
      });
   });
});

function alternarVisualizacao(tipo) {
   const containerCadastro = document.querySelector(".container-cadastro");
   const containerAlterar = document.querySelector(".container-alterar");
 
   if (tipo === "alterar") {
     modoVisualizacao = "alterar";
     containerCadastro.style.display = "none";
     containerAlterar.style.display = "block";
   } else {
     modoVisualizacao = "cadastrar";
     containerCadastro.style.display = "block";
     containerAlterar.style.display = "none";
   }
}

document.addEventListener("DOMContentLoaded", () => {
   const opcoesFiltro = document.querySelectorAll(".submenu-link");
   opcoesFiltro.forEach(opcao => {
      opcao.addEventListener("click", (e) => {
      e.preventDefault();
      const texto = opcao.textContent.trim().toLowerCase();
      let botaoCadastro = document.getElementById("cadastrar")
      let botaoAlterar = document.getElementById("alterar")
      if (texto.includes("alterar")) {alternarVisualizacao("alterar")
         botaoCadastro.classList.remove('ativo')
         botaoAlterar.classList.add('ativo')
      };
      if (texto.includes("cadastrar")) {alternarVisualizacao("cadastrar")
         botaoAlterar.classList.remove('ativo')
         botaoCadastro.classList.add('ativo')
      };
      });
   });
});