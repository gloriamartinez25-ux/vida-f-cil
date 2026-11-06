
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
  serverTimestamp,
  setDoc,
  getDoc
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

  if (auth.currentUser?.uid !== usuarioId) {
    throw new Error("Usuario no autorizado.");
  }

  const referencia = collection(db, "usuarios", usuarioId, apartado);

  return await addDoc(referencia, {
    ...datos,
    fechaCreacion: serverTimestamp()
  });
}

// Recupera los datos de un apartado del usuario.
export async function obtenerDatos(usuarioId, apartado) {

  if (auth.currentUser?.uid !== usuarioId) {
    throw new Error("Usuario no autorizado.");
  }

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

  if (auth.currentUser?.uid !== usuarioId) {
    throw new Error("Usuario no autorizado.");
  }

  const referencia = doc(db, "usuarios", usuarioId, apartado, datoId);

  return await deleteDoc(referencia);
}

// Guarda el plan que el usuario ha seleccionado.
// Esto NO significa que lo haya contratado.
export async function guardarPlanSeleccionado(usuarioId, plan) {

  if (auth.currentUser?.uid !== usuarioId) {
    throw new Error("Usuario no autorizado.");
  }

  const planesDisponibles = {
    Basico: {
      nombre: "Básico",
      precio: "0,99 € - pago único"
    },
    Premium: {
      nombre: "Premium",
      precio: "3,99 € / mes"
    },
    Familiar: {
      nombre: "Familiar",
      precio: "5,99 € / mes"
    }
  };

  const planElegido = planesDisponibles[plan];

  if (!planElegido) {
    throw new Error("El plan seleccionado no existe.");
  }

  const referencia = doc(
    db,
    "usuarios",
    usuarioId,
    "preferencias",
    "plan"
  );

  await setDoc(referencia, {
    nombre: planElegido.nombre,
    precio: planElegido.precio,
    estado: "seleccionado_sin_contratar",
    fechaSeleccion: serverTimestamp()
  });

  return true;
}

// Recupera el plan seleccionado por el usuario.
export async function obtenerPlanSeleccionado(usuarioId) {

  if (auth.currentUser?.uid !== usuarioId) {
    throw new Error("Usuario no autorizado.");
  }

  const referencia = doc(
    db,
    "usuarios",
    usuarioId,
    "preferencias",
    "plan"
  );

  const resultado = await getDoc(referencia);

  if (!resultado.exists()) {
    return null;
  }

  return resultado.data();
}

export default app;
