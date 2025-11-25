import { mostrarNotificacao } from "./notificacao.js";
import { getToken, erroToken, getPermissaoUsuario } from "./sessao.js";

const API_BASE = "http://localhost:3000";

// Arrays locais
let agendamentos = [];
let reposicoes = [];
let modoVisualizacao = "solicitacao";

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
async function atualizarAgendamento(endpoint, id, novoStatus) {
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

// Renderiza agendamentos no HTML
function renderizaAgendamentos(lista = agendamentos) {
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
  if (lista.length === 0) {
    container.innerHTML += `<p style="text-align:center; padding: 20px;">Nenhum agendamento encontrado.</p>`;
    return;
  }
  lista.forEach((s) => {
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
            <div class="coluna col-4" style="border-right:2px solid black;">
              <h4>Dados do Agendamento:</h4>
              <p><strong>Professor:</strong> ${s.professor}</p>
              <p><strong>Aula:</strong> ${s.aula}</p>
              <p><strong>Sala:</strong> ${s.sala}</p>
              <p><strong>Data:</strong> ${s.data || "--/--/--"}</p>
              <p><strong>Kit:</strong> ${s.kit || "N/A"}</p>
            </div>
            <div class="coluna col-4" style="border-right:2px solid black;">
              <h4>Produtos Solicitados (Itens do Kit):</h4>
              <ul>
                ${listaProdutos}
              </ul>
            </div>
            <div class="botoes col-4">
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
  const permissaoUsuario = getPermissaoUsuario();
  // filtra para o professor apenas conseguir cancelar seu agendamento
  if (permissaoUsuario === 'Professor') {
    if (status === "pendente") {
      return `
        <button class="btn btn-cancelado" onclick="cancelar(${id})">Cancelar</button>`;
    }
    return '';
  }
  if (status === "pendente")
    return `
    <button class="btn btn-pendente" onclick="aprovarAgendamento(${id})">Aprovar Agendamento</button>
    <button class="btn btn-cancelado" onclick="cancelar(${id})">Cancelar</button>`;

  if (status === "aprovado")
    return `
    <button class="btn btn-devolvido" onclick="finalizar(${id})">Devolver Kit</button>`;

  if (status === "cancelado")
    return `
    <button class="btn btn-pendente" onclick="voltarPendente(${id})">Reabrir Agendamento</button>`;

  return "";
}

// Funções de ação
async function cancelar(id) {
  if (!confirm("Deseja cancelar esta solicitação?")) return;
  await atualizarAgendamento("agendamentos/atualizar", id, "cancelado");
  const s = agendamentos.find((x) => x.id === id);
  if (s) s.status = "cancelado";
  carregarAgendamentos();
}

async function aprovarAgendamento(id) {
  await atualizarAgendamento("agendamentos/atualizar", id, "aprovado");
  const s = agendamentos.find((x) => x.id === id);
  if (s) s.status = "aprovado";
  carregarAgendamentos();
}

async function finalizar(id) {
  await atualizarAgendamento("agendamentos/atualizar", id, "finalizado");
  const s = agendamentos.find((x) => x.id === id);
  if (s) s.status = "finalizado";
  carregarAgendamentos();
}

async function voltarPendente(id) {
  await atualizarAgendamento("agendamentos/atualizar", id, "pendente");
  const s = agendamentos.find((x) => x.id === id);
  if (s) s.status = "pendente";
  carregarAgendamentos();
}

//função para chamar solicitações de reposição
async function carregarSolicitacoes() {
  try {
    const token = getToken();
    const resposta = await fetch(`${API_BASE}/solicitacoes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (resposta.status === 401) return erroToken();

    reposicoes = await resposta.json();

    renderizarSolicitacoes();

  } catch (error) {
    console.error("Erro ao carregar reposições:", error);
    mostrarNotificacao("Erro ao carregar reposições", "erro");
  }
}

function renderizarSolicitacoes(lista = reposicoes) {
  const permissaoUsuario = getPermissaoUsuario();
  const container = document.querySelector(".containerprodutos .container");

  // Cabeçalho da tabela
  container.innerHTML = `
    <h2 class="title">Pedido para reposição de estoque</h2>
    <div class="tabela-cabecalho">
      <span>Data</span>
      <span>Solicitante</span>
      <span></span><span>Status</span>
      <span>Expandir</span>
    </div>
  `;

  if (lista.length === 0) {
    container.innerHTML += `<p style="text-align:center; padding: 20px;">Nenhuma solicitação encontrada.</p>`;
    return;
  }

  lista.forEach((r) => {
    const listaProdutos = r.produtos && r.produtos.length > 0
      ? r.produtos.map(p => `
            <li>${p.nome} - ${p.quantidade} ${p.tipo === 'reagente' ? 'g' : 'und.'}</li>
          `).join('')
      : '<li>Nenhum item listado.</li>';

    const statusClass = normalizarStatus(r.status || 'pendente');

    let botoesHtml = "";
    if (permissaoUsuario === 'Professor') {
      if (statusClass !== "finalizado" && statusClass !== "cancelado") {
        botoesHtml = `<button class="btn btn-cancelado" onclick="cancelarSolicitacao(${r.idSolicitacao})">Cancelar</button>`;
      }
    } else {
      if (statusClass !== "finalizado" && statusClass !== "cancelado") {
        botoesHtml = `
          <button class="btn btn-pendente" 
                onclick="finalizaSolicitacao(${r.idSolicitacao})">Finalizar</button>
          <button class="btn btn-cancelado" 
                onclick="cancelarSolicitacao(${r.idSolicitacao})">Cancelar</button>
        `;
      }
    }
    container.innerHTML += `
      <details class="${corStatus(statusClass)}">
        <summary>
          <div class="linha">
            <span>${r.data}</span>
            <span>${r.tecnico}</span> 
            <span></span> <span class="status ${statusClass}">${statusText(statusClass)}</span>
            <i class="bi bi-chevron-down seta">▼</i>
          </div>
        </summary>
        <div class="detalhes-box">
          <div class="row w-100">
            <div class="coluna col-4" style="border-right:2px solid black;">
              <h4>Dados da Solicitação:</h4>
              <p><strong>Solicitante:</strong> ${r.tecnico}</p>
              <p><strong>Observação:</strong> ${r.observacao || "Nenhuma"}</p>
            </div>
                        
            <div class="coluna col-4" style="border-right:2px solid black;">
              <h4>Produtos Solicitados:</h4>
              <ul>
                ${listaProdutos}
              </ul>
            </div>
            
            <div class="botoes col-4">
              ${botoesHtml}
            </div>
          </div>
        </div>
      </details>
    `;
  });
}

async function finalizaSolicitacao(id) {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/solicitacoes/atualizar/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "Concluida" }),
    });

    if (response.status === 401) return erroToken();
    const r = reposicoes.find((rep) => rep.idSolicitacao === id);
    if (r) r.status = "Concluida";
    renderizarSolicitacoes();
    mostrarNotificacao("Reposição finalizada com sucesso!", 'sucesso');
  } catch (error) {
    console.error("Erro ao finalizar reposição:", error);
    alert("Erro ao finalizar reposição.");
  }
}
async function cancelarSolicitacao(id) {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/solicitacoes/atualizar/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "Cancelada" }),
    });

    if (response.status === 401) return erroToken();
    const r = reposicoes.find((rep) => rep.idSolicitacao === id);
    if (r) r.status = "cancelado";
    renderizarSolicitacoes();
    mostrarNotificacao("Reposição cancelada com sucesso!", 'sucesso');
  } catch (error) {
    console.error("Erro ao cancelar reposição:", error);
    alert("Erro ao cancelar reposição.");
  }
}
// Função unificada de filtro
function filtrarPorStatus(filtro) {
  const botoes = document.querySelectorAll(".filtragem .submenu-link");
  botoes.forEach((btn) => btn.classList.remove("ativo"));

  const btnAtivo = [...botoes].find(b => b.getAttribute('onclick').includes(`'${filtro}'`));
  if (btnAtivo) btnAtivo.classList.add("ativo");

  let agendamentosFiltrados = [];
  let reposicoesFiltradas = [];

  if (filtro === 'todos') {
    agendamentosFiltrados = agendamentos;
    reposicoesFiltradas = reposicoes;
  } else {
    agendamentosFiltrados = agendamentos.filter(s => s.status === filtro);

    reposicoesFiltradas = reposicoes.filter(r => normalizarStatus(r.status) === filtro);
  }

  renderizaAgendamentos(agendamentosFiltrados);
  renderizarSolicitacoes(reposicoesFiltradas);
}

window.filtrarPorStatus = filtrarPorStatus;


document.addEventListener("DOMContentLoaded", async () => {
  await carregarAgendamentos();
  carregarSolicitacoes();
});

window.aprovarAgendamento = aprovarAgendamento;
window.cancelar = cancelar;
window.finalizar = finalizar;
window.voltarPendente = voltarPendente;
window.cancelarSolicitacao = cancelarSolicitacao;
window.finalizaSolicitacao = finalizaSolicitacao;

// Visualização Única
function alternarVisualizacao(tipo) {
    const containerSolicitacao = document.querySelector("#containerSolicitacao");
    const containerReposicao = document.querySelector("#containerReposicao");

    if (tipo === "reposicao") {
        modoVisualizacao = "reposicao";
        containerSolicitacao.style.display = "none";
        containerReposicao.style.display = "block";
    } else {
        modoVisualizacao = "solicitacao";
        containerSolicitacao.style.display = "block";
        containerReposicao.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const opcoesFiltro = document.querySelectorAll(".submenu-link");
    opcoesFiltro.forEach(opcao => {
        opcao.addEventListener("click", (e) => {
            e.preventDefault();
            const texto = opcao.textContent.trim().toLowerCase();
            let botaoSolicitacao = document.getElementById("solicitacao")
            let botaoReposicao = document.getElementById("reposicao")
            if (texto.includes("reposição")) {
                alternarVisualizacao("reposicao")
                botaoSolicitacao.classList.remove('ativo')
                botaoReposicao.classList.add('ativo')
            };
            if (texto.includes("solicitação")) {
                alternarVisualizacao("solicitacao")
                botaoReposicao.classList.remove('ativo')
                botaoSolicitacao.classList.add('ativo')
            };
        });
    });
});