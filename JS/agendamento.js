let dataAtual = new Date();
let modoVisualizacao = "mes";
let mesElemento = document.querySelector(".mes");


const diasContainer = document.querySelector(".dias");
const diasSemana = ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];

function atualizarMes() {
  const nomeMes = dataAtual.toLocaleString("pt-BR", { month: "long", year: "numeric" });
  mesElemento.textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
  renderizarDias();
}

function renderizarDias() {
  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();

  diasContainer.innerHTML = "";


  for (let i = 0; i < (primeiroDiaSemana === 0 ? 6 : primeiroDiaSemana - 1); i++) {
    const vazio = document.createElement("div");
    vazio.classList.add("vazio");
    diasContainer.appendChild(vazio);
  }


  for (let dia = 1; dia <= diasNoMes; dia++) {
    const divDia = document.createElement("div");
    divDia.textContent = dia;


    const hoje = new Date();
    if (
      dia === hoje.getDate() &&
      mes === hoje.getMonth() &&
      ano === hoje.getFullYear()
    ) {
      divDia.classList.add("dia-atual");
    }

    diasContainer.appendChild(divDia);
  }
}


function mesAnterior() {
  dataAtual.setMonth(dataAtual.getMonth() - 1);
  atualizarMes();
}

function proximoMes() {
  dataAtual.setMonth(dataAtual.getMonth() + 1);
  atualizarMes();
}


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


function controlarHorarios() {
  const seletorPeriodo = document.getElementById("periodo");
  const periodoSelecionado = seletorPeriodo.value;
  const blocos = document.querySelectorAll(".bloco-periodo");

  blocos.forEach(bloco => bloco.style.display = "none");

  if (periodoSelecionado) {
    const blocoSelecionado = document.querySelector(`.bloco-periodo.${periodoSelecionado}`);
    if (blocoSelecionado) blocoSelecionado.style.display = "block";
  }
}


document.addEventListener("DOMContentLoaded", () => {
  atualizarMes();


  const botoesEsquerda = document.querySelectorAll(".fa-chevron-left, .seta:first-child");
  const botoesDireita = document.querySelectorAll(".fa-chevron-right, .seta:last-child");

  botoesEsquerda.forEach(botao => botao.addEventListener("click", mesAnterior));
  botoesDireita.forEach(botao => botao.addEventListener("click", proximoMes));


  const opcoesFiltro = document.querySelectorAll(".submenu-link");
  opcoesFiltro.forEach(opcao => {
    opcao.addEventListener("click", (e) => {
      e.preventDefault();
      const texto = opcao.textContent.trim().toLowerCase();
      if (texto.includes("semana")) alternarVisualizacao("semana");
      if (texto.includes("mês") || texto.includes("mes")) alternarVisualizacao("mes");
    });
  });


  const seletorPeriodo = document.getElementById("periodo");
  if (seletorPeriodo) {
    seletorPeriodo.addEventListener("change", controlarHorarios);
    controlarHorarios();
  }
});
