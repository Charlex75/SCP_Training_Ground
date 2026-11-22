import { useReservas } from "../hooks/useReservas";
import { NOMBRES_BANDOS } from "../constantes";

export default function ListaReservas() {
  const {
    data: reservas,
    isPending,
    isError,
    error,
    refetch,
  } = useReservas();

  // Estado: cargando
  if (isPending) {
    return (
      <section>
        <h2>Registro de agentes</h2>
        <p role="status">Consultando registros…</p>
      </section>
    );
  }

  // Estado: error
  if (isError) {
    return (
      <section>
        <h2>Registro de agentes</h2>

        <p role="alert">{error.message}</p>

        <button type="button" onClick={() => refetch()}>
          Reintentar
        </button>
      </section>
    );
  }

  // Estado: sin reservas
  if (reservas.length === 0) {
    return (
      <section>
        <h2>Registro de agentes</h2>
        <p>No hay agentes desplegados</p>
      </section>
    );
  }

  // Estado: reservas disponibles
  return (
    <section>
      <h2>Registro de agentes</h2>

      <ul>
        {reservas.map((reserva) => (
          <li key={reserva.id}>
            <h3>{reserva.designacion}</h3>

            <p>
              <strong>Fecha:</strong> {reserva.fecha}
            </p>

            <p>
              <strong>Bando:</strong> {NOMBRES_BANDOS[reserva.bando]}
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
          </li>
        ))}
      </ul>
    </section>
  );
}
