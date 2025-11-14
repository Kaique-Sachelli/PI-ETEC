
import { exibirKits } from "./meusKits.js";
import { mostrarNotificacao } from "./notificacao.js"
import { getToken, erroToken } from "./sessao.js"

let kitSelecionado = [];
let modoVisualizacao = "criar kits";

function adicionarAoKit(elemento) {
    const pElem = elemento.querySelector('p');
    let nomeProduto = '';
    if (pElem) {
        const partes = pElem.innerText.split('\n').map(s => s.trim()).filter(Boolean);
        const nome = partes[0] || '';
        const detalhe = partes[1] || '';
        nomeProduto = detalhe ? `${nome} — ${detalhe}` : nome;
    } else {
        nomeProduto = elemento.innerText.trim();
    }
    const imagemProduto = elemento.querySelector("img").getAttribute("src");
    const produtoExistente = kitSelecionado.find(item => item.nome === nomeProduto);
    const tipoElemento = elemento.dataset.tipo;
    const estoque = tipoElemento === 'vidraria'
        ? parseInt(elemento.dataset.estoque, 10) || 0
        : parseFloat(elemento.dataset.estoque) || 0;
    const passoInicial = tipoElemento === 'reagente' ? 0.1 : 1;
    const idProduto = elemento.dataset.idProduto;
    if (produtoExistente) {
        mostrarNotificacao("Este produto já foi adicionado ao kit", "erro");
        return;
    }
    kitSelecionado.push({
        nome: nomeProduto,
        imagem: imagemProduto,
        quantidade: passoInicial,
        estoqueMax: estoque,
        tipo: tipoElemento,
        idProduto: idProduto
    });
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
        mostrarNotificacao('Quantidade ajustada para o máximo disponível no estoque.', 'erro');
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
    carregarProdutos('todos'); //inicia a pagina com todos os produtos em display
    pesquisarProdutos();
    const linksFiltro = document.querySelectorAll(".filtro .submenu-link");
    linksFiltro.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const filtro = e.target.getAttribute('data-filtro'); 
            if (filtro) {
                carregarProdutos(filtro);
            }
        });
    });
    const opcoesFiltro = document.querySelectorAll(".selecionar-funcao .submenu-link");
    opcoesFiltro.forEach(opcao => {
        opcao.addEventListener("click", (e) => {
            e.preventDefault();
            const texto = opcao.textContent.trim().toLowerCase();
            let botaoCriarKits = document.getElementById("criarKits")
            let botaoMeusKits = document.getElementById("meusKits")
            if (texto.includes("meus kits")) {
                alternarVisualizacao("meus kits")
                botaoCriarKits.classList.remove('ativo')
                botaoMeusKits.classList.add('ativo')
                exibirKits();
            };
            if (texto.includes("criar kits")) {
                alternarVisualizacao("criar kits")
                botaoMeusKits.classList.remove('ativo')
                botaoCriarKits.classList.add('ativo')
            };
        });
    });
});

async function carregarProdutos(filtro) {
    const container = document.querySelector(".produtos-lista");
    if (!container) return;
    try {
        container.innerHTML = "";
        const token = getToken();
        if (filtro == "todos") {
            //carrega todos os produtos
            const [Vidrarias, Reagentes] = await Promise.all([
                fetch('http://localhost:3000/vidrarias', {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }),
                fetch('http://localhost:3000/reagentes', {
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
        } else if (filtro == 'vidraria') {
            //carrega apenas vidrarias
            const Vidrarias = await fetch('http://localhost:3000/vidrarias', {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            const dadosVidrarias = await Vidrarias.json();
            if (dadosVidrarias.sucesso) {
                renderizarItens(dadosVidrarias.vidrarias, container, 'vidraria');
            }
            else {
                mostrarNotificacao(dadosVidrarias.mensagem, 'erro')
            }

        } else if (filtro == "reagente") {
            const Reagentes = await fetch('http://localhost:3000/reagentes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
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
        btn.className = `col-lg-3 col-md-4 col-sm-6 ${tipo}`; //

        let nome, detalhe, quantidade, idProduto;

        if (tipo === 'vidraria') {
            nome = item.nomeVidraria;
            detalhe = item.capacidade || '';
            quantidade = `${item.quantidade} und.`;
            idProduto = item.idVidraria;
        } else {
            nome = item.nomeReagente;
            detalhe = '';
            quantidade = `${item.quantidade}g`;
            idProduto = item.idReagente;
        }
        btn.innerHTML = `
            <img src="../Img/${imgNome}" alt="${nome}" class="${tipo}-img">
            <p> ${nome} <br> ${detalhe} <br> <span class="produto-quantidade">${quantidade}</span></p>
        `;
        // armazena o tipo e o número do estoque no dataset para facilitar verificações
        btn.dataset.tipo = tipo;
        btn.dataset.estoque = tipo === 'vidraria'
            ? (parseInt(item.quantidade, 10) || 0)
            : (parseFloat(item.quantidade) || 0);
        btn.addEventListener("click", () => adicionarAoKit(btn));
        btn.dataset.idProduto = idProduto;

        container.appendChild(btn);
    });
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
            mostrarNotificacao('Nenhum item selecionado!', 'erro')
            return;
        }
        const kitFinal = {
            nomeKit: nome,
            descricaoKit: descricao,
            produtos: kitSelecionado
        }
        //função para salvar o kit
        salvaKit(kitFinal);
    });
}

function alternarVisualizacao(tipo) {
    const containerCriarKits = document.querySelector("#containerCriarKits");
    const containerMeusKits = document.querySelector("#containerMeusKits");

    if (tipo === "meus kits") {
        modoVisualizacao = "meus kits";
        containerCriarKits.style.display = "none";
        containerMeusKits.style.display = "flex";
    } else {
        modoVisualizacao = "criar kits";
        containerCriarKits.style.display = "flex";
        containerMeusKits.style.display = "none";
    }
}
//Função de salvar kits
async function salvaKit(kit) {
    const token = getToken();
    const nomeKit = kit.nomeKit;
    const produtos = kit.produtos;
    if (!token) {
        erroToken();
        return;
    } else {
        if (!nomeKit || !produtos || produtos.length === 0) {
            mostrarNotificacao('Nome ou Produtos do kit faltando', 'erro');
        } else {
            try {
                const resposta = await fetch('http://localhost:3000/kits/salvar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(kit)
                })
                const dados = await resposta.json();
                if (dados.sucesso) {
                    mostrarNotificacao(dados.mensagem, 'sucesso')
                    kitSelecionado.length = 0;
                    atualizarKit();
                    document.getElementById('nomeKit').value = ''
                    document.getElementById('descricaoKit').value = ''
                } else {
                    mostrarNotificacao(dados.mensagem, 'erro')
                    console.log(dados.erro)
                }
            } catch (error) {
                mostrarNotificacao('Não foi possivel salvar o kit. Erro de conexão', 'erro')
                console.log(error.message)
            }
        }   
        }
}

//função de pesquisa para materias 
/**
 * * @param {string} termo - O texto digitado pelo usuário (já em minúsculas).
 */
function filtrarItens(termo) {
    const container = document.querySelector('#containerCriarKits, .produtos-lista');
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
    const barraPesquisa = document.querySelector('#containerCriarKits #pesquisaProdutos .input');
    barraPesquisa.addEventListener('input', (e) =>{
        const termoPesquisa = e.target.value.trim().toLowerCase();
        filtrarItens(termoPesquisa);
    });
}