// Login e cadastro com e-mail e senha.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";

import { auth } from "./firebase.js";

const mensagens = {
  "auth/invalid-email": "E-mail inválido.",
  "auth/missing-password": "Informe a senha.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/email-already-in-use": "Já existe uma conta com esse e-mail.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/too-many-requests": "Muitas tentativas. Espere um pouco e tente de novo.",
  "auth/network-request-failed": "Sem conexão com a internet."
};

export function mensagemDeErro(erro) {
  return mensagens[erro && erro.code] || "Algo deu errado. Tente de novo.";
}

export function criarConta(email, senha) {
  return createUserWithEmailAndPassword(auth, email, senha);
}

export function entrar(email, senha) {
  return signInWithEmailAndPassword(auth, email, senha);
}

export function sair() {
  return signOut(auth);
}

export function redefinirSenha(email) {
  return sendPasswordResetEmail(auth, email);
}

// Chama a função recebida sempre que alguém entra ou sai.
export function observarUsuario(aoMudar) {
  return onAuthStateChanged(auth, aoMudar);
}