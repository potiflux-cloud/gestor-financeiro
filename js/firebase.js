// Inicialização do Firebase.
// O SDK vem do pacote npm "firebase" e é empacotado pelo Vite,
// por isso o app funciona offline dentro do celular (Capacitor).

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";

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