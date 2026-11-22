import { z } from "zod";
import { esquemaGuardada } from "../schemas/reservaGuardada";

const API_URL = import.meta.env.VITE_API_URL;

// Obtener reservas y validar los datos recibidos
export async function obtenerReservas(fecha) {
  const url = fecha
    ? `${API_URL}/reservas?fecha=${encodeURIComponent(fecha)}`
    : `${API_URL}/reservas`;

  let response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      "ENLACE CAÍDO: no hay conexión con el servidor del Sitio"
    );
  }

  if (!response.ok) {
    throw new Error(
      `ACCESO A ARCHIVOS FALLIDO: error ${response.status} al consultar las reservas`
    );
  }

  // Interpretar la respuesta del servidor
  let json;

  try {
    json = await response.json();
  } catch {
    throw new Error(
      "DATOS CORRUPTOS: respuesta ilegible del servidor del Sitio"
    );
  }

  // Validar cada reserva recibida
  const resultado = z.array(esquemaGuardada).safeParse(json);

  if (!resultado.success) {
    console.error(
      "Registros corruptos detectados:",
      resultado.error.issues
    );

    throw new Error(
      "DATOS CORRUPTOS: el archivo de reservas contiene registros inválidos"
    );
  }

  // Devolver únicamente datos validados
  return resultado.data;
}


// Crear una nueva reserva
export async function crearReserva(datos) {
  let response;

  try {
    response = await fetch(`${API_URL}/reservas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });
  } catch {
    throw new Error(
      "ENLACE CAÍDO: no hay conexión con el servidor del Sitio"
    );
  }

  if (!response.ok) {
    throw new Error(
      `DESPLIEGUE RECHAZADO: error ${response.status} al registrar la reserva`
    );
  }

  return response.json();
}

// Cancelar una reserva existente
export async function cancelarReserva(id) {
  let response;

  try {
    response = await fetch(
      `${API_URL}/reservas/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    );
  } catch {
    throw new Error(
      "ENLACE CAÍDO: no hay conexión con el servidor del Sitio"
    );
  }

  if (!response.ok) {
    throw new Error(
      `CANCELACIÓN DENEGADA: error ${response.status} al cancelar el despliegue`
    );
  }

  return id;
}
