
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

// CONFIGURACIÓN DE LOS PLANES

export const PLANES = {
  Basico: {
    nombre: "Básica",
    precio: "0,99 €",
    periodicidad: "pago_unico",
    almacenamientoMB: 250,
    miembros: 1
  },

  Premium: {
    nombre: "Premium",
    precio: "3,99 €",
    periodicidad: "mensual",
    almacenamientoMB: 2048,
    miembros: 1
  },

  Familiar: {
    nombre: "Familiar",
    precio: "5,99 €",
    periodicidad: "mensual",
    almacenamientoMB: 5120,
    miembros: 5
  }
};

// FUNCIONES DISPONIBLES POR PLAN

export const PERMISOS_PLAN = {
  Basico: {
    tareas: true,
    calendario: true,
    recordatorios: true,
    finanzas: true,
    compras: true,
    notas: true,
    documentos: true,
    copiasManuales: true,
    estadisticasAvanzadas: false,
    presupuestosMensuales: false,
    objetivosAhorro: false,
    tareasRecurrentesAvanzadas: false,
    recordatoriosAvanzados: false,
    personalizacion: false,
    copiasAutomaticas: false,
    organizacionAvanzada: false,
    espacioFamiliar: false,
    invitaciones: false,
    datosCompartidos: false
  },

  Premium: {
    tareas: true,
    calendario: true,
    recordatorios: true,
    finanzas: true,
    compras: true,
    notas: true,
    documentos: true,
    copiasManuales: true,
    estadisticasAvanzadas: true,
    presupuestosMensuales: true,
    objetivosAhorro: true,
    tareasRecurrentesAvanzadas: true,
    recordatoriosAvanzados: true,
    personalizacion: true,
    copiasAutomaticas: true,
    organizacionAvanzada: true,
    espacioFamiliar: false,
    invitaciones: false,
    datosCompartidos: false
  },

  Familiar: {
    tareas: true,
    calendario: true,
    recordatorios: true,
    finanzas: true,
    compras: true,
    notas: true,
    documentos: true,
    copiasManuales: true,
    estadisticasAvanzadas: true,
    presupuestosMensuales: true,
    objetivosAhorro: true,
    tareasRecurrentesAvanzadas: true,
    recordatoriosAvanzados: true,
    personalizacion: true,
    copiasAutomaticas: true,
    organizacionAvanzada: true,
    espacioFamiliar: true,
    invitaciones: true,
    datosCompartidos: true
  }
};

// COMPROBAR USUARIO

function comprobarUsuario(usuarioId) {
  if (!auth.currentUser || auth.currentUser.uid !== usuarioId) {
    throw new Error("Usuario no autorizado.");
  }
}

// GUARDAR DATOS

export async function guardarDato(usuarioId, apartado, datos) {
  comprobarUsuario(usuarioId);

  const referencia = collection(db, "usuarios", usuarioId, apartado);

  return await addDoc(referencia, {
    ...datos,
    fechaCreacion: serverTimestamp()
  });
}

// OBTENER DATOS

export async function obtenerDatos(usuarioId, apartado) {
  comprobarUsuario(usuarioId);

  const referencia = collection(db, "usuarios", usuarioId, apartado);

  const consulta = query(
    referencia,
    orderBy("fechaCreacion", "desc")
  );

  const resultado = await getDocs(consulta);

  return resultado.docs.map(documento => ({
    id: documento.id,
    ...documento.data()
  }));
}

// ELIMINAR DATOS

export async function eliminarDato(usuarioId, apartado, datoId) {
  comprobarUsuario(usuarioId);

  const referencia = doc(
    db, "usuarios", usuarioId, apartado, datoId
  );

  return await deleteDoc(referencia);
}

// GUARDAR PLAN SELECCIONADO

export async function guardarPlanSeleccionado(usuarioId, plan) {
  comprobarUsuario(usuarioId);

  const planElegido = PLANES[plan];

  if (!planElegido) {
    throw new Error("El plan seleccionado no existe.");
  }

  const referencia = doc(
    db, "usuarios", usuarioId, "preferencias", "plan"
  );

  await setDoc(referencia, {
    clave: plan,
    nombre: planElegido.nombre,
    precio: planElegido.precio,
    periodicidad: planElegido.periodicidad,
    estado: "seleccionado_sin_contratar",
    fechaSeleccion: serverTimestamp()
  });

  return true;
}

// RECUPERAR PLAN SELECCIONADO

export async function obtenerPlanSeleccionado(usuarioId) {
  comprobarUsuario(usuarioId);

  const referencia = doc(
    db, "usuarios", usuarioId, "preferencias", "plan"
  );

  const resultado = await getDoc(referencia);

  if (!resultado.exists()) {
    return null;
  }

  return resultado.data();
}

// RECUPERAR PLAN REALMENTE ACTIVO

export async function obtenerPlanActivo(usuarioId) {
  comprobarUsuario(usuarioId);

  // La ruta correcta es "suscripcion", en singular.
  const referencia = doc(
    db, "usuarios", usuarioId, "suscripcion", "actual"
  );

  const resultado = await getDoc(referencia);

  if (!resultado.exists()) {
    return {
      clave: "Basico",
      nombre: "Básica",
      estado: "activo",
      origen: "plan_predeterminado"
    };
  }

  const suscripcion = resultado.data();

  const planesValidos = ["Basico", "Premium", "Familiar"];

  if (
    suscripcion.estado === "activo" &&
    planesValidos.includes(suscripcion.clave) &&
    suscripcion.verificadoPorServidor === true
  ) {
    return suscripcion;
  }

  return {
    clave: "Basico",
    nombre: "Básica",
    estado: "activo",
    origen: "plan_predeterminado"
  };
}

// COMPROBAR PERMISOS

export async function comprobarPermiso(usuarioId, permiso) {
  const planActivo = await obtenerPlanActivo(usuarioId);
  const permisos = PERMISOS_PLAN[planActivo.clave];

  if (!permisos || typeof permisos[permiso] !== "boolean") {
    return false;
  }

  return permisos[permiso];
}

// OBTENER TODOS LOS PERMISOS

export async function obtenerPermisosUsuario(usuarioId) {
  const planActivo = await obtenerPlanActivo(usuarioId);

  return {
    plan: planActivo.clave,
    nombre: planActivo.nombre,
    permisos: {
      ...PERMISOS_PLAN[planActivo.clave]
    },
    almacenamientoMB:
      PLANES[planActivo.clave].almacenamientoMB,
    miembros:
      PLANES[planActivo.clave].miembros
  };
}

// COMPROBAR SI TIENE PREMIUM

export async function tienePremium(usuarioId) {
  const planActivo = await obtenerPlanActivo(usuarioId);

  return (
    planActivo.clave === "Premium" ||
    planActivo.clave === "Familiar"
  );
}

// COMPROBAR SI TIENE PLAN FAMILIAR

export async function tienePlanFamiliar(usuarioId) {
  const planActivo = await obtenerPlanActivo(usuarioId);

  return planActivo.clave === "Familiar";
}

// EXPORTAR APLICACIÓN

export default app;
