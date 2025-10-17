
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



