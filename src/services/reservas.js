const API_URL = import.meta.env.VITE_API_URL;

// Obtener reservas, opcionalmente filtradas por fecha
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

  return response.json();
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
