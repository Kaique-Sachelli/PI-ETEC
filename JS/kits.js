let kitSelecionado = [];

function adicionarAoKit(elemento) {
    const nomeProduto = elemento.querySelector("p").innerText.trim();
    const imagemProduto = elemento.querySelector("img").getAttribute("src");
    const produtoExistente = kitSelecionado.find(item => item.nome === nomeProduto);
    if (produtoExistente) {
        alert("Este produto já foi adicionado ao kit");
        return;
    }
    kitSelecionado.push({ nome: nomeProduto, imagem: imagemProduto, quantidade: 1 });
    atualizarKit();
}

function removerDoKit(index) {
    kitSelecionado.splice(index, 1);
    atualizarKit();
}

function alterarQuantidade(index, delta) {
    const item = kitSelecionado[index];
    const novaQtd = item.quantidade + delta;
    if (novaQtd >= 1) {
        item.quantidade = novaQtd;
        atualizarKit();
    }
}

function atualizarQuantidadeManual(index, novaQtd) {
    if (novaQtd <= 0 || isNaN(novaQtd)) {
        alert("Quantidade inválida!");
        return;
    }
    kitSelecionado[index].quantidade = novaQtd;
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
                <input type="number" min="1" value="${item.quantidade}" class="kit-qtd" title="Quantidade">
                <button class="qtd-btn menos">−</button>
            </div>

            <button class="remover-item">&times;</button>
        `;

        div.querySelector(".mais").addEventListener("click", () => alterarQuantidade(index, +1));
        div.querySelector(".menos").addEventListener("click", () => alterarQuantidade(index, -1));
        div.querySelector(".kit-qtd").addEventListener("change", (e) => {
            atualizarQuantidadeManual(index, parseInt(e.target.value, 10));
        });

        div.querySelector(".remover-item").addEventListener("click", () => removerDoKit(index));

        listaContainer.appendChild(div);
    });
    const addIcon = document.querySelector(".add-icon");
    if (addIcon) addIcon.style.display = kitSelecionado.length > 0 ? "none" : "block";
}

function inicializarEventos() {
    const produtos = document.querySelectorAll(".vidraria, .reagente");
    produtos.forEach(produto => {
        produto.addEventListener("click", () => adicionarAoKit(produto));
    });

    const botaoFinalizar = document.querySelector(".finalizar-button");
    botaoFinalizar.addEventListener("click", () => {
        if (kitSelecionado.length === 0) {
            alert("Nenhum item selecionado!");
            return;
        }

        const nomes = kitSelecionado
            .map(item => `${item.nome} — Quantidade: ${item.quantidade}`)
            .join("\n• ");
        alert("Kit finalizado com os seguintes itens:\n\n• " + nomes);
    });
}

document.addEventListener("DOMContentLoaded", inicializarEventos);
