
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
        kitContainer.insertBefore(listaContainer, kitContainer.querySelector(".finalize-button"));
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
    if (kitSelecionado.length > 0) {
        addIcon.style.display = "none";
    } else {
        addIcon.style.display = "block";
    }
}


function inicializarEventos() {
    const produtos = document.querySelectorAll(".container-item");
    produtos.forEach(produto => {
        produto.addEventListener("click", () => adicionarAoKit(produto));
    });

    const botaoFinalizar = document.querySelector(".finalize-button");
    botaoFinalizar.addEventListener("click", () => {
        if (kitSelecionado.length === 0) {
            alert("Nenhum item selecionado!");
            return;
        }

        const nomes = kitSelecionado.map(item => item.nome).join("\n• ");
        alert("Kit finalizado com os seguintes itens:\n\n• " + nomes);
    });
}

document.addEventListener("DOMContentLoaded", inicializarEventos);