// ============================================
// GESTOR FINANCEIRO
// Interface, login e perfil compartilhado.
// Os dados ficam no Firestore (ver data.js).
// ============================================

import {
  criarConta,
  entrar,
  sair,
  redefinirSenha,
  observarUsuario,
  mensagemDeErro
} from "./auth.js";

import {
  buscarPerfilDoUsuario,
  criarPerfil,
  entrarComCodigo
} from "./perfil.js";

import {
  ouvirLancamentos,
  salvarLancamento,
  apagarLancamento,
  ouvirMetas,
  salvarMeta,
  depositarNaMeta,
  apagarMeta,
  importarDadosLocais
} from "./data.js";

// ===== ELEMENTOS DA PÁGINA =====

const telas = {
  carregando: document.getElementById("tela-carregando"),
  login: document.getElementById("tela-login"),
  perfil: document.getElementById("tela-perfil"),
  app: document.getElementById("tela-app")
};

const elCarregandoTexto = document.getElementById("carregando-texto");
const botaoTentarDeNovo = document.getElementById("tentar-de-novo");

// Login
const formLogin = document.getElementById("form-login");
const inputLoginEmail = document.getElementById("login-email");
const inputLoginSenha = document.getElementById("login-senha");
const elLoginTitulo = document.getElementById("login-titulo");
const elLoginMsg = document.getElementById("login-msg");
const botaoLoginEnviar = document.getElementById("login-enviar");
const botaoLoginAlternar = document.getElementById("login-alternar");
const botaoLoginEsqueci = document.getElementById("login-esqueci");

// Perfil
const formCriarPerfil = document.getElementById("form-criar-perfil");
const inputPerfilNovo = document.getElementById("perfil-nome-novo");
const formCodigo = document.getElementById("form-codigo");
const inputCodigoEntrada = document.getElementById("perfil-codigo-entrada");
const elPerfilMsg = document.getElementById("perfil-msg");

// Barra da conta
const elPerfilNome = document.getElementById("perfil-nome");
const elPerfilCodigo = document.getElementById("perfil-codigo");
const botaoCopiarCodigo = document.getElementById("copiar-codigo");
const botaoImportar = document.getElementById("importar-locais");

// Lançamentos
const formLancamento = document.getElementById("form-lancamento");
const inputDescricao = document.getElementById("descricao");
const inputValor = document.getElementById("valor");
const inputData = document.getElementById("data");
const inputCategoria = document.getElementById("categoria");
const listaLancamentos = document.getElementById("lista-lancamentos");

const elSaldo = document.getElementById("saldo");
const elReceitas = document.getElementById("total-receitas");
const elDespesas = document.getElementById("total-despesas");

// Metas
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

// ===== ESTADO =====

let usuario = null;
let perfil = null;
let lancamentos = [];
let metas = [];
let desligarOuvintes = [];
let modoLogin = "entrar"; // "entrar" ou "criar"

// ===== VALIDAÇÃO =====

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
    Object.prototype.hasOwnProperty.call(nomesCategorias, l.categoria)
  );
}

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

// ===== FUNÇÕES AUXILIARES =====

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// Converte AAAA-MM-DD em DD/MM/AAAA sem problemas de fuso horário.
function formatarData(data) {
  return data.split("-").reverse().join("/");
}

// Retorna a data de hoje no formato do input date.
function hojeISO() {
  const agora = new Date();

  const local = new Date(
    agora.getTime() - agora.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 10);
}

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

function mostrarTela(nome) {
  Object.entries(telas).forEach(([chave, elemento]) => {
    elemento.hidden = chave !== nome;
  });
}

function mostrarMensagem(elemento, texto, tipo = "erro") {
  elemento.textContent = texto;
  elemento.className = `msg msg-${tipo}`;
  elemento.hidden = false;
}

function esconderMensagem(elemento) {
  elemento.hidden = true;
  elemento.textContent = "";
}

function erroAoSalvar(erro) {
  console.error("Erro ao salvar:", erro);

  alert(
    "Não foi possível salvar. " +
    "Verifique a conexão e tente de novo."
  );
}

// ============================================
// LOGIN E CADASTRO
// ============================================

function definirModoLogin(modo) {
  modoLogin = modo;

  const criando = modo === "criar";

  elLoginTitulo.textContent = criando ? "Criar conta" : "Entrar";
  botaoLoginEnviar.textContent = criando ? "Criar conta" : "Entrar";
  botaoLoginAlternar.textContent = criando
    ? "Já tenho conta"
    : "Criar conta";

  inputLoginSenha.autocomplete = criando
    ? "new-password"
    : "current-password";

  esconderMensagem(elLoginMsg);
}

botaoLoginAlternar.addEventListener("click", () => {
  definirModoLogin(modoLogin === "entrar" ? "criar" : "entrar");
});

botaoLoginEsqueci.addEventListener("click", async () => {
  const email = inputLoginEmail.value.trim();

  if (!email) {
    mostrarMensagem(elLoginMsg, "Digite seu e-mail para receber o link.");
    inputLoginEmail.focus();
    return;
  }

  try {
    await redefinirSenha(email);

    mostrarMensagem(
      elLoginMsg,
      "Se esse e-mail tiver conta, enviamos um link para criar uma nova senha.",
      "ok"
    );
  } catch (erro) {
    mostrarMensagem(elLoginMsg, mensagemDeErro(erro));
  }
});

formLogin.addEventListener("submit", async evento => {
  evento.preventDefault();

  esconderMensagem(elLoginMsg);
  botaoLoginEnviar.disabled = true;

  const email = inputLoginEmail.value.trim();
  const senha = inputLoginSenha.value;

  try {
    if (modoLogin === "criar") {
      await criarConta(email, senha);
    } else {
      await entrar(email, senha);
    }
    // O restante acontece em observarUsuario().
  } catch (erro) {
    mostrarMensagem(elLoginMsg, mensagemDeErro(erro));
  } finally {
    botaoLoginEnviar.disabled = false;
  }
});

document.querySelectorAll('[data-acao="sair"]').forEach(botao => {
  botao.addEventListener("click", () => {
    sair().catch(erroAoSalvar);
  });
});

// ============================================
// PERFIL COMPARTILHADO
// ============================================

formCriarPerfil.addEventListener("submit", async evento => {
  evento.preventDefault();

  esconderMensagem(elPerfilMsg);

  const nome = inputPerfilNovo.value.trim();

  if (!nome) {
    mostrarMensagem(elPerfilMsg, "Dê um nome ao perfil.");
    return;
  }

  const botao = formCriarPerfil.querySelector("button[type=submit]");
  botao.disabled = true;

  try {
    perfil = await criarPerfil(usuario.uid, nome);
    iniciarApp();
  } catch (erro) {
    console.error(erro);
    mostrarMensagem(elPerfilMsg, erro.message || mensagemDeErro(erro));
  } finally {
    botao.disabled = false;
  }
});

formCodigo.addEventListener("submit", async evento => {
  evento.preventDefault();

  esconderMensagem(elPerfilMsg);

  const botao = formCodigo.querySelector("button[type=submit]");
  botao.disabled = true;

  try {
    perfil = await entrarComCodigo(usuario.uid, inputCodigoEntrada.value);

    if (!perfil) {
      throw new Error("Não foi possível entrar nesse perfil.");
    }

    iniciarApp();
  } catch (erro) {
    console.error(erro);
    mostrarMensagem(elPerfilMsg, erro.message || mensagemDeErro(erro));
  } finally {
    botao.disabled = false;
  }
});

botaoCopiarCodigo.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(perfil.codigo);
    botaoCopiarCodigo.textContent = "Copiado";
  } catch (erro) {
    botaoCopiarCodigo.textContent = "Copie manualmente";
  }

  setTimeout(() => {
    botaoCopiarCodigo.textContent = "Copiar";
  }, 2000);
});

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

  elReceitas.textContent = formatarMoeda(receitas);
  elDespesas.textContent = formatarMoeda(despesas);
  elSaldo.textContent = formatarMoeda(receitas - despesas);
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

  // Mais recentes primeiro.
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

    const info = document.createElement("div");

    const titulo = document.createElement("strong");
    titulo.textContent = l.descricao;

    const detalhe = document.createElement("small");
    detalhe.textContent =
      `${nomesCategorias[l.categoria]} • ${formatarData(l.data)}`;

    info.append(titulo, detalhe);

    const quantia = document.createElement("span");

    quantia.className = "quantia";
    quantia.textContent =
      `${l.tipo === "despesa" ? "- " : "+ "}${formatarMoeda(l.valor)}`;

    const botao = document.createElement("button");

    botao.type = "button";
    botao.textContent = "✕";
    botao.setAttribute("aria-label", `Excluir ${l.descricao}`);

    botao.addEventListener("click", () => {
      excluirLancamento(l.id);
    });

    li.append(info, quantia, botao);

    listaLancamentos.appendChild(li);
  });

  atualizarResumo();
}

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

  if (!Object.prototype.hasOwnProperty.call(nomesCategorias, categoria)) {
    alert("Selecione uma categoria válida.");
    inputCategoria.focus();
    return;
  }

  // Não esperamos a resposta do servidor: o item aparece na hora
  // (cache local) e sincroniza em seguida, mesmo sem internet.
  salvarLancamento(perfil.id, {
    tipo: tipoSelecionado.value,
    descricao,
    valor,
    data,
    categoria
  }).catch(erroAoSalvar);

  formLancamento.reset();

  inputData.value = hojeISO();
  inputDescricao.focus();
}

function excluirLancamento(id) {
  apagarLancamento(perfil.id, id).catch(erroAoSalvar);
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
    const percentual = Math.min(100, (m.guardado / m.alvo) * 100);
    const falta = Math.max(0, m.alvo - m.guardado);
    const concluida = m.guardado >= m.alvo;

    const li = document.createElement("li");

    li.className = "meta" + (concluida ? " concluida" : "");

    const topo = document.createElement("div");
    topo.className = "meta-topo";

    const titulo = document.createElement("strong");
    titulo.textContent = m.nome;

    const excluir = document.createElement("button");

    excluir.type = "button";
    excluir.className = "meta-excluir";
    excluir.textContent = "✕";
    excluir.setAttribute("aria-label", `Excluir meta ${m.nome}`);

    excluir.addEventListener("click", () => {
      excluirMeta(m.id);
    });

    topo.append(titulo, excluir);

    const barra = document.createElement("div");
    barra.className = "barra";

    const preenchimento = document.createElement("div");
    preenchimento.style.width = `${percentual}%`;

    barra.appendChild(preenchimento);

    const texto = document.createElement("small");

    if (concluida) {
      texto.textContent =
        `Meta concluída! ${formatarMoeda(m.alvo)} guardados.`;
    } else {
      texto.textContent =
        `${formatarMoeda(m.guardado)} de ${formatarMoeda(m.alvo)} ` +
        `(${Math.floor(percentual)}%) • faltam ${formatarMoeda(falta)}`;
    }

    li.append(topo, barra, texto);

    if (!concluida) {
      const deposito = document.createElement("form");

      deposito.className = "meta-deposito";

      const campo = document.createElement("input");

      campo.type = "number";
      campo.min = "0.01";
      campo.step = "0.01";
      campo.placeholder = "Valor a guardar";
      campo.required = true;
      campo.setAttribute("aria-label", `Valor a guardar em ${m.nome}`);

      const botao = document.createElement("button");

      botao.type = "submit";
      botao.className = "botao";
      botao.textContent = "Guardar";

      deposito.append(campo, botao);

      deposito.addEventListener("submit", evento => {
        evento.preventDefault();
        guardarNaMeta(m.id, Number(campo.value));
      });

      li.appendChild(deposito);
    }

    listaMetas.appendChild(li);
  });
}

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

  salvarMeta(perfil.id, { nome, alvo, guardado: 0 }).catch(erroAoSalvar);

  formMeta.reset();
  inputMetaNome.focus();
}

function guardarNaMeta(id, valor) {
  if (!Number.isFinite(valor) || valor <= 0) {
    alert("Informe um depósito maior que zero.");
    return;
  }

  const meta = metas.find(m => m.id === id);

  if (!meta || meta.guardado >= meta.alvo) {
    return;
  }

  // Não deixa o valor guardado passar do objetivo.
  const deposito = arredondar(
    Math.min(valor, meta.alvo - meta.guardado)
  );

  depositarNaMeta(perfil.id, id, deposito).catch(erroAoSalvar);
}

function excluirMeta(id) {
  apagarMeta(perfil.id, id).catch(erroAoSalvar);
}

// ============================================
// IMPORTAR DADOS ANTIGOS (localStorage)
// ============================================

function lerDadosLocais() {
  try {
    const l = JSON.parse(localStorage.getItem("lancamentos") || "[]");
    const m = JSON.parse(localStorage.getItem("metas") || "[]");

    return {
      lancamentos: Array.isArray(l) ? l.filter(lancamentoValido) : [],
      metas: Array.isArray(m) ? m.filter(metaValida) : []
    };
  } catch (erro) {
    return { lancamentos: [], metas: [] };
  }
}

function verificarDadosLocais() {
  const locais = lerDadosLocais();

  botaoImportar.hidden =
    locais.lancamentos.length === 0 && locais.metas.length === 0;
}

botaoImportar.addEventListener("click", async () => {
  const locais = lerDadosLocais();

  const ok = confirm(
    `Importar ${locais.lancamentos.length} lançamento(s) e ` +
    `${locais.metas.length} meta(s) para o perfil "${perfil.nome}"?\n\n` +
    "Faça isso em apenas um aparelho para não duplicar os dados."
  );

  if (!ok) {
    return;
  }

  botaoImportar.disabled = true;

  try {
    await importarDadosLocais(perfil.id, locais.lancamentos, locais.metas);

    localStorage.removeItem("lancamentos");
    localStorage.removeItem("metas");

    botaoImportar.hidden = true;
  } catch (erro) {
    erroAoSalvar(erro);
  } finally {
    botaoImportar.disabled = false;
  }
});

// ============================================
// INICIALIZAÇÃO
// ============================================

function pararOuvintes() {
  desligarOuvintes.forEach(parar => parar());
  desligarOuvintes = [];
}

function erroDeLeitura(erro) {
  console.error("Erro ao ler os dados:", erro);

  alert(
    "Não foi possível carregar os dados do perfil. " +
    "Verifique a conexão e tente de novo."
  );
}

function iniciarApp() {
  pararOuvintes();

  elPerfilNome.textContent = perfil.nome;
  elPerfilCodigo.textContent = perfil.codigo;

  inputData.value = hojeISO();

  lancamentos = [];
  metas = [];

  renderizar();
  renderizarMetas();

  mostrarTela("app");
  verificarDadosLocais();

  desligarOuvintes = [
    ouvirLancamentos(
      perfil.id,
      lista => {
        lancamentos = lista.filter(lancamentoValido);
        renderizar();
      },
      erroDeLeitura
    ),
    ouvirMetas(
      perfil.id,
      lista => {
        metas = lista
          .filter(metaValida)
          .sort((a, b) => String(a.id).localeCompare(String(b.id)));
        renderizarMetas();
      },
      erroDeLeitura
    )
  ];
}

async function carregarUsuario() {
  mostrarTela("carregando");

  elCarregandoTexto.textContent = "Carregando…";
  botaoTentarDeNovo.hidden = true;

  try {
    perfil = await buscarPerfilDoUsuario(usuario.uid);
  } catch (erro) {
    console.error(erro);

    elCarregandoTexto.textContent =
      "Não foi possível carregar seu perfil. Verifique a internet.";
    botaoTentarDeNovo.hidden = false;

    return;
  }

  if (!perfil) {
    esconderMensagem(elPerfilMsg);
    mostrarTela("perfil");
    return;
  }

  iniciarApp();
}

botaoTentarDeNovo.addEventListener("click", () => {
  if (usuario) {
    carregarUsuario();
  }
});

formLancamento.addEventListener("submit", adicionarLancamento);
formMeta.addEventListener("submit", criarMeta);

// Dispara ao abrir o app e sempre que alguém entra ou sai.
observarUsuario(novoUsuario => {
  pararOuvintes();

  usuario = novoUsuario;
  perfil = null;
  lancamentos = [];
  metas = [];

  if (!usuario) {
    formLogin.reset();
    definirModoLogin("entrar");
    mostrarTela("login");
    return;
  }

  carregarUsuario();
});