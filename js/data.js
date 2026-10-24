// Camada de dados: tudo que fala com o Firestore fica aqui.
// A interface (script.js) só chama estas funções.
//
//   perfis/{perfilId}/lancamentos/{id}
//   perfis/{perfilId}/metas/{id}

import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  increment,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";

import { db, auth } from "./firebase.js";

const colecao = (perfilId, nome) =>
  collection(db, "perfis", perfilId, nome);

const documento = (perfilId, nome, id) =>
  doc(db, "perfis", perfilId, nome, id);

function ouvir(perfilId, nome, aoMudar, aoErrar) {
  // Retorna uma função que desliga o ouvinte.
  return onSnapshot(
    colecao(perfilId, nome),
    resultado => {
      aoMudar(resultado.docs.map(d => ({ id: d.id, ...d.data() })));
    },
    aoErrar
  );
}

// ===== LANÇAMENTOS =====

export function ouvirLancamentos(perfilId, aoMudar, aoErrar) {
  return ouvir(perfilId, "lancamentos", aoMudar, aoErrar);
}

export function salvarLancamento(perfilId, dados) {
  return addDoc(colecao(perfilId, "lancamentos"), {
    ...dados,
    criadoPor: auth.currentUser.uid,
    criadoEm: serverTimestamp()
  });
}

export function apagarLancamento(perfilId, id) {
  return deleteDoc(documento(perfilId, "lancamentos", id));
}

// ===== METAS =====

export function ouvirMetas(perfilId, aoMudar, aoErrar) {
  return ouvir(perfilId, "metas", aoMudar, aoErrar);
}

export function salvarMeta(perfilId, dados) {
  return addDoc(colecao(perfilId, "metas"), {
    ...dados,
    criadoPor: auth.currentUser.uid,
    criadoEm: serverTimestamp()
  });
}

// increment() soma no servidor, então dois celulares guardando
// ao mesmo tempo não sobrescrevem o valor um do outro.
export function depositarNaMeta(perfilId, id, valor) {
  return updateDoc(documento(perfilId, "metas", id), {
    guardado: increment(valor)
  });
}

export function apagarMeta(perfilId, id) {
  return deleteDoc(documento(perfilId, "metas", id));
}

// ===== IMPORTAR DADOS ANTIGOS (localStorage) =====

export async function importarDadosLocais(perfilId, lancamentos, metas) {
  const uid = auth.currentUser.uid;

  const itens = [
    ...lancamentos.map(l => ["lancamentos", {
      tipo: l.tipo,
      descricao: l.descricao.slice(0, 120),
      valor: l.valor,
      data: l.data,
      categoria: l.categoria
    }]),
    ...metas.map(m => ["metas", {
      nome: m.nome.slice(0, 60),
      alvo: m.alvo,
      guardado: Math.min(m.guardado, m.alvo)
    }])
  ];

  // O Firestore aceita até 500 operações por lote.
  for (let i = 0; i < itens.length; i += 400) {
    const lote = writeBatch(db);

    itens.slice(i, i + 400).forEach(([nome, dados]) => {
      lote.set(doc(colecao(perfilId, nome)), {
        ...dados,
        criadoPor: uid,
        criadoEm: serverTimestamp()
      });
    });

    await lote.commit();
  }
}