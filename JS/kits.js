let kitSelecionado = [];

function adicionarAoKit(elemento) {
    const nomeProduto = elemento.querySelector("p").innerText.trim();
    const imagemProduto = elemento.querySelector("img").getAttribute("src");
    kitSelecionado.push({ nome: nomeProduto, imagem: imagemProduto });
    atualizarKit();
}

function removerDoKit(index) {
    kitSelecionado.splice(index, 1);
    atualizarKit();
}

function atualizarKit() {
    const kitContainer = document.querySelector(".kit-container");
    let listaContainer = kitContainer.querySelector(".kit-lista");


    if (!listaContainer) {
        listaContainer = document.createElement("div");
        listaContainer.classList.add("kit-lista");
        kitContainer.insertBefore(listaContainer, kitContainer.querySelector(".finalizar-button"));
    }


    listaContainer.innerHTML = "";
    kitSelecionado.forEach((item, index) => {
        const div = document.createElement("div");
        div.classList.add("kit-item");
        div.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}" class="kit-img">
            <span class="kit-nome">${item.nome}</span>
            <button class="remover-item">&times;</button>
        `;

        div.querySelector(".remover-item").addEventListener("click", () => removerDoKit(index));
        listaContainer.appendChild(div);
    });

    const addIcon = document.querySelector(".add-icon");
    addIcon.style.display = kitSelecionado.length > 0 ? "none" : "block";
}
document.addEventListener("DOMContentLoaded", () => {
    inicializarEventos()
    carregarProdutos();
});

async function carregarProdutos() {
    const container = document.querySelector(".produtos-lista");
    if (!container) return;
    try {
        container.innerHTML = "";
        const [Vidrarias, Reagentes] = await Promise.all([
            fetch('http://localhost:3000/vidrarias'),
            fetch('http://localhost:3000/reagentes')
        ]);
        const dadosVidrarias = await Vidrarias.json();
        if (dadosVidrarias.sucesso) {
            renderizarItens(dadosVidrarias.vidrarias, container, 'vidraria');
        }
        else {
            mostrarNotificao(dadosVidrarias.mensagem, 'erro')
        }
        const dadosReagentes = await Reagentes.json();
        if (dadosReagentes.sucesso) {
            renderizarItens(dadosReagentes.reagentes, container, 'reagente');
        }
        else {
            mostrarNotificao(dadosReagentes.mensagem, 'erro')
        }
    } catch (error) {
        console.log(error.message)
        mostrarNotificao('Não foi possivel carregar o estoque. Tente novamente', "erro")

    }
}

function renderizarItens(itens, container, tipo) {
    const imgNome = (tipo === 'vidraria') ? 'Vidraria-img.png' : 'beaker.png';

    itens.forEach(item => {
        const btn = document.createElement("button");
        btn.className = `col-lg-3 col-md-4 col-sm-6 ${tipo}`; //

        let nome, detalhe, quantidade;

        if (tipo === 'vidraria') {
            nome = item.nomeVidraria;
            detalhe = item.capacidade || '';
            quantidade = `${item.quantidade} und.`;
        } else {
            nome = item.nomeReagente;
            detalhe = '';
            quantidade = `${item.quantidade}g`;
        }
        btn.innerHTML = `
            <img src="../Img/${imgNome}" alt="${nome}" class="${tipo}-img">
            <p> ${nome} <br> ${detalhe} <br> ${quantidade}</p>
        `;
        btn.addEventListener("click", () => adicionarAoKit(btn));

        container.appendChild(btn);
    });
}

// função para notificação
let timerNotificacao = null;
function mostrarNotificao(mensagem, tipo) {
    const notificação = document.getElementById('notificacao')
    clearTimeout(timerNotificacao)

    notificação.textContent = mensagem;
    notificação.className = ''
    notificação.classList.add(tipo)

    notificação.classList.add('show')

    timerNotificacao = setTimeout(() => {
        notificação.classList.remove('show')
    }, 2000)
}

function inicializarEventos() {

    const produtos = document.querySelectorAll(".vidraria, .reagente");
    produtos.forEach(produto => {
        produto.addEventListener("click", () => adicionarAoKit(produto));
    });

    const botaoFinalizar = document.querySelector(".finalizar-button");
    botaoFinalizar.addEventListener("click", () => {
        const nome = document.getElementById('nomeKit').value
        const descricao = document.getElementById('descricaoKit').value
        if (kitSelecionado.length === 0) {
            mostrarNotificao('Nenhum item selecionado!', 'erro')
            return;
        }
        const kitFinal = {
            nomeKit : nome,
            descricaoKit : descricao,
            produtos : kitSelecionado
        }
        console.log(kitFinal.nomeKit)
        
    });
}


