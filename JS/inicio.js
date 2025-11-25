import { mostrarNotificacao } from "./notificacao.js";
import { getToken, erroToken, getPermissaoUsuario } from "./sessao.js";

const API_BASE = "http://localhost:3000";

// Arrays locais
let agendamentos = [];

document.addEventListener("DOMContentLoaded", async () => {
  await carregarAgendamentos();
});

function normalizarStatus(status) {
  const mapa = {
    Pendente: "pendente",
    Aprovado: "aprovado",
    Reprovada: "cancelado",
    Cancelado: "cancelado",
    Cancelada: "cancelado",
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

// Renderiza agendamentos no HTML
function renderizaAgendamentos(lista = agendamentos) {
  // Renderiza os Agendamentos no HTML
  const container = document.querySelector(".container-agendamentos");
  container.innerHTML = `
    <div class="agendamentos-titulo">Seus agendamentos</div>
    <div class="row agendamento">
        <div class="col-4 agendamentos-cabecalho">Horário</div>
        <div class="col-4 agendamentos-cabecalho">Sala</div>
        <div class="col-4 agendamentos-cabecalho">Status</div>
    </div>
  `;
  if (lista.length === 0) {
    container.innerHTML += `<p style="text-align:center; padding: 20px;">Nenhum agendamento encontrado.</p>`;
    return;
  }
  lista.forEach((s) => {
    container.innerHTML += `
        <div class="row agendamento">
            <div class="col-4 valor">${s.horario}</div>
            <div class="col-4 valor">${s.sala}</div>
            <div class="status ${s.status} col-4 valor">${statusText(s.status)}</div>
        </div>
    `;
  });
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
      aula: s.aula,
      horario: s.horarioAula,
      sala: s.sala,
      lab: s.idLaboratorio,
      professor: s.nome,
      status: normalizarStatus(s.status),
      dataSolicitacao: s.data,
      kit: s.kit,
      produtos: s.produtos
    }));
  } catch (error) {
    mostrarNotificacao('Erro ao carregar agendamentos', 'erro')
    console.error("Erro ao carregar agendamentos", error);
  }
  renderizaAgendamentos();
}
