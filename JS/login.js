// Código do login
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const resposta = await fetch('http://localhost:5502/login', {
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