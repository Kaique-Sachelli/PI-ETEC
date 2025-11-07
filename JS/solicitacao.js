// 🌐 URL base da sua API
const API_BASE = "http://localhost:3000/api";

// Lista de solicitações
let solicitacoes = [];

// 🔄 Carrega solicitações do backend
async function carregarSolicitacoesDoBackend() {
  try {
    const response = await fetch(`${API_BASE}/solicitacoes`);
    if (!response.ok) throw new Error("Erro ao carregar solicitações");

    const dados = await response.json();
    solicitacoes = dados.map((s) => ({
      ...s,
      status: normalizarStatus(s.status),
    }));

    carregarSolicitacoes();
  } catch (error) {
    console.error("❌ Erro:", error);
    alert("Erro ao carregar solicitações (modo offline)");

    // Dados locais para teste offline
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
    carregarSolicitacoes();
  }
}

// 🧠 Mapeia o status vindo do banco → usado no front
function normalizarStatus(status) {
  const mapa = {
    Pendente: "pendente",
    Aprovada: "aprovado",
    Reprovada: "cancelado",
    Concluida: "finalizado",
    "Kit Pronto": "aprovado",
  };
  return mapa[status] || status?.toLowerCase() || "pendente";
}

async function atualizarStatusBackend(id, novoStatus) {
  try {
    const response = await fetch(`${API_BASE}/solicitacoes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });

    if (response.ok) {
      console.log(`Status atualizado com sucesso para ${novoStatus}`);
    } else {
      console.error("Erro ao atualizar status");
    }
  } catch (error) {
    console.error("Erro de conexão:", error);
  }
}

// 📦 Onde exibir os dados
const container = document.querySelector(".container");

// 🎨 Cores de status
function corStatus(status) {
  if (status === "aprovado") return "verde";
  if (status === "pendente") return "amarelo";
  if (status === "cancelado") return "vermelho";
  if (status === "finalizado") return "azul";
  return "amarelo";
}

// 📛 Texto de status
function statusText(status) {
  if (status === "aprovado") return "Aprovado";
  if (status === "pendente") return "Pendente";
  if (status === "cancelado") return "Cancelado";
  if (status === "finalizado") return "Finalizado";
  return status;
}

// ⚙️ Botões de ação conforme status
function gerarBotoes(status, id) {
  if (status === "pendente") {
    return `
      <button class="btn btn-pronto" onclick="kitPronto(${id})">Kit Pronto</button>
      <button class="btn btn-cancelado" onclick="cancelar(${id})">Cancelar</button>
    `;
  }
  if (status === "aprovado") {
    return `
      <button class="btn btn-devolvido" onclick="finalizar(${id})">Devolver Kit</button>
      <button class="btn btn-pendente" onclick="voltarPendente(${id})">Voltar a Pendente</button>
    `;
  }
  if (status === "cancelado") {
    return `
      <button class="btn btn-pendente" onclick="voltarPendente(${id})">Reabrir Solicitação</button>
    `;
  }
  return "";
}

// 🧾 Monta os cards de solicitações
function carregarSolicitacoes() {
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
              <p><strong>Sala solicitada:</strong> ${s.sala}</p>
              <p><strong>Data da solicitação:</strong> ${
                s.dataSolicitacao || "--/--/--"
              }</p>
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
              ${gerarBotoes(s.status, s.id)}
            </div>
          </div>
        </div>
      </details>
    `;
  });
}

// 🔴 Cancelar
async function cancelar(id) {
  if (!confirm("Tem certeza que deseja cancelar esta solicitação?")) return;
  try {
    await atualizarStatusBackend(id, "cancelado");
  } catch {}
  const s = solicitacoes.find((x) => x.id === id);
  if (s) s.status = "cancelado";
  carregarSolicitacoes();
}

// 🟢 Kit pronto → Aprovado
async function kitPronto(id) {
  try {
    await atualizarStatusBackend(id, "aprovado");
  } catch {}
  const s = solicitacoes.find((x) => x.id === id);
  if (s) s.status = "aprovado";
  carregarSolicitacoes();
}

// 🔵 Devolver Kit → Finalizado
async function finalizar(id) {
  try {
    await atualizarStatusBackend(id, "finalizado");
  } catch {}
  const s = solicitacoes.find((x) => x.id === id);
  if (s) s.status = "finalizado";
  carregarSolicitacoes();
}
// 🔄 Voltar para pendente
async function voltarPendente(id) {
  try {
    await atualizarStatusBackend(id, "pendente");
  } catch {}
  const s = solicitacoes.find((x) => x.id === id);
  if (s) s.status = "pendente";
  carregarSolicitacoes();
}
// 🚀 Inicializar tudo
document.addEventListener("DOMContentLoaded", carregarSolicitacoesDoBackend);
