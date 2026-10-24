// Inicialização do Firebase.
// Por enquanto o SDK vem do CDN do Google, então o app roda direto no
// Live Server e no GitHub Pages. Na etapa do APK, trocamos para o pacote
// npm "firebase" (assim o app funciona offline dentro do celular).

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// O cache local permite abrir o app e lançar gastos sem internet.
// Quando a conexão volta, tudo sincroniza sozinho.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});