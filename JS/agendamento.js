import { mostrarNotificacao } from "./notificacao.js";
import { getToken } from "./sessao.js";

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
  return new Date(d).toISOString().split("T")[0];
}

function pad(n) { return String(n).padStart(2, "0"); }


async function carregarLaboratorios() {
  try {
    const token = getToken();
    const r = await fetch("http://localhost:3000/laboratorios", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const dados = await r.json();
    if (!dados.sucesso) return;

    laboratorioSelect.innerHTML = "<option value=''>Selecione...</option>";

    dados.laboratorios.forEach(lab => {
      const opt = document.createElement("option");
      opt.value = lab.idLaboratorio;
      opt.textContent = lab.sala;
      laboratorioSelect.appendChild(opt);
    });

  } catch (e) {
    console.error("Erro ao carregar laboratórios:", e);
  }
}
async function carregarKits() {
  try {
    const token = getToken();
    const r = await fetch("http://localhost:3000/kits/lista", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const dados = await r.json();
    if (!dados.sucesso) return;


    const kitSelect = document.getElementById("kitSelect");


    kitSelect.innerHTML = "<option value=''>Selecione um Kit...</option>";

    dados.kits.forEach(kit => {
      const opt = document.createElement("option");
      opt.value = kit.idKit;
      opt.textContent = kit.nome;
      kitSelect.appendChild(opt);
    });

  } catch (e) {
    console.error("Erro ao carregar kits:", e);
  }
}


// sistema 48h
function verificarRestricaoData(data, horarioTexto) {
  const agora = new Date();

  // --- monta a data+hora real conforme o horário selecionado ---
  // exemplo: "1ª aula - 7h10 às 8h00"
  let horaInicio = horarioTexto?.match(/(\d{1,2})h(\d{2})/);

  let dataComHora = new Date(data);

  if (horaInicio) {
    const h = parseInt(horaInicio[1]);
    const m = parseInt(horaInicio[2]);
    dataComHora.setHours(h, m, 0, 0);
  } else {
    // fallback: se não conseguir extrair, assume 00:00 (comportamento antigo)
    dataComHora.setHours(0, 0, 0, 0);
  }

  // --- DIA PASSADO ---
  if (dataComHora < agora) {
    return "passado";
  }

  // --- DIFERENÇA REAL EM HORAS ---
  const diffMs = dataComHora.getTime() - agora.getTime();
  const diffHoras = diffMs / (1000 * 60 * 60);

  if (diffHoras < 48) {
    return "48h";
  }

  return "ok";
}



function salvarAgendamentosLocal() {
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
}

function carregarAgendamentosLocal() {
  const raw = localStorage.getItem("agendamentos");
  if (raw) agendamentos = JSON.parse(raw);
}

async function carregarAgendamentos() {
  try {
    const token = getToken();
    const r = await fetch("http://localhost:3000/agendamentos", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!r.ok) throw 0;

    const lista = await r.json();

    // converte o formato do backend para o formato esperado no frontend
    agendamentos = lista.map(a => {
      return {
        data: a.data,
        laboratorio: a.laboratorio,
        periodo: a.periodo,
        horario: converterHorario(a.horario, a.periodo)
      };
    });
    function converterHorario(aula, periodo) {
      const maps = {
        matutino: {
          "1ª Aula": "1ª aula - 7h10 às 8h00",
          "2ª Aula": "2ª aula - 8h00 às 8h50",
          "3ª Aula": "3ª aula - 8h50 às 9h40",
          "4ª Aula": "4ª aula - 10h00 às 10h50",
          "5ª Aula": "5ª aula - 10h50 às 11h40",
          "6ª Aula": "6ª aula - 11h40 às 12h30"
        },
        vespertino: {
          "1ª Aula": "1ª aula - 13h00 às 13h50",
          "2ª Aula": "2ª aula - 13h50 às 14h40",
          "3ª Aula": "3ª aula - 14h40 às 15h30",
          "4ª Aula": "4ª aula - 15h50 às 16h40",
          "5ª Aula": "5ª aula - 16h40 às 17h30",
          "6ª Aula": "6ª aula - 17h30 às 18h20"
        },
        noturno: {
          "1ª Aula": "1ª aula - 18h50 às 19h40",
          "2ª Aula": "2ª aula - 19h40 às 20h30",
          "3ª Aula": "3ª aula - 20h44 às 21h34",
          "4ª Aula": "4ª aula - 21h34 às 22h20"
        }
      };

      return maps[periodo]?.[aula] || aula;
    }


    salvarAgendamentosLocal();
  } catch (e) {
    console.warn("⚠ Usando agendamentos do localStorage (erro ou falta de token)");
    carregarAgendamentosLocal();
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

  const primeiro = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
  const ultimo = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
  const inicio = primeiro.getDay() === 0 ? 7 : primeiro.getDay();

  for (let i = 1; i < inicio; i++) {
    diasContainer.appendChild(Object.assign(document.createElement("div"), { className: "dia-vazio" }));
  }

  for (let d = 1; d <= ultimo.getDate(); d++) {
    const el = document.createElement("div");
    el.className = "dia";
    el.textContent = d;
    const dataDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), d);

    const status = verificarRestricaoData(dataDia);
    if (status === "passado") {
      el.style.opacity = ".5";
      el.title = "Dia já passou";
    }
    if (status === "48h") {
      el.style.opacity = ".5";
      el.title = "Somente com 48h de antecedência";
    }

    el.addEventListener("click", () => {
      if (status === "passado") return mostrarNotificacao("⚠ Este dia já passou.", "erro");
      if (status === "48h") return mostrarNotificacao("⚠ Agendamentos só podem ser feitos com 48h de antecedência.", "erro");
      selecionarDia(d);
    });

    if (diaSelecionado &&
      diaSelecionado.getDate() === d &&
      diaSelecionado.getMonth() === dataAtual.getMonth() &&
      diaSelecionado.getFullYear() === dataAtual.getFullYear()) {
      el.classList.add("ativo", "selecionado");
    }

    diasContainer.appendChild(el);
  }

  atualizarMes();
}

function renderizarSemana() {
  modoVisualizacao = "semana";
  diasContainer.style.display = "none";
  semanaContainer.style.display = "grid";
  botaoSemana.classList.add("ativo");
  botaoMes.classList.remove("ativo");

  semanaContainer.innerHTML = "";
  const diaDaSemana = dataAtual.getDay();
  const inicio = new Date(dataAtual);
  inicio.setDate(dataAtual.getDate() - ((diaDaSemana + 6) % 7));

  const nomes = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + i);
    const iso = isoDate(dia);
    const status = verificarRestricaoData(dia);

    const div = document.createElement("div");
    div.className = "dia-semana";
    div.dataset.data = iso;
    div.innerHTML = `<strong>${nomes[i]}</strong><div>${pad(dia.getDate())}</div><div class="horarios-dia"></div>`;

    const lista = obterHorariosPorPeriodo(periodoSelect?.value) || [];
    const horariosDia = div.querySelector(".horarios-dia");

    lista.forEach(h => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "horario-btn";
      btn.textContent = h;

      const ocupado = agendamentos.find(a => a.data === iso && a.horario === h && (a.laboratorio || "") === (laboratorioSelect?.value || ""));
      if (ocupado) {
        btn.disabled = true;
        btn.style.opacity = ".5";
        btn.title = "Horário já agendado";
      }

      if (status === "passado") {
        btn.disabled = true;
        btn.style.opacity = ".5";
        btn.title = "Dia já passou";
      }

      if (status === "48h") {
        btn.disabled = true;
        btn.style.opacity = ".5";
        btn.title = "Somente com 48h de antecedência";
      }

      btn.addEventListener("click", () => {
        if (!btn.disabled) selecionarHorario(dia, h, btn);
      });

      if (diaSelecionado && isoDate(diaSelecionado) === iso && horarioSelecionado === h) {
        btn.classList.add("selecionado", "ativo");
      }

      horariosDia.appendChild(btn);
    });

    semanaContainer.appendChild(div);
  }

  atualizarMes();
}

function selecionarDia(num) {
  const dt = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), num);
  diaSelecionado = dt;
  horarioSelecionado = null;

  document.querySelectorAll(".dia").forEach(d => d.classList.remove("ativo", "selecionado"));
  const clicked = [...document.querySelectorAll(".dia")].find(d => d.textContent == num);
  clicked?.classList.add("ativo", "selecionado");

  atualizarHorarios();
}

function selecionarHorario(dia, horario, botao) {
  horarioSelecionado = horario;
  diaSelecionado = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());

  document.querySelectorAll(".horario-btn").forEach(b => b.classList.remove("ativo", "selecionado"));
  botao.classList.add("ativo", "selecionado");

  const sel = document.getElementById("horarioSelect");
  if (sel) sel.value = horario;
}

function atualizarHorarios() {
  horariosContainer.innerHTML = "";
  const periodo = periodoSelect.value;
  if (!periodo) return;

  const horarios = obterHorariosPorPeriodo(periodo);
  const select = document.createElement("select");
  select.className = "form-select";
  select.id = "horarioSelect";

  select.appendChild(new Option("", ""));

  horarios.forEach(h => select.appendChild(new Option(h, h)));
  horariosContainer.appendChild(select);
  if (horarioSelecionado) select.value = horarioSelecionado;

  select.addEventListener("change", e => horarioSelecionado = e.target.value || null);
}

function obterHorariosPorPeriodo(p) {
  return {
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
  }[p] || [];
}

// botao agendar

btnAgendar.addEventListener("click", async () => {
  if (!diaSelecionado || !horarioSelecionado)
    return mostrarNotificacao("Selecione o dia e o horário!", "erro");

  const status = verificarRestricaoData(diaSelecionado, horarioSelecionado);
  if (status === "passado") return mostrarNotificacao("⚠ Este dia já passou.", "erro");
  if (status === "48h") return mostrarNotificacao("⚠ Agendamentos só podem ser feitos com 48h de antecedência.", "erro");

  const dataISO = isoDate(diaSelecionado);
  const laboratorio = laboratorioSelect.value;
  const kit = kitSelect.value;

  // Verifica colisão localmente (opcional, mas bom manter)
  const repetido = agendamentos.find(a => a.data === dataISO && a.horario === horarioSelecionado && a.laboratorio === laboratorio);
  if (repetido) return mostrarNotificacao("⚠ Já existe um agendamento nesse horário!", "erro");

  // --- TRATAMENTO DO HORÁRIO AQUI ---
  // O horarioSelecionado vem como "1ª aula - 7h10 às 8h00"
  // O split quebra no " - " e pegamos a posição [0] que é "1ª aula"
  let aulaApenas = horarioSelecionado.split(" - ")[0];

  // Opcional: Garante que o 'a' de aula fique maiúsculo para bater com o ENUM do banco (1ª Aula)
  aulaApenas = aulaApenas.replace("aula", "Aula");

  try {
    const periodo = periodoSelect.value;
    const token = getToken();

    const r = await fetch("http://localhost:3000/agendamentos/salvar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        data: dataISO,
        horario: aulaApenas,
        laboratorio: laboratorioSelect.value,
        kit: kitSelect.value,
        periodo: periodoSelect.value,
      })
    });

    // Se o servidor retornar erro, lança exceção
    const resposta = await r.json();
    if (!resposta.sucesso) {
      throw new Error(resposta.mensagem);
    }

    await carregarAgendamentos();
    mostrarNotificacao(`✅ Agendado com sucesso!`, "sucesso");

  } catch (erro) {
    console.error(erro);
    mostrarNotificacao("Erro ao agendar: " + (erro.message || erro), "erro");
  }

  if (modoVisualizacao === "semana") {
    renderizarSemana();
  } else {
    renderizarMes();
  }

});
setaEsquerda.addEventListener("click", () => {
  modoVisualizacao === "mes" ? dataAtual.setMonth(dataAtual.getMonth() - 1)
    : dataAtual.setDate(dataAtual.getDate() - 7);
  modoVisualizacao === "mes" ? renderizarMes() : renderizarSemana();
});
setaDireita.addEventListener("click", () => {
  modoVisualizacao === "mes" ? dataAtual.setMonth(dataAtual.getMonth() + 1)
    : dataAtual.setDate(dataAtual.getDate() + 7);
  modoVisualizacao === "mes" ? renderizarMes() : renderizarSemana();
});
botaoMes.addEventListener("click", () => renderizarMes());
botaoSemana.addEventListener("click", () => renderizarSemana());
periodoSelect.addEventListener("change", () => { atualizarHorarios(); if (modoVisualizacao === "semana") renderizarSemana(); });
laboratorioSelect.addEventListener("change", () => modoVisualizacao === "semana" ? renderizarSemana() : renderizarMes());

(async function init() {
  await carregarLaboratorios();
  await carregarAgendamentos();
  await carregarKits();
  atualizarMes();
  atualizarHorarios();
  renderizarMes();
})();
