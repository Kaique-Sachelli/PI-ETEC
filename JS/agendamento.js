
let dataAtual = new Date();
let modoVisualizacao = "mes"; 
let diaSelecionado = null;
let horarioSelecionado = null;
let agendamentos = [];

const diasContainer = document.getElementById("gradeDias");
const semanaContainer = document.getElementById("gradeSemana");
const mesElemento = document.querySelector(".calendario .mes");
const botaoMes = document.getElementById("botaoMes");
const botaoSemana = document.getElementById("botaoSemana");
const setaEsquerda = document.getElementById("setaEsquerda");
const setaDireita = document.getElementById("setaDireita");

const periodoSelect = document.getElementById("periodoSelect");
const horariosContainer = document.getElementById("horariosContainer");
const kitSelect = document.getElementById("kitSelect");
const laboratorioSelect = document.getElementById("laboratorioSelect");
const btnAgendar = document.getElementById("btnAgendar");

function isoDate(d) {
  return d.toISOString().split("T")[0];
}
function pad(n){ return String(n).padStart(2,"0"); }
function salvarAgendamentos() { localStorage.setItem("agendamentos", JSON.stringify(agendamentos)); }
function carregarAgendamentos() {
  const raw = localStorage.getItem("agendamentos");
  if (raw) {
    try { agendamentos = JSON.parse(raw) || []; } catch(e){ agendamentos = []; }
  }
}


function atualizarMes() {
  const nomeMes = dataAtual.toLocaleString("pt-BR", { month: "long", year: "numeric" });
  mesElemento.textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
}


function renderizarMes() {
  modoVisualizacao = "mes";
  semanaContainer.style.display = "none";
  diasContainer.style.display = "grid";
  botaoMes.classList.add("ativo");
  botaoSemana.classList.remove("ativo");

  diasContainer.innerHTML = "";

  const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
  const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
  // converte getday para 1 ate 7, fazendo comecar na segunda
  const diaSemanaInicial = primeiroDiaMes.getDay() === 0 ? 7 : primeiroDiaMes.getDay();

  for (let i = 1; i < diaSemanaInicial; i++) {
    const vazio = document.createElement("div");
    vazio.classList.add("dia-vazio");
    diasContainer.appendChild(vazio);
  }

  for (let dia = 1; dia <= ultimoDiaMes.getDate(); dia++) {
    const el = document.createElement("div");
    el.classList.add("dia");
    el.textContent = dia;

    el.addEventListener("click", () => {
      selecionarDia(dia);
    });

    // 
    if (diaSelecionado instanceof Date &&
        diaSelecionado.getFullYear() === dataAtual.getFullYear() &&
        diaSelecionado.getMonth() === dataAtual.getMonth() &&
        diaSelecionado.getDate() === dia) {
      el.classList.add("ativo");
      el.classList.add("selecionado");
    }

    diasContainer.appendChild(el);
  }

  atualizarMes();
}

// 
function renderizarSemana() {
  modoVisualizacao = "semana";
  diasContainer.style.display = "none";
  semanaContainer.style.display = "grid";
  botaoSemana.classList.add("ativo");
  botaoMes.classList.remove("ativo");

  semanaContainer.innerHTML = "";

  // inicio da semana na segunda
  const diaDaSemana = dataAtual.getDay(); // 0 dom ...6 sab
  const inicioSemana = new Date(dataAtual);
  inicioSemana.setHours(0,0,0,0);
  inicioSemana.setDate(dataAtual.getDate() - ((diaDaSemana + 6) % 7));

  const nomes = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicioSemana);
    dia.setDate(inicioSemana.getDate() + i);
    const diaISO = isoDate(dia);
    const diaNumero = pad(dia.getDate());
    const mesNumero = pad(dia.getMonth() + 1);

    const divDia = document.createElement("div");
    divDia.classList.add("dia-semana");
    divDia.dataset.data = diaISO;
    divDia.innerHTML = `
      <strong>${nomes[i]}</strong>
      <div class="data">${diaNumero}/${mesNumero}</div>
      <div class="horarios-dia"></div>
    `;

    // coloca os horarios do periodo
    const horariosDia = divDia.querySelector(".horarios-dia");
    const horarios = obterHorariosPorPeriodo(periodoSelect.value);
    horarios.forEach(h => {
      const btn = document.createElement("button");
      btn.classList.add("horario-btn");
      btn.type = "button";
      btn.textContent = h;

      // marca se ja ta agendado
      const ocup = agendamentos.find(a => a.data === diaISO && a.horario === h);
      if (ocup) {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.title = "Horário já agendado";
        btn.classList.remove("selecionado");
        btn.classList.remove("ativo");
      }

      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        selecionarHorario(dia, h, btn);
      });


      if (diaSelecionado instanceof Date && isoDate(diaSelecionado) === diaISO && horarioSelecionado === h) {
        btn.classList.add("selecionado");
        btn.classList.add("ativo");
      }

      horariosDia.appendChild(btn);
    });

    semanaContainer.appendChild(divDia);
  }

  atualizarMes();
}


function selecionarDia(diaNum) {
  document.querySelectorAll(".dia").forEach(d => {
    d.classList.remove("ativo");
    d.classList.remove("selecionado");
  });

  const diaClicado = Array.from(document.querySelectorAll(".dia")).find(d => d.textContent == diaNum);
  if (diaClicado) {
    diaClicado.classList.add("ativo");
    diaClicado.classList.add("selecionado");
  }

  diaSelecionado = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), diaNum);
  horarioSelecionado = null;

  reaplicarPainelHorario();
}

function selecionarHorario(dia, horario, botao) {
  const existe = agendamentos.find(a => a.data === isoDate(dia) && a.horario === horario);
  if (existe) {
    alert("⚠ Este horário já está agendado!");
    return;
  }


  document.querySelectorAll(".horario-btn").forEach(b => {
    b.classList.remove("selecionado");
    b.classList.remove("ativo");
  });

  botao.classList.add("selecionado");
  botao.classList.add("ativo");

  diaSelecionado = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());
  horarioSelecionado = horario;


  reaplicarPainelHorario();
}

function atualizarHorarios() {
  horariosContainer.innerHTML = "";
  const periodo = periodoSelect.value;
  if (!periodo) return;

  const horarios = obterHorariosPorPeriodo(periodo);
  const select = document.createElement("select");
  select.classList.add("form-select");
  select.id = "horarioSelect";

  const optVazio = document.createElement("option");
  optVazio.value = "";
  optVazio.textContent = "";
  select.appendChild(optVazio);

  horarios.forEach(h => {
    const op = document.createElement("option");
    op.value = h;
    op.textContent = h;
    select.appendChild(op);
  });

  horariosContainer.appendChild(select);


  if (horarioSelecionado) {
    select.value = horarioSelecionado;
  }

  select.addEventListener("change", (e) => {
    horarioSelecionado = e.target.value || null;

    document.querySelectorAll(".horario-btn").forEach(btn => {
      if (btn.textContent === horarioSelecionado) {
        btn.classList.add("selecionado");
        btn.classList.add("ativo");
      } else {
        btn.classList.remove("selecionado");
        btn.classList.remove("ativo");
      }
    });
  });
}


function reaplicarPainelHorario() {
  const sel = document.getElementById("horarioSelect");
  if (sel) {
    sel.value = horarioSelecionado || "";
  }
}


function obterHorariosPorPeriodo(periodo) {
  const horarios = {
    matutino: [
      "1ª aula - 7h10 às 8h00",
      "2ª aula - 8h00 às 8h50",
      "3ª aula - 8h50 às 9h40",
      "4ª aula - 10h00 às 10h50",
      "5ª aula - 10h50 às 11h40",
      "6ª aula - 11h40 às 12h30",
    ],
    vespertino: [
      "1ª aula - 13h00 às 13h50",
      "2ª aula - 13h50 às 14h40",
      "3ª aula - 14h40 às 15h30",
      "4ª aula - 15h50 às 16h40",
      "5ª aula - 16h40 às 17h30",
      "6ª aula - 17h30 às 18h20",
    ],
    noturno: [
      "1ª aula - 18h50 às 19h40",
      "2ª aula - 19h40 às 20h30",
      "3ª aula - 20h44 às 21h34",
      "4ª aula - 21h34 às 22h20",
    ],
  };
  return horarios[periodo] || [];
}

// agendar
btnAgendar.addEventListener("click", () => {
  if (!diaSelecionado || !horarioSelecionado) {
    alert("Selecione o dia e o horário primeiro!");
    return;
  }

  const dataISO = isoDate(diaSelecionado);
  const existe = agendamentos.find(a => a.data === dataISO && a.horario === horarioSelecionado);
  if (existe) {
    alert("⚠ Já existe um agendamento neste horário!");
    return;
  }

  // registra
  agendamentos.push({ data: dataISO, horario: horarioSelecionado, laboratorio: laboratorioSelect?.value || "", kit: kitSelect?.value || "" });
  salvarAgendamentos();
  alert(`✅ Agendado com sucesso para ${dataISO} — ${horarioSelecionado}`);

  // desliga botao
  document.querySelectorAll(".horario-btn").forEach(btn => {
    const diaPai = btn.closest(".dia-semana");
    if (!diaPai) return;
    const diaISO = diaPai.dataset.data;
    if (diaISO === dataISO && btn.textContent === horarioSelecionado) {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.title = "Horário já agendado";
      btn.classList.remove("selecionado");
      btn.classList.remove("ativo");
    }
  });
});

// setinhas
setaEsquerda.addEventListener("click", () => {
  if (modoVisualizacao === "mes") {
    dataAtual.setMonth(dataAtual.getMonth() - 1);
    renderizarMes();
  } else {
    dataAtual.setDate(dataAtual.getDate() - 7);
    renderizarSemana();
  }
});
setaDireita.addEventListener("click", () => {
  if (modoVisualizacao === "mes") {
    dataAtual.setMonth(dataAtual.getMonth() + 1);
    renderizarMes();
  } else {
    dataAtual.setDate(dataAtual.getDate() + 7);
    renderizarSemana();
  }
});

// muda mes/semana
botaoMes.addEventListener("click", () => {
  renderizarMes();
});
botaoSemana.addEventListener("click", () => {
  renderizarSemana();
});


periodoSelect.addEventListener("change", () => {
  atualizarHorarios();
  if (modoVisualizacao === "semana") renderizarSemana();
});

// quando trocar kit/lab salva na selecao local 
if (kitSelect) kitSelect.addEventListener("change", () => { /* placeholder se precisar */ });
if (laboratorioSelect) laboratorioSelect.addEventListener("change", () => { /* placeholder */ });


carregarAgendamentos();
atualizarMes();
atualizarHorarios();
renderizarMes();
