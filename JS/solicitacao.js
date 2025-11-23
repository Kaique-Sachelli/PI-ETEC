import { mostrarNotificacao } from "./notificacao.js";
import { getToken, erroToken } from "./sessao.js";

const API_BASE = "http://localhost:3000";

// Arrays locais
let agendamentos = [];
let reposicoes = [];

function normalizarStatus(status) {
  const mapa = {
    Pendente: "pendente",
    Aprovado: "aprovado", 
    Reprovada: "cancelado", 
    Cancelado: "cancelado", 
    Finalizado: "finalizado", 
    Aprovada: "aprovado", 
    Concluida: "finalizado",
    Pedido_Realizado: "aprovado",
    "Kit Pronto": "aprovado",
  };
  const chave =
    status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
  return mapa[chave] || "pendente";
}

// Cores de status
function corStatus(status) {
  if (status === "aprovado") return "verde";
  if (status === "pendente") return "amarelo";
  if (status === "cancelado") return "vermelho";
  if (status === "finalizado") return "azul";
  return "amarelo";
}

// Texto visível de status
function statusText(status) {
  if (status === "aprovado") return "Aprovado";
  if (status === "pendente") return "Pendente";
  if (status === "cancelado") return "Cancelado";
  if (status === "finalizado") return "Finalizado";
  return status;
}

// Atualiza status no backend
async function atualizarStatusBackend(endpoint, id, novoStatus) {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/${endpoint}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: novoStatus }),
    });

    if (response.status === 401) return erroToken();
    if (!response.ok) console.error("Erro ao atualizar status");
  } catch (error) {
    console.error("Erro de conexão:", error);
  }
}

// Carrega solicitações do backend
async function carregarAgendamentos() {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/agendamentos/buscar`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) return erroToken();
    if (!response.ok) throw new Error("Erro ao carregar solicitações");

    const dados = await response.json();
     agendamentos = dados.map((s) => ({
      id: s.idAgendamento,
      data: s.data,
      periodo: s.periodo,
      aula : s.aula,
      horario: s.horarioAula,
      sala: s.sala,
      lab: s.idLaboratorio,
      professor: s.nome,
      status: normalizarStatus(s.status),
      dataSolicitacao: s.data,
      kit: s.kit,
      produtos : s.produtos
    }));
  } catch (error) {
    mostrarNotificacao('Erro ao carregar agendamentos', 'erro')
    console.error("Erro ao carregar agendamentos", error);
  }
  renderizaAgendamentos();
}

// Renderiza agendamentos no HTML
function renderizaAgendamentos() {
  // Renderiza os Agendamentos no HTML
    const container = document.querySelector(".container");
    container.innerHTML = `
    <div class="tabela-cabecalho">
      <span>Período</span>
      <span>Horário</span>
      <span>Sala</span>
      <span>Status</span>
      <span>Expandir</span>
    </div>
  `;
    agendamentos.forEach((s) => {
      //renderiza os produtos do kit
      const listaProdutos = s.produtos ? s.produtos.map(p => `
        <li>${p.nome} - ${p.quantidade} ${p.tipo === 'reagente' ? 'g' : 'und.'}</li>
    `).join('') : '<li>Nenhum item encontrado no kit.</li>';
      container.innerHTML += `
      <details class="${corStatus(s.status)}">
        <summary>
          <div class="linha">
            <span>${s.periodo}</span>
            <span>${s.horario}</span>
            <span>${s.sala}</span>
            <span class="status ${s.status}">${statusText(s.status)}</span>
            <i class="bi bi-chevron-down seta">▼</i>
          </div>
        </summary>
        <div class="detalhes-box">
          <div class="row w-100">
            <div class="coluna col-4">
              <h4>Dados do Agendamento:</h4>
              <p><strong>Professor:</strong> ${s.professor}</p>
              <p><strong>Aula:</strong> ${s.aula}</p>
              <p><strong>Sala:</strong> ${s.sala}</p>
              <p><strong>Data:</strong> ${s.data || "--/--/--"}</p>
              <p><strong>Kit:</strong> ${s.kit || "N/A"}</p>
            </div>
            <div style="width:2px;border-right:2px solid black;height:150px;"></div>
            <div class="coluna col-4">
              <h4>Produtos Solicitados (Itens do Kit):</h4>
              <ul>
                ${listaProdutos}
              </ul>
            </div>
            <div style="width:2px;border-right:2px solid black;height:150px;"></div>
            <div class="botoes col-3">
              ${gerarBotoesSolicitacoes(s.status, s.id)}
            </div>
          </div>
        </div>
      </details>
    `;
    });
  }

// Botões conforme status
function gerarBotoesSolicitacoes(status, id) {
  if (status === "pendente")
    return `
    <button class="btn btn-pronto" onclick="kitPronto(${id})">Devolver Kit</button>
    <button class="btn btn-cancelado" onclick="cancelar(${id})">Cancelar</button>`;

  if (status === "aprovado")
    return `
    <button class="btn btn-devolvido" onclick="finalizar(${id})">Kit Pronto</button>`;

  if (status === "cancelado")
    return `
    <button class="btn btn-pendente" onclick="voltarPendente(${id})">Reabrir Solicitação</button>`;

  return "";
}

// Funções de ação
async function cancelar(id) {
  if (!confirm("Deseja cancelar esta solicitação?")) return;
  await atualizarStatusBackend("solicitacoes", id, "cancelado");
  const s = solicitacoes.find((x) => x.id === id);
  if (s) s.status = "cancelado";
  carregarAgendamentos();
}

async function kitPronto(id) {
  await atualizarStatusBackend("solicitacoes", id, "aprovado");
  const s = solicitacoes.find((x) => x.id === id);
  if (s) s.status = "aprovado";
  carregarAgendamentos();
}

async function finalizar(id) {
  await atualizarStatusBackend("solicitacoes", id, "finalizado");
  const s = solicitacoes.find((x) => x.id === id);
  if (s) s.status = "finalizado";
  carregarAgendamentos();
}

async function voltarPendente(id) {
  await atualizarStatusBackend("solicitacoes", id, "pendente");
  const s = solicitacoes.find((x) => x.id === id);
  if (s) s.status = "pendente";
  carregarAgendamentos();
}

// -------------------------------
// 3 - REPOSIÇÕES DE ESTOQUE
// -------------------------------
async function carregarReposicoesDoBackend() {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/reposicoes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) return erroToken();
    reposicoes = await response.json();
  } catch (error) {
    console.error("Erro ao carregar reposições:", error);
    reposicoes = [
      {
        idReposicao: 1,
        dataPedido: "2025-10-12 15:00",
        status: "pendente",
        tecnico: "Fábio",
      },
    ];
  }
  carregarReposicoes();
}

function carregarReposicoes() {
  const container = document.querySelector(".containerprodutos .container");
  container.innerHTML = `
    <h2>Pedido para reposição de estoque</h2>
    <div class="tabela-cabecalho">
      <span>Data</span>
      <span></span>
      <span></span>
      <span>Status</span>
      <span>Expandir</span>
    </div>
  `;
  reposicoes.forEach((r) => {
    container.innerHTML += `
      <details class="${corStatus(r.status)}">
        <summary>
          <div class="linha">
            <span>${r.dataPedido}</span>
            <span></span>
            <span></span>
            <span class="status ${r.status}">${statusText(r.status)}</span>
            <i class="bi bi-chevron-down seta">▼</i>
          </div>
        </summary>
        <div class="detalhes-box">
          <div class="row">
            <div class="coluna col-4">
              <h4>Dados da Solicitação:</h4>
              <p><strong>Técnico:</strong> ${r.tecnico}</p>
            </div>
            <div class="botoes col-3">
             ${r.status !== "finalizado"
        ? `<button class="btn btn-finalizar" 
              onclick="finalizarReposicao(${r.idReposicao})">Finalizar</button>`
        : ""
      }
            </div>
          </div>
        </div>
      </details>
    `;
  });
}

async function finalizarReposicao(id) {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/reposicoes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "finalizado" }),
    });

    if (response.status === 401) return erroToken();
    const r = reposicoes.find((rep) => rep.idReposicao === id);
    if (r) r.status = "finalizado";
    carregarReposicoes();
    alert("Reposição finalizada com sucesso!");
  } catch (error) {
    console.error("Erro ao finalizar reposição:", error);
    alert("Erro ao finalizar reposição.");
  }
}

// -------------------------------
// 5 - FILTRO POR STATUS
// -------------------------------
function filtrarPorStatus(filtro) {
  const botoes = document.querySelectorAll(".submenu-link");
  botoes.forEach((btn) => btn.classList.remove("ativo"));

  const btnAtivo = [...botoes].find((b) =>
    b.textContent.toLowerCase().includes(filtro)
  );
  if (btnAtivo) btnAtivo.classList.add("ativo");

  let filtradas = solicitacoes;
  switch (filtro) {
    case "aprovado":
      filtradas = solicitacoes.filter(
        (s) => s.status === "pendente" || s.status === "aprovado"
      );
      break;
    case "cancelado":
      filtradas = solicitacoes.filter(
        (s) => s.status === "cancelado" || s.status === "finalizado"
      );
      break;
    case "todos":
    default:
      filtradas = solicitacoes;
      break;
  }

  const container = document.querySelector(".container");
  container.innerHTML = `
    <div class="tabela-cabecalho">
      <span>Período</span>
      <span>Horário</span>
      <span>Sala</span>
      <span>Status</span>
      <span>Expandir</span>
    </div>
  `;

  if (filtradas.length === 0) {
    container.innerHTML += `<p style="text-align:center; padding:20px;">Nenhuma solicitação encontrada.</p>`;
    return;
  }

  filtradas.forEach((s) => {
    container.innerHTML += `
      <details class="${corStatus(s.status)}">
        <summary>
          <div class="linha">
            <span>${s.periodo}</span>
            <span>${s.horario}</span>
            <span>${s.sala}</span>
            <span class="status ${s.status}">${statusText(s.status)}</span>
            <i class="bi bi-chevron-down seta">▼</i>
          </div>
        </summary>
        <div class="detalhes-box">
          <div class="row w-100">
            <div class="coluna col-4">
              <h4>Dados da Solicitação:</h4>
              <p><strong>Professor:</strong> ${s.professor}</p>
              <p><strong>Sala:</strong> ${s.sala}</p>
              <p><strong>Data:</strong> ${s.dataSolicitacao || "--/--/--"}</p>
            </div>
            <div style="width:2px;border-right:2px solid black;height:150px;"></div>
            <div class="coluna col-4">
              <h4>Produtos Solicitados:</h4>
              <ul>
                <li>Item Exemplo - 1 und.</li>
                <li>Item Exemplo - 2 und.</li>
              </ul>
            </div>
            <div style="width:2px;border-right:2px solid black;height:150px;"></div>
            <div class="botoes col-3">
              ${gerarBotoesSolicitacoes(s.status, s.id)}
            </div>
          </div>
        </div>
      </details>
    `;
  });
}

// -------------------------------
// 4 - INICIALIZAÇÃO
// -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await carregarAgendamentos();
  carregarReposicoesDoBackend();
});
