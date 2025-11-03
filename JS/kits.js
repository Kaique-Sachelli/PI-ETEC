let kitSelecionado = [];

function adicionarAoKit(elemento) {
    const nomeProduto = elemento.querySelector("p").innerText.trim();
    const imagemProduto = elemento.querySelector("img").getAttribute("src");
    const produtoExistente = kitSelecionado.find(item => item.nome === nomeProduto);
    const tipoElemento = elemento.dataset.tipo;
    const estoque = tipoElemento === 'vidraria'
        ? parseInt(elemento.dataset.estoque, 10) || 0
        : parseFloat(elemento.dataset.estoque) || 0;
    const passoInicial = tipoElemento === 'reagente' ? 0.1 : 1;
    if (produtoExistente) {
        alert("Este produto já foi adicionado ao kit");
        return;
    }
    kitSelecionado.push({ nome: nomeProduto, imagem: imagemProduto, quantidade: passoInicial, estoqueMax: estoque, tipo: tipoElemento});
    atualizarKit();
}

function removerDoKit(index) {
    kitSelecionado.splice(index, 1);
    atualizarKit();
}

function alterarQuantidade(index, delta) {
    const item = kitSelecionado[index];
    const step = item.tipo === 'reagente' ? 0.1 : 1;
    let novaQtd = item.quantidade + delta;
    if (item.tipo === 'reagente') {
        novaQtd = parseFloat(novaQtd.toFixed(1));
    } else {
        novaQtd = Math.round(novaQtd);
    }
    const min = item.tipo === 'reagente' ? step : 1;
    if (novaQtd < min) return;
    if (item.estoqueMax !== undefined && novaQtd > item.estoqueMax) {
        return;
    }
    item.quantidade = novaQtd;
    atualizarKit();
}

function atualizarQuantidadeManual(index, novaQtd) {
    if (isNaN(novaQtd)) {
        alert("Quantidade inválida!");
        return;
    }
    const item = kitSelecionado[index];
    const step = item.tipo === 'reagente' ? 0.1 : 1;
    const min = item.tipo === 'reagente' ? step : 1;
    // aplicar arredondamento apropriado
    if (item.tipo === 'reagente') {
        novaQtd = parseFloat(novaQtd);
        novaQtd = parseFloat(novaQtd.toFixed(1));
    } else {
        novaQtd = Math.round(novaQtd);
    }
    if (novaQtd < min) {
        alert("Quantidade inválida!");
        return;
    }
    if (item.estoqueMax !== undefined && novaQtd > item.estoqueMax) {
        mostrarNotificao('Quantidade ajustada para o máximo disponível no estoque.', 'erro');
        item.quantidade = item.estoqueMax;
    } else {
        item.quantidade = novaQtd;
    }
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

            <div class="kit-qtd-container">
                <button class="qtd-btn mais">+</button>
                <input type="number" min="1" value="${item.tipo === 'reagente' ? item.quantidade.toFixed(1) : item.quantidade}" class="kit-qtd" title="Quantidade">
                <button class="qtd-btn menos">−</button>
            </div>

            <button class="remover-item">&times;</button>
        `;


    const passo = item.tipo === 'reagente' ? 0.1 : 1;
    div.querySelector(".mais").addEventListener("click", () => alterarQuantidade(index, passo));
    div.querySelector(".menos").addEventListener("click", () => alterarQuantidade(index, -passo));
        div.querySelector(".kit-qtd").addEventListener("change", (e) => {
            const raw = e.target.value;
            const parsed = item.tipo === 'vidraria' ? parseInt(raw, 10) : parseFloat(raw);
            atualizarQuantidadeManual(index, parsed);
        });

        div.querySelector(".remover-item").addEventListener("click", () => removerDoKit(index));

        listaContainer.appendChild(div);
        // Desabilita o botão '+' se atingiu o estoque máximo
        const maisBtn = div.querySelector('.mais');
        if (item.estoqueMax !== undefined && Number(item.quantidade) >= Number(item.estoqueMax)) {
            maisBtn.disabled = true;
            maisBtn.classList.add('disabled');
        } else {
            maisBtn.disabled = false;
            maisBtn.classList.remove('disabled');
        }
        const inputQtd = div.querySelector('.kit-qtd');
        if (inputQtd) {
            if (item.tipo === 'reagente') {
                inputQtd.setAttribute('step', '0.1');
                inputQtd.setAttribute('min', '0.1');
            } else {
                inputQtd.setAttribute('step', '1');
                inputQtd.setAttribute('min', '1');
            }
        }
    });
    const addIcon = document.querySelector(".add-icon");
    if (addIcon) addIcon.style.display = kitSelecionado.length > 0 ? "none" : "block";
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
        // armazena o tipo e o número do estoque no dataset para facilitar verificações
        btn.dataset.tipo = tipo;
        btn.dataset.estoque = tipo === 'vidraria'
            ? (parseInt(item.quantidade, 10) || 0)
            : (parseFloat(item.quantidade) || 0);
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

        const nomes = kitSelecionado
            .map(item => `${item.nome} — Quantidade: ${item.quantidade}`)
            .join("\n• ");
        alert("Kit finalizado com os seguintes itens:\n\n• " + nomes);

        const kitFinal = {
            nomeKit : nome,
            descricaoKit : descricao,
            produtos : kitSelecionado
        }
        console.log(kitFinal.nomeKit)
    });
}


