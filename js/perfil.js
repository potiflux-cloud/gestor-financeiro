// Perfil compartilhado: uma pessoa cria, a outra entra com o código de convite.
//
// Estrutura no Firestore:
//   usuarios/{uid}      → { perfilId }
//   perfis/{perfilId}   → { nome, membros: [uid, uid], codigo }
//   convites/{codigo}   → { perfilId, criadoPor }

import {
  doc,
  collection,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  arrayUnion,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import { db } from "./firebase.js";

// Sem 0/O e 1/I, para não confundir na hora de digitar.
// São 32 caracteres, então cada byte aleatório cai de forma uniforme.
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TAMANHO_CODIGO = 8;

function gerarCodigo() {
  const bytes = new Uint8Array(TAMANHO_CODIGO);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => ALFABETO[b % ALFABETO.length]).join("");
}

export function normalizarCodigo(texto) {
  return String(texto).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// Retorna o perfil do usuário, ou null se ele ainda não tem
// (ou se foi removido do perfil).
export async function buscarPerfilDoUsuario(uid) {
  const usuario = await getDoc(doc(db, "usuarios", uid));

  if (!usuario.exists()) {
    return null;
  }

  try {
    const perfil = await getDoc(doc(db, "perfis", usuario.data().perfilId));

    if (!perfil.exists() || !perfil.data().membros.includes(uid)) {
      return null;
    }

    return { id: perfil.id, ...perfil.data() };
  } catch (erro) {
    if (erro.code === "permission-denied") {
      return null;
    }

    throw erro;
  }
}

// Cria um perfil novo e já gera o código de convite.
export async function criarPerfil(uid, nome) {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = gerarCodigo();
    const perfilRef = doc(collection(db, "perfis"));

    const lote = writeBatch(db);

    lote.set(perfilRef, {
      nome,
      membros: [uid],
      codigo,
      criadoEm: serverTimestamp()
    });

    lote.set(doc(db, "convites", codigo), {
      perfilId: perfilRef.id,
      criadoPor: uid
    });

    lote.set(doc(db, "usuarios", uid), { perfilId: perfilRef.id });

    try {
      await lote.commit();
      return { id: perfilRef.id, nome, membros: [uid], codigo };
    } catch (erro) {
      // Código repetido (raríssimo): as regras recusam e tentamos outro.
      if (erro.code !== "permission-denied") {
        throw erro;
      }
    }
  }

  throw new Error("Não foi possível criar o perfil. Tente de novo.");
}

// Entra num perfil que já existe usando o código de convite.
export async function entrarComCodigo(uid, codigoDigitado) {
  const codigo = normalizarCodigo(codigoDigitado);

  if (codigo.length !== TAMANHO_CODIGO) {
    throw new Error(`O código tem ${TAMANHO_CODIGO} caracteres.`);
  }

  const convite = await getDoc(doc(db, "convites", codigo));

  if (!convite.exists()) {
    throw new Error("Código não encontrado. Confira e tente de novo.");
  }

  const perfilId = convite.data().perfilId;

  try {
    await updateDoc(doc(db, "perfis", perfilId), {
      membros: arrayUnion(uid),
      codigoInformado: codigo
    });
  } catch (erro) {
    if (erro.code === "permission-denied") {
      throw new Error("Esse perfil já tem duas pessoas.");
    }

    throw erro;
  }

  await setDoc(doc(db, "usuarios", uid), { perfilId });

  return buscarPerfilDoUsuario(uid);
}