// Código do login
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const resposta = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const dados = await resposta.json();
        const msg = document.getElementById('mensagem');
        msg.textContent = dados.mensagem;
        msg.style.color = dados.sucesso ? 'green' : 'red';
        if (dados.sucesso) {
            window.location.href = '../HTML/inicio.html';
        }
    } catch (erro) {
        console.error('Erro ao tentar fazer login:', erro);
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
    const input = document.getElementById("senha");
    const icon = document.querySelector(".toggle-senha");

    if(input.type === "password"){
        input.type = "text";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    } else{
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