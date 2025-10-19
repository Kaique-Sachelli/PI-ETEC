// ==================== VARIÁVEIS PRINCIPAIS ====================
let dataAtual = new Date();
let modoVisualizacao = "mes"; // visão padrão ao carregar
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
  const seletorPeriodo = document.getElementById("periodo");
  const periodoSelecionado = seletorPeriodo.value;

  // Seleciona todos os blocos de horários (matutino / vespertino / noturno)
  const blocos = document.querySelectorAll(".bloco-periodo");

  // Oculta todos os blocos primeiro
  blocos.forEach(bloco => bloco.style.display = "none");

  // Mostra somente o bloco correspondente
  if (periodoSelecionado) {
    const blocoSelecionado = document.querySelector(`.bloco-periodo.${periodoSelecionado}`);
    if (blocoSelecionado) blocoSelecionado.style.display = "block";
  }
}

// ==================== CONFIGURAR EVENTOS ====================
document.addEventListener("DOMContentLoaded", () => {
  // Atualiza o mês ao iniciar
  atualizarMes();

  // Botões de navegação (ícones de seta)
  const botoesEsquerda = document.querySelectorAll(".fa-chevron-left, .seta:first-child");
  const botoesDireita = document.querySelectorAll(".fa-chevron-right, .seta:last-child");

  botoesEsquerda.forEach(botao => botao.addEventListener("click", mesAnterior));
  botoesDireita.forEach(botao => botao.addEventListener("click", proximoMes));

  // Filtros de visualização (Dia / Semana / Mês)
  const opcoesFiltro = document.querySelectorAll(".submenu-link");
  opcoesFiltro.forEach(opcao => {
    opcao.addEventListener("click", (e) => {
      e.preventDefault();
      const texto = opcao.textContent.trim().toLowerCase();
      if (texto.includes("semana")) alternarVisualizacao("semana");
      if (texto.includes("mês") || texto.includes("mes")) alternarVisualizacao("mes");
    });
  });

  // Controle de horários (período matutino / vespertino / noturno)
  const seletorPeriodo = document.getElementById("periodo");
  if (seletorPeriodo) {
    seletorPeriodo.addEventListener("change", controlarHorarios);
    controlarHorarios(); // Oculta tudo ao carregar
  }
});
