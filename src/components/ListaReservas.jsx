import { useState } from "react";

import {
  useReservas,
  useCancelarReserva,
} from "../hooks/useReservas";

import { NOMBRES_BANDOS } from "../constantes";

// Convertir fechas al formato español
function formatearFecha(fecha) {
  return new Date(
    `${fecha}T00:00`
  ).toLocaleDateString("es-ES");
}

export default function ListaReservas() {
  // Estado del filtro de fecha
  const [fecha, setFecha] = useState("");

  // Consulta de reservas
  const {
    data: reservas,
    isPending,
    isError,
    error,
    refetch,
  } = useReservas(fecha || undefined);

  // Mutación para cancelar reservas
  const mutacion = useCancelarReserva();

  // Confirmar antes de cancelar
  const confirmarCancelacion = (reserva) => {
    const confirmado = window.confirm(
      `¿Cancelar el despliegue de ${reserva.designacion}?`
    );

    if (confirmado) {
      mutacion.reset();
      mutacion.mutate(reserva.id);
    }
  };

  // Cabecera y filtro
  const cabecera = (
    <>
      <h2>Registro de agentes</h2>

      <label htmlFor="filtro-fecha">
        Filtrar despliegues por fecha
      </label>

      <input
        id="filtro-fecha"
        type="date"
        value={fecha}
        onChange={(e) => {
          setFecha(e.target.value);
          mutacion.reset();
        }}
      />

      {fecha && (
        <button
          type="button"
          onClick={() => {
            setFecha("");
            mutacion.reset();
          }}
        >
          Mostrar todas
        </button>
      )}
    </>
  );

  // Mensajes de la cancelación
  const estadoCancelacion = (
    <>
      {mutacion.isPending && (
        <p role="status">
          Procesando cancelación de despliegue…
        </p>
      )}

      {mutacion.isSuccess && (
        <p role="status">
          Despliegue cancelado correctamente.
        </p>
      )}

      {mutacion.isError && (
        <p role="alert">
          {mutacion.error.message}
        </p>
      )}
    </>
  );

  // Estado: cargando reservas
  if (isPending) {
    return (
      <section>
        {cabecera}

        <p role="status">
          Consultando registros…
        </p>

        {estadoCancelacion}
      </section>
    );
  }

  // Estado: error al obtener reservas
  if (isError) {
    return (
      <section>
        {cabecera}

        <p role="alert">
          {error.message}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
        >
          Reintentar
        </button>

        {estadoCancelacion}
      </section>
    );
  }

  // Estado: sin reservas
  if (reservas.length === 0) {
    return (
      <section>
        {cabecera}

        <p>
          {fecha
            ? `No hay agentes desplegados el ${formatearFecha(fecha)}`
            : "No hay agentes desplegados"}
        </p>

        {estadoCancelacion}
      </section>
    );
  }

  // Estado: reservas disponibles
  return (
    <section>
      {cabecera}

      <ul>
        {reservas.map((reserva) => {
          // Saber si estamos cancelando esta reserva
          const cancelando =
            mutacion.isPending &&
            mutacion.variables === reserva.id;

          return (
            <li key={reserva.id}>
              <h3>
                {reserva.designacion}
              </h3>

              <p>
                <strong>Fecha:</strong>{" "}
                {formatearFecha(reserva.fecha)}
              </p>

              <p>
                <strong>Bando:</strong>{" "}
                {NOMBRES_BANDOS[reserva.bando]}
              </p>

              <p>
                <strong>Equipo:</strong>{" "}
                {reserva.equipo.tipo === "alquiler"
                  ? `Alquiler - Talla ${reserva.equipo.talla}`
                  : `Propio - ${reserva.equipo.replica} (${reserva.equipo.fps} FPS)`}
              </p>

              <p>
                <strong>Acompañantes:</strong>{" "}
                {reserva.acompanantes.length}
              </p>

              <button
                type="button"
                disabled={cancelando}
                onClick={() =>
                  confirmarCancelacion(reserva)
                }
              >
                {cancelando
                  ? "Cancelando…"
                  : "Cancelar despliegue"}
              </button>
            </li>
          );
        })}
      </ul>

      {estadoCancelacion}
    </section>
  );
}