import { mostrarNotificacao } from "./notificacao.js";
import { getToken, erroToken } from "./sessao.js";

//função para exluir kit
async function exluiKit(idKit) {
    const token = getToken();
    if (!token) {
        erroToken();
        return;
    } else {
        try {
            const resposta = await fetch(`http://localhost:3000/kits/excluir/${idKit}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })
            const dados = await resposta.json();
            if (dados.sucesso) {
                mostrarNotificacao(dados.mensagem, 'sucesso')
                exibirKits();
            } else {
                mostrarNotificacao(dados.mensagem, 'erro')
                console.log(dados.erro)
            }
        } catch (error) {
            mostrarNotificacao('Não foi possivel excluir kit. Erro de conexão', 'erro')
            console.log(error.message)
        }
    }
}
//função de renderizar os kits
export async function exibirKits() {
    const token = getToken();
    const listaKitsContainer = document.querySelector('#containerMeusKits .produtos-lista');
    try {
        const resposta = await fetch('http://localhost:3000/kits/buscar', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        const dados = await resposta.json();
        if (dados.sucesso) {
            listaKitsContainer.innerHTML = '';
            const kits = dados.kits
            if (kits.length === 0) {
                listaKitsContainer.innerHTML = '<p>Você ainda não criou nenhum kit.</p>'
                return
            } else {
                kits.forEach(kit => {
                    let produtosHtml = '';
                    produtosHtml = kit.produtos.map(produto =>{
                        const unidade = (produto.tipo === 'reagente') ? 'g' : 'un.'; //verifica a unidade de cada produto.
                        return `<li> ${produto.nome} - ${produto.quantidade} ${unidade} </li>`
                }).join('');
                    const kitHtml = `
                    <details class="verde">
                        <summary>
                            <div class="linha">
                                <span>${kit.nomeKit}</span>
                                <p></p><p></p><p></p> <i class="bi bi-chevron-down seta">▼</i>
                            </div>
                        </summary>
                        
                        <div class="detalhes-box">
                            <div class="coluna">
                                <h4>Dados do Kit:</h4>
                                <p><strong>Professor:</strong> ${kit.nomeProfessor}</p>
                                <p><strong>Descrição:</strong> ${kit.descrição || 'Sem descrição'}</p>
                            </div>
                            
                            <div class="coluna">
                                <h4>Produtos no Kit:</h4>
                                <ul>
                                    ${produtosHtml}
                                </ul>
                            </div>
                            
                            <div class="botoes">
                                <button class="botao_excluir" data-id="${kit.idKit}">Excluir Kit</button>
                            </div>
                        </div>
                    </details>
                    `;
                    listaKitsContainer.insertAdjacentHTML('beforeend', kitHtml);
                });
            }
        } else {
            mostrarNotificacao('Erro ao carregar kits', 'erro')
        }
    } catch (error) {
        mostrarNotificacao('Erro interno no servidor', 'erro')
        console.log(error.message)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const listaKitsContainer = document.querySelector('#containerMeusKits .produtos-lista');
    listaKitsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('botao_excluir')) {
            const idKit = event.target.dataset.id;
            exluiKit(idKit);
        }
    })
    inicializarPesquisa();
});

//função para pesquisar meus kits
/**
 * * @param {string} termo - O texto digitado pelo usuário (já em minúsculas).
 */

function pesquisarKit(termo) {
    const container = document.querySelector('#containerMeusKits .kits-scroll .produtos-lista');
    const kits = container.querySelectorAll('details.verde');
    kits.forEach(kit =>{
        const nomeElemento = kit.querySelector('summary span')
        if (nomeElemento) {
            const nomeKit = nomeElemento.innerText.toLowerCase();
            if (nomeKit.includes(termo)) {
                kit.classList.remove('d-none');
            } else {
                kit.classList.add('d-none');
            }
        }
    })
}
function inicializarPesquisa(){
    const barraPesquisa = document.querySelector('#containerMeusKits #pesquisaKits .input');
    if (barraPesquisa) {
        barraPesquisa.addEventListener('input', (e) =>{
            const termoPesquisa = e.target.value.trim().toLowerCase();
            pesquisarKit(termoPesquisa);
        });
    }
}
