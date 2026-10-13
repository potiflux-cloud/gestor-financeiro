
"use strict";

// ============================================
// GESTOR FINANCEIRO
// HTML + CSS + JAVASCRIPT
// ============================================

// ===== ELEMENTOS DA PÁGINA =====

const formLancamento = document.getElementById("form-lancamento");
const inputDescricao = document.getElementById("descricao");
const inputValor = document.getElementById("valor");
const inputData = document.getElementById("data");
const inputCategoria = document.getElementById("categoria");
const listaLancamentos = document.getElementById("lista-lancamentos");

const elSaldo = document.getElementById("saldo");
const elReceitas = document.getElementById("total-receitas");
const elDespesas = document.getElementById("total-despesas");

const formMeta = document.getElementById("form-meta");
const inputMetaNome = document.getElementById("meta-nome");
const inputMetaValor = document.getElementById("meta-valor");
const listaMetas = document.getElementById("lista-metas");

// ===== CATEGORIAS =====

const nomesCategorias = {
  alimentacao: "Alimentação",
  transporte: "Transporte",
  estudos: "Estudos",
  lazer: "Lazer",
  salario: "Salário / Renda",
  outros: "Outros"
};

// ===== ARMAZENAMENTO =====

// Carrega os dados sem interromper o sistema
// caso o conteúdo salvo esteja inválido.

function carregarDados(chave) {
  try {
    const dados = localStorage.getItem(chave);

    if (!dados) {
      return [];
    }

    const resultado = JSON.parse(dados);

    return Array.isArray(resultado) ? resultado : [];
  } catch (erro) {
    console.error(`Erro ao carregar ${chave}:`, erro);

    alert(
      `Não foi possível ler os dados de "${chave}". ` +
      "Verifique o console do navegador."
    );

    return [];
  }
}

// Salva os dados e informa se a operação funcionou.

function salvarDados(chave, dados) {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
    return true;
  } catch (erro) {
    console.error(`Erro ao salvar ${chave}:`, erro);

    alert(
      "Não foi possível salvar os dados. " +
      "Verifique o espaço disponível no navegador."
    );

    return false;
  }
}

// ===== DADOS DOS LANÇAMENTOS =====

function lancamentoValido(l) {
  if (!l || typeof l !== "object") {
    return false;
  }

  const dataValida =
    typeof l.data === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(l.data) &&
    !Number.isNaN(Date.parse(l.data + "T12:00:00"));

  return (
    (l.tipo === "receita" || l.tipo === "despesa") &&
    typeof l.descricao === "string" &&
    l.descricao.trim().length > 0 &&
    Number.isFinite(l.valor) &&
    l.valor > 0 &&
    dataValida &&
    Object.prototype.hasOwnProperty.call(
      nomesCategorias,
      l.categoria
    )
  );
}

let lancamentos = carregarDados("lancamentos")
  .filter(lancamentoValido);

// ===== DADOS DAS METAS =====

function metaValida(m) {
  return (
    m !== null &&
    typeof m === "object" &&
    typeof m.nome === "string" &&
    m.nome.trim().length > 0 &&
    Number.isFinite(m.alvo) &&
    m.alvo > 0 &&
    Number.isFinite(m.guardado) &&
    m.guardado >= 0
  );
}

let metas = carregarDados("metas")
  .filter(metaValida);

// ===== FUNÇÕES AUXILIARES =====

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// Converte AAAA-MM-DD em DD/MM/AAAA
// sem problemas de fuso horário.

function formatarData(data) {
  return data.split("-").reverse().join("/");
}

// Retorna a data de hoje no formato do input date.

function hojeISO() {
  const agora = new Date();

  const local = new Date(
    agora.getTime() -
    agora.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 10);
}

// Gera identificadores diferentes para cada registro.

function gerarId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  );
}

// ===== SALVAR LANÇAMENTOS E METAS =====

function salvarLancamentos() {
  return salvarDados("lancamentos", lancamentos);
}

function salvarMetas() {
  return salvarDados("metas", metas);
}

// ============================================
// RESUMO FINANCEIRO
// ============================================

function atualizarResumo() {
  const receitas = lancamentos
    .filter(l => l.tipo === "receita")
    .reduce((soma, l) => soma + l.valor, 0);

  const despesas = lancamentos
    .filter(l => l.tipo === "despesa")
    .reduce((soma, l) => soma + l.valor, 0);

  const saldo = receitas - despesas;

  elReceitas.textContent = formatarMoeda(receitas);
  elDespesas.textContent = formatarMoeda(despesas);
  elSaldo.textContent = formatarMoeda(saldo);
}

// ============================================
// LANÇAMENTOS
// ============================================

function renderizar() {
  listaLancamentos.replaceChildren();

  if (lancamentos.length === 0) {
    const vazio = document.createElement("li");

    vazio.className = "vazio";
    vazio.textContent =
      "Nenhum lançamento ainda. Use o formulário para adicionar o primeiro.";

    listaLancamentos.appendChild(vazio);
    atualizarResumo();

    return;
  }

  // Ordena por data, mostrando as mais recentes primeiro.

  const ordenados = [...lancamentos].sort((a, b) => {
    const comparacao = b.data.localeCompare(a.data);

    if (comparacao !== 0) {
      return comparacao;
    }

    return String(b.id).localeCompare(String(a.id));
  });

  ordenados.forEach(l => {
    const li = document.createElement("li");

    li.className = `item ${l.tipo}`;

    // Descrição e detalhes.

    const info = document.createElement("div");

    const titulo = document.createElement("strong");
    titulo.textContent = l.descricao;

    const detalhe = document.createElement("small");
    detalhe.textContent =
      `${nomesCategorias[l.categoria]} • ${formatarData(l.data)}`;

    info.append(titulo, detalhe);

    // Valor da receita ou despesa.

    const quantia = document.createElement("span");

    quantia.className = "quantia";

    quantia.textContent =
      `${l.tipo === "despesa" ? "- " : "+ "}${formatarMoeda(l.valor)}`;

    // Botão de exclusão.

    const botao = document.createElement("button");

    botao.type = "button";
    botao.textContent = "✕";
    botao.setAttribute(
      "aria-label",
      `Excluir ${l.descricao}`
    );

    botao.addEventListener("click", () => {
      excluirLancamento(l.id);
    });

    li.append(info, quantia, botao);

    listaLancamentos.appendChild(li);
  });

  atualizarResumo();
}

// ===== ADICIONAR LANÇAMENTO =====

function adicionarLancamento(evento) {
  evento.preventDefault();

  const tipoSelecionado = formLancamento.querySelector(
    'input[name="tipo"]:checked'
  );

  const descricao = inputDescricao.value.trim();
  const valor = Number(inputValor.value);
  const data = inputData.value;
  const categoria = inputCategoria.value;

  if (!tipoSelecionado) {
    alert("Selecione receita ou despesa.");
    return;
  }

  if (!descricao) {
    alert("Informe uma descrição.");
    inputDescricao.focus();
    return;
  }

  if (!Number.isFinite(valor) || valor <= 0) {
    alert("Informe um valor maior que zero.");
    inputValor.focus();
    return;
  }

  if (
    !data ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data) ||
    data > hojeISO()
  ) {
    alert("Informe uma data válida, até a data de hoje.");
    inputData.focus();
    return;
  }

  if (
    !Object.prototype.hasOwnProperty.call(
      nomesCategorias,
      categoria
    )
  ) {
    alert("Selecione uma categoria válida.");
    inputCategoria.focus();
    return;
  }

  const novo = {
    id: gerarId(),
    tipo: tipoSelecionado.value,
    descricao,
    valor,
    data,
    categoria
  };

  lancamentos.push(novo);

  if (!salvarLancamentos()) {
    lancamentos.pop();
    return;
  }

  renderizar();

  formLancamento.reset();

  inputData.value = hojeISO();
  inputDescricao.focus();
}

// ===== EXCLUIR LANÇAMENTO =====

function excluirLancamento(id) {
  const anteriores = lancamentos;

  lancamentos = lancamentos.filter(l => l.id !== id);

  if (!salvarLancamentos()) {
    lancamentos = anteriores;
    return;
  }

  renderizar();
}

// ============================================
// METAS DE ECONOMIA
// ============================================

function renderizarMetas() {
  listaMetas.replaceChildren();

  if (metas.length === 0) {
    const vazio = document.createElement("li");

    vazio.className = "vazio";
    vazio.textContent = "Nenhuma meta criada.";

    listaMetas.appendChild(vazio);

    return;
  }

  metas.forEach(m => {
    const percentual = Math.min(
      100,
      (m.guardado / m.alvo) * 100
    );

    const falta = Math.max(
      0,
      m.alvo - m.guardado
    );

    const concluida = m.guardado >= m.alvo;

    const li = document.createElement("li");

    li.className =
      "meta" + (concluida ? " concluida" : "");

    // Título e botão para excluir a meta.

    const topo = document.createElement("div");
    topo.className = "meta-topo";

    const titulo = document.createElement("strong");
    titulo.textContent = m.nome;

    const excluir = document.createElement("button");

    excluir.type = "button";
    excluir.className = "meta-excluir";
    excluir.textContent = "✕";

    excluir.setAttribute(
      "aria-label",
      `Excluir meta ${m.nome}`
    );

    excluir.addEventListener("click", () => {
      excluirMeta(m.id);
    });

    topo.append(titulo, excluir);

    // Barra de progresso.

    const barra = document.createElement("div");
    barra.className = "barra";

    const preenchimento = document.createElement("div");

    preenchimento.style.width = `${percentual}%`;

    barra.appendChild(preenchimento);

    // Texto do progresso.

    const texto = document.createElement("small");

    if (concluida) {
      texto.textContent =
        `Meta concluída! ${formatarMoeda(m.guardado)} guardados.`;
    } else {
      texto.textContent =
        `${formatarMoeda(m.guardado)} de ${formatarMoeda(m.alvo)} ` +
        `(${Math.floor(percentual)}%) • faltam ${formatarMoeda(falta)}`;
    }

    li.append(topo, barra, texto);

    // Formulário de depósito.
    // Metas concluídas não recebem novos depósitos.

    if (!concluida) {
      const deposito = document.createElement("form");

      deposito.className = "meta-deposito";

      const campo = document.createElement("input");

      campo.type = "number";
      campo.min = "0.01";
      campo.step = "0.01";
      campo.placeholder = "Valor a guardar";
      campo.required = true;

      campo.setAttribute(
        "aria-label",
        `Valor a guardar em ${m.nome}`
      );

      const botao = document.createElement("button");

      botao.type = "submit";
      botao.className = "botao";
      botao.textContent = "Guardar";

      deposito.append(campo, botao);

      deposito.addEventListener("submit", evento => {
        evento.preventDefault();

        guardarNaMeta(
          m.id,
          Number(campo.value)
        );
      });

      li.appendChild(deposito);
    }

    listaMetas.appendChild(li);
  });
}

// ===== CRIAR META =====

function criarMeta(evento) {
  evento.preventDefault();

  const nome = inputMetaNome.value.trim();
  const alvo = Number(inputMetaValor.value);

  if (!nome) {
    alert("Informe o nome do objetivo.");
    inputMetaNome.focus();
    return;
  }

  if (!Number.isFinite(alvo) || alvo <= 0) {
    alert("Informe um valor para a meta maior que zero.");
    inputMetaValor.focus();
    return;
  }

  const novaMeta = {
    id: gerarId(),
    nome,
    alvo,
    guardado: 0
  };

  metas.push(novaMeta);

  if (!salvarMetas()) {
    metas.pop();
    return;
  }

  renderizarMetas();

  formMeta.reset();
  inputMetaNome.focus();
}

// ===== GUARDAR DINHEIRO NA META =====

function guardarNaMeta(id, valor) {
  if (!Number.isFinite(valor) || valor <= 0) {
    alert("Informe um depósito maior que zero.");
    return;
  }

  const meta = metas.find(m => m.id === id);

  if (!meta || meta.guardado >= meta.alvo) {
    return;
  }

  const guardadoAnterior = meta.guardado;

  // Impede que o valor guardado ultrapasse o objetivo.

  meta.guardado = Math.min(
    meta.alvo,
    meta.guardado + valor
  );

  if (!salvarMetas()) {
    meta.guardado = guardadoAnterior;
    return;
  }

  renderizarMetas();
}

// ===== EXCLUIR META =====

function excluirMeta(id) {
  const anteriores = metas;

  metas = metas.filter(m => m.id !== id);

  if (!salvarMetas()) {
    metas = anteriores;
    return;
  }

  renderizarMetas();
}

// ============================================
// INICIALIZAÇÃO DO SISTEMA
// ============================================

// Registra cada evento uma única vez.

formLancamento.addEventListener(
  "submit",
  adicionarLancamento
);

formMeta.addEventListener(
  "submit",
  criarMeta
);

// Define a data inicial e renderiza a interface.

inputData.value = hojeISO();

renderizar();
renderizarMetas();
