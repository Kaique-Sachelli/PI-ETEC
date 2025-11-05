document.addEventListener('DOMContentLoaded', async () => {
  const idUsuario = sessionStorage.getItem('idUsuario');
  if (!idUsuario) {
    // redireciona se não estiver logado
    window.location.href = './login.html';
    return;
  }

  // exemplo: buscar dados do usuário usando o id
  try {
    const res = await fetch(`http://localhost:3000/usuarios/${idUsuario}`);
    const dados = await res.json();
    if (dados.sucesso) {
      // use dados.usuario para preencher a página
      console.log('Usuário:', dados.usuario);
    } else {
      console.warn(dados.mensagem);
    }
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
  }
});