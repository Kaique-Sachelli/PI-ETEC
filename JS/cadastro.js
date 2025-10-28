//função para cadastro de usuários
document.getElementById("formCadastro").addEventListener("submit", async (e) => {
   e.preventDefault();

   const nome = document.getElementById("nomeCadastro").value
   const email = document.getElementById("emailCadastro").value
   const senha = document.getElementById("senhaCadastro").value
   const login = document.getElementById("loginCadastro").value

   if (nome && email && senha && login != null) {
      try {
         const resposta = await fetch('http://localhost:5502/cadastro', {
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

// função para alterar usuário
async function carregarUsuarios() {
   selectUsuarios = document.getElementById("selectAlterar")
   try {
      const resposta = await fetch('http://localhost:5502/usuarios')
      const dados = resposta.json()
      if (dados.sucesso) {
         selectUsuarios.innerHTML = '<option value="">Selecione um usuário</option>'
         dados.usuarios.forEach(usuario => {
            const option = document.createElement('option')
            option.value = usuario.permissao
            option.textContent = usuario.nome
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
//função para carregar a página e executar métodos
   document.addEventListener('DOMContentLoaded', function(){
      carregarUsuarios()
   })

// função para notificação
const notificação = document.getElementById('notificacao')
let timerNotificacao = null;

function mostrarNotificao(mensagem, tipo) {
   clearTimeout(timerNotificacao)

   notificação.textContent = mensagem;
   notificação.className = ''
   notificação.classList.add(tipo)

   notificação.classList.add('show')

   timerNotificacao = setTimeout(() => {
      notificação.classList.remove('show')
   }, 2000)
}



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