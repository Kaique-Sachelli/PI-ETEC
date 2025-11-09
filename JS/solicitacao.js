// 🌐 URL base da API
const API_BASE = "http://localhost:3000/api";

// Arrays locais
let solicitacoes = [];
let reposicoes = [];

// -------------------------------
// 1 - UTILITÁRIOS
// -------------------------------

// Mapear status do backend para frontend
function normalizarStatus(status) {
  const mapa = {
    Pendente: "pendente",
    Aprovada: "aprovado",
    Reprovada: "cancelado",
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
    const response = await fetch(`${API_BASE}/${endpoint}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });
    if (!response.ok) console.error("Erro ao atualizar status");
  } catch (error) {
    console.error("Erro de conexão:", error);
  }
}

// -------------------------------
// 2 - SOLICITAÇÕES
// -------------------------------

// Carrega solicitações do backend
async function carregarSolicitacoesDoBackend() {
  try {
    const response = await fetch(`${API_BASE}/solicitacoes`);
    if (!response.ok) throw new Error("Erro ao carregar solicitações");
    const dados = await response.json();
    solicitacoes = dados.map((s) => ({
      ...s,
      status: normalizarStatus(s.statusPedido),
    }));
  } catch (error) {
    console.error("Erro:", error);
    // fallback offline
    solicitacoes = [
      {
        id: 1,
        periodo: "Vespertino",
        horario: "11:00 - 13:00",
        sala: "LAB1",
        status: "pendente",
        professor: "Fábio",
      },
      {
        id: 2,
        periodo: "Diurno",
        horario: "14:00 - 17:00",
        sala: "A06",
        status: "aprovado",
        professor: "Ana",
      },
      {
        id: 3,
        periodo: "Noturno",
        horario: "19:00 - 22:00",
        sala: "B04",
        status: "cancelado",
        professor: "Marcos",
      },
      {
        id: 4,
        periodo: "Noturno",
        horario: "19:00 - 22:00",
        sala: "B04",
        status: "finalizado",
        professor: "Marcos",
      },
    ];
  }
  carregarSolicitacoes();
}

// Renderiza solicitações no HTML
function carregarSolicitacoes() {
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
  solicitacoes.forEach((s) => {
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
  carregarSolicitacoes();
}

async function kitPronto(id) {
  await atualizarStatusBackend("solicitacoes", id, "aprovado");
  const s = solicitacoes.find((x) => x.id === id);
  if (s) s.status = "aprovado";
  carregarSolicitacoes();
}

async function finalizar(id) {
  await atualizarStatusBackend("solicitacoes", id, "finalizado");
  const s = solicitacoes.find((x) => x.id === id);
  if (s) s.status = "finalizado";
  carregarSolicitacoes();
}

async function voltarPendente(id) {
  await atualizarStatusBackend("solicitacoes", id, "pendente");
  const s = solicitacoes.find((x) => x.id === id);
  if (s) s.status = "pendente";
  carregarSolicitacoes();
}

// -------------------------------
// 3 - REPOSIÇÕES DE ESTOQUE
// -------------------------------

async function carregarReposicoesDoBackend() {
  try {
    const response = await fetch(`${API_BASE}/reposicoes`);
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
             ${
               r.status !== "finalizado"
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
    await fetch(`${API_BASE}/reposicoes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "finalizado" }),
    });
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

// Cria os botões de filtro no topo da página
function criarFiltros() {
  const containerPai = document.querySelector(".container").parentElement;
  const filtrosDiv = document.createElement("div");
  filtrosDiv.className = "filtros-estados";
  filtrosDiv.innerHTML = `
    <button onclick="filtrarPorStatus('todos')" class="btn-filtro ativo">Todos</button>
    <button onclick="filtrarPorStatus('aprovado')" class="btn-filtro">Aprovados</button>
    <button onclick="filtrarPorStatus('pendente')" class="btn-filtro">Pendentes</button>
    <button onclick="filtrarPorStatus('cancelado')" class="btn-filtro">Cancelados</button>
    <button onclick="filtrarPorStatus('finalizado')" class="btn-filtro ">Finalizados</button>
  `;
  containerPai.prepend(filtrosDiv);
}

// -------------------------------
// 4 - INICIALIZAÇÃO
// -------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  await carregarSolicitacoesDoBackend();
  criarFiltros();
  carregarReposicoesDoBackend();
});
