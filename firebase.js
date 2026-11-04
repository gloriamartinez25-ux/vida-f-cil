
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBu4Zc7xsmB2NEfZ7hT6zVbpN0c2xoiLY8",
  authDomain: "vida-facil-b1ed1.firebaseapp.com",
  projectId: "vida-facil-b1ed1",
  storageBucket: "vida-facil-b1ed1.firebasestorage.app",
  messagingSenderId: "517345049194",
  appId: "1:517345049194:web:927456d5335ec8019ee813",
  measurementId: "G-N9L259CTKG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const proveedorGoogle = new GoogleAuthProvider();
export const db = getFirestore(app);

// Guarda un dato dentro de la carpeta del usuario conectado.
export async function guardarDato(usuarioId, apartado, datos) {
  const referencia = collection(db, "usuarios", usuarioId, apartado);

  return await addDoc(referencia, {
    ...datos,
    fechaCreacion: serverTimestamp()
  });
}

// Recupera los datos de un apartado del usuario.
export async function obtenerDatos(usuarioId, apartado) {
  const referencia = collection(db, "usuarios", usuarioId, apartado);
  const consulta = query(referencia, orderBy("fechaCreacion", "desc"));
  const resultado = await getDocs(consulta);

  return resultado.docs.map(documento => ({
    id: documento.id,
    ...documento.data()
  }));
}

// Elimina un dato del usuario conectado.
export async function eliminarDato(usuarioId, apartado, datoId) {
  const referencia = doc(db, "usuarios", usuarioId, apartado, datoId);

  return await deleteDoc(referencia);
}

export default app;
