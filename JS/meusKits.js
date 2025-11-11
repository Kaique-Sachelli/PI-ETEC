import { mostrarNotificacao } from "./notificacao.js";
import { getToken } from "./sessao.js";

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
            const kits = dados.kits
            if (kits.length === 0) {
                listaKitsContainer.innerHTML = '<p>Você ainda não criou nenhum kit.</p>'
                return
            } else {
                kits.forEach(kit => {
                    let produtosHtml = '';
                    produtosHtml = kit.produtos.map(produto =>
                        `<li> ${produto.nome} - ${produto.quantidade} un. </li>`
                    ).join('');
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
                                <p><strong>Data de criação:</strong> ${kit.dataCriacao || 'N/A'}</p>
                                <p><strong>Descrição:</strong> ${kit.descricaoKit || 'Sem descrição'}</p>
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
        mostrarNotificacao('Erro interno no servidor','erro')
        console.log(error.message)
    }
}