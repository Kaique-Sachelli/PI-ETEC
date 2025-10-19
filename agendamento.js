// ==================== VARIÁVEIS PRINCIPAIS ====================
let dataAtual = new Date();
let modoVisualizacao = "mes"; // padrão inicial
let mesElemento = document.querySelector(".mes");

// ==================== ATUALIZA O MÊS EXIBIDO ====================
function atualizarMes() {
  const nomeMes = dataAtual.toLocaleString("pt-BR", { month: "long", year: "numeric" });
  mesElemento.textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
}

// ==================== NAVEGAÇÃO ENTRE MESES ====================
function mesAnterior() {
  dataAtual.setMonth(dataAtual.getMonth() - 1);
  atualizarMes();
}

function proximoMes() {
  dataAtual.setMonth(dataAtual.getMonth() + 1);
  atualizarMes();
}

// ==================== TROCA DE VISUALIZAÇÃO (MÊS / SEMANA) ====================
function alternarVisualizacao(tipo) {
  const containerMes = document.querySelector(".container-principal");
  const containerSemana = document.querySelector(".container-semana");

  if (tipo === "semana") {
    modoVisualizacao = "semana";
    containerMes.style.display = "none";
    containerSemana.style.display = "flex";
  } else {
    modoVisualizacao = "mes";
    containerMes.style.display = "flex";
    containerSemana.style.display = "none";
  }
}

// ==================== MOSTRAR / ESCONDER HORÁRIOS ====================
function controlarHorarios() {
  const seletorPeriodo = document.querySelector(".bloco-horarios select:nth-of-type(2)");
  const periodo = seletorPeriodo.value;

  const blocoMatutino = document.querySelectorAll(".bloco-horarios .mb-3")[2];
  const blocoVespertino = document.querySelectorAll(".bloco-horarios .mb-3")[3];
  const blocoNoturno = document.querySelectorAll(".bloco-horarios .mb-3")[4];

  // Oculta todos primeiro
  blocoMatutino.style.display = "none";
  blocoVespertino.style.display = "none";
  blocoNoturno.style.display = "none";

  // Exibe o bloco correspondente
  if (periodo === "matutino") blocoMatutino.style.display = "block";
  if (periodo === "vespertino") blocoVespertino.style.display = "block";
  if (periodo === "noturno") blocoNoturno.style.display = "block";
}

// ==================== CONFIGURAR EVENTOS ====================
document.addEventListener("DOMContentLoaded", () => {
  // Define o mês atual
  atualizarMes();

  // Botões de navegação
  const botoesEsquerda = document.querySelectorAll(".fa-chevron-left, .seta:first-child");
  const botoesDireita = document.querySelectorAll(".fa-chevron-right, .seta:last-child");

  botoesEsquerda.forEach(botao => botao.addEventListener("click", mesAnterior));
  botoesDireita.forEach(botao => botao.addEventListener("click", proximoMes));

  // Filtros (Dia / Semana / Mês)
  const opcoesFiltro = document.querySelectorAll(".submenu-link");
  opcoesFiltro.forEach(opcao => {
    opcao.addEventListener("click", (e) => {
      e.preventDefault();
      const texto = opcao.textContent.trim().toLowerCase();
      if (texto.includes("semana")) alternarVisualizacao("semana");
      if (texto.includes("mês") || texto.includes("mes")) alternarVisualizacao("mes");
    });
  });

  // Controle de horários
  const seletorPeriodo = document.querySelector(".bloco-horarios select:nth-of-type(2)");
  seletorPeriodo.addEventListener("change", controlarHorarios);

  // Inicialmente, oculta todos os blocos de horário
  controlarHorarios();
});
