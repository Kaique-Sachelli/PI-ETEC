// Código do login
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const resposta = await fetch('http://localhost:5501/login', {
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
const senhaInput = document.getElementById('senha');
const toggleBtn = document.getElementById('toggleSenha');

if (senhaInput && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const tipo = senhaInput.getAttribute('type');

        if (tipo === 'password'){
            senhaInput.setAttribute('type', 'text');
            toggleBtn.classList.add('mostrando');
        }else{
            senhaInput.setAttribute('type', 'password');
            toggleBtn.classList.remove('mostrando');
        }
    });
}