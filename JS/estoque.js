import { mostrarNotificacao } from "./notificacao.js";
import { encerrarSessao, getToken } from "./sessao.js";


let kitSelecionado = [];
let modoVisualizacao = "solicitar";

function adicionarAoKit(elemento) {
    const nomeProduto = elemento.querySelector("p").innerText.trim();
    const imagemProduto = elemento.querySelector("img").getAttribute("src");
    const produtoExistente = kitSelecionado.find(item => item.nome === nomeProduto);
    if (produtoExistente) {
        mostrarNotificacao("Este produto já foi adicionado ao kit", "erro");
        return;
    }
    kitSelecionado.push({ nome: nomeProduto, imagem: imagemProduto, quantidade: 1 });
    solicitarMaterial();
    gerenciarEstoque()
}

function removerDoKit(index) {
    kitSelecionado.splice(index, 1);
    solicitarMaterial();
    gerenciarEstoque()
}

function alterarQuantidade(index, delta) {
    const item = kitSelecionado[index];
    const novaQtd = item.quantidade + delta;
    if (novaQtd >= 1) {
        item.quantidade = novaQtd;
        solicitarMaterial();
        gerenciarEstoque()
    }
}

function atualizarQuantidadeManual(index, novaQtd) {
    if (novaQtd <= 0 || isNaN(novaQtd)) {
        mostrarNotificacao("Quantidade inválida!", "erro");
        return;
    }
    kitSelecionado[index].quantidade = novaQtd;
    solicitarMaterial();
    gerenciarEstoque()
}

function solicitarMaterial() {
    const kitContainer = document.querySelector(".kit-container-solicitar");
    let listaContainer = kitContainer.querySelector(".kit-lista-solicitar");
    if (!listaContainer) {
        listaContainer = document.createElement("div");
        listaContainer.classList.add("kit-lista-solicitar");
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

function gerenciarEstoque() {
    const kitContainer = document.querySelector(".kit-container-gerenciar");
    let listaContainer = kitContainer.querySelector(".kit-lista-gerenciar");
    if (!listaContainer) {
        listaContainer = document.createElement("div");
        listaContainer.classList.add("kit-lista-gerenciar");
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

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos("indisponiveis"); //inicia a pagina com todos os produtos indisponiveis em display
    pesquisarProdutos();
    const linksFiltro = document.querySelectorAll(".filtro .submenu-link");
    linksFiltro.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const filtro = e.target.getAttribute('data-filtro'); 
            if (filtro) {
                carregarProdutos(filtro);
            }
            if (filtro == "indisponiveis") {
                document.querySelector(".produtos-title").innerHTML = "Produtos indisponíveis"
            } else if (filtro == "disponiveis") {
                document.querySelector(".produtos-title").innerHTML = "Produtos disponíveis"
            }
        });
    });
});

async function carregarProdutos(filtro) {
    const container = document.querySelector(".produtos-lista");
    if (!container) return;
    try {
        container.innerHTML = "";
        const token = getToken();
        if (filtro == "indisponiveis") {
            //carrega todos os produtos
            const [Vidrarias, Reagentes] = await Promise.all([
                fetch('http://localhost:3000/vidrarias/indisponiveis', {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }),
                fetch('http://localhost:3000/reagentes/indisponiveis', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
            ]);
            const dadosVidrarias = await Vidrarias.json();
            if (dadosVidrarias.sucesso) {
                renderizarItens(dadosVidrarias.vidrarias, container, 'vidraria');
            }
            else {
                mostrarNotificacao(dadosVidrarias.mensagem, 'erro')
            }
            const dadosReagentes = await Reagentes.json();
            if (dadosReagentes.sucesso) {
                renderizarItens(dadosReagentes.reagentes, container, 'reagente');
            }
            else {
                mostrarNotificacao(dadosReagentes.mensagem, 'erro')
            }
        } else if (filtro == 'disponiveis') {
            const [Vidrarias, Reagentes] = await Promise.all([
                fetch('http://localhost:3000/vidrarias',{
                    'method': 'GET',
                    headers: {
                       'Authorization': `Bearer ${token}`
                    }
                }),
                fetch('http://localhost:3000/reagentes',{
                    'method': 'GET',
                    headers: {
                       'Authorization': `Bearer ${token}`
                    }
                })
            ]);
            const dadosVidrarias = await Vidrarias.json();
            if (dadosVidrarias.sucesso) {
                renderizarItens(dadosVidrarias.vidrarias, container, 'vidraria');
            }
            else {
                mostrarNotificacao(dadosVidrarias.mensagem, 'erro')
            }
            const dadosReagentes = await Reagentes.json();
            if (dadosReagentes.sucesso) {
                renderizarItens(dadosReagentes.reagentes, container, 'reagente');
            }
            else {
                mostrarNotificacao(dadosReagentes.mensagem, 'erro')
            }    
        }
    } catch (error) {
        console.log(error.message)
        mostrarNotificacao('Não foi possivel carregar o estoque. Tente novamente', "erro")
    }
}

function renderizarItens(itens, container, tipo) {
    const imgNome = (tipo === 'vidraria') ? 'Vidraria-img.png' : 'beaker.png';

    itens.forEach(item => {
        const btn = document.createElement("button");
        btn.className = `col-lg-3 col-md-4 col-sm-6 ${tipo}`; 

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
        if (item.quantidade > 0) {
            btn.innerHTML = `
                <img src="../Img/${imgNome}" alt="${nome}" class="${tipo}-img">
                <p> ${nome} <br> ${detalhe} <br> <span class="produto-quantidade">${quantidade}</span></p>
            `;
        } else {
            btn.innerHTML = `
                <img src="../Img/${imgNome}" alt="${nome}" class="${tipo}-img">
                <p> ${nome} <br> ${detalhe} <br> <span class="produto-indisponivel">${quantidade}</span></p>
            `;
        }
        // armazena o tipo e o número do estoque no dataset para facilitar verificações
        btn.dataset.tipo = tipo;
        btn.dataset.estoque = tipo === 'vidraria'
            ? (parseInt(item.quantidade, 10) || 0)
            : (parseFloat(item.quantidade) || 0);
        btn.addEventListener("click", () => adicionarAoKit(btn));

        container.appendChild(btn);
    });
}

// Visualização Única
function alternarVisualizacao(tipo) {
    const containerSolicitar = document.querySelector("#containerSolicitar");
    const containerGerenciar = document.querySelector("#containerGerenciar");

    if (tipo === "gerenciar") {
        modoVisualizacao = "gerenciar";
        containerSolicitar.style.display = "none";
        containerGerenciar.style.display = "flex";
    } else {
        modoVisualizacao = "solicitar";
        containerSolicitar.style.display = "flex";
        containerGerenciar.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const opcoesFiltro = document.querySelectorAll(".submenu-link");
    opcoesFiltro.forEach(opcao => {
        opcao.addEventListener("click", (e) => {
            e.preventDefault();
            const texto = opcao.textContent.trim().toLowerCase();
            let botaoSolicitar = document.getElementById("solicitar")
            let botaoGerenciar = document.getElementById("gerenciar")
            if (texto.includes("gerenciar")) {
                alternarVisualizacao("gerenciar")
                botaoSolicitar.classList.remove('ativo')
                botaoGerenciar.classList.add('ativo')
                kitSelecionado = []
                document.querySelector(".kit-lista-gerenciar").innerHTML = ""
            };
            if (texto.includes("solicitar")) {
                alternarVisualizacao("solicitar")
                botaoGerenciar.classList.remove('ativo')
                botaoSolicitar.classList.add('ativo')
                kitSelecionado = []
                document.querySelector(".kit-lista-solicitar").innerHTML = ""
            };
        });
    });
});

document.querySelectorAll('.cancelar-button').forEach(button => {
    button.addEventListener('click', () => {
        if (kitSelecionado.length == 0) {
            return
        } else {
            kitSelecionado = [];
            document.querySelector('.kit-lista-solicitar').innerHTML = ""
            document.querySelector('.kit-lista-gerenciar').innerHTML = ""
            mostrarNotificacao("Processo encerrado, materiais removidos", "sucesso");
        }
    });
});

//função de pesquisa para materias 
/**
 * * @param {string} termo - O texto digitado pelo usuário (já em minúsculas).
 */
function filtrarItens(termo) {
    const container = document.querySelector('.container-produtos, .produtos-lista');
    const itens = container.querySelectorAll('.produtos-lista >  button');
    itens.forEach(item =>{
        const p = item.querySelector('p');
        if (p) {
            const nomeProduto = p.innerText.toLowerCase();
            if (nomeProduto.includes(termo)) {
                item.classList.remove('d-none');
            } else {
                item.classList.add('d-none');
            }
        }
    })
}
function pesquisarProdutos(){
    const barraPesquisa = document.querySelector('.container-produtos #pesquisaProdutos .input');
    barraPesquisa.addEventListener('input', (e) =>{
        const termoPesquisa = e.target.value.trim().toLowerCase();
        filtrarItens(termoPesquisa);
    });
}