const API_URL = import.meta.env.VITE_API_URL;

// Obtener todas las reservas
export async function obtenerReservas() {
  let response;

  try {
    response = await fetch(`${API_URL}/reservas`);
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
