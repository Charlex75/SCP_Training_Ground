import { useReservas } from "../hooks/useReservas";
import { calcularOcupacion } from "../utils/plazas";
import { BANDOS, NOMBRES_BANDOS, PLAZAS_POR_BANDO } from "../constantes";

export default function Ocupacion({ fecha }) {
  const { data: reservas = [], isPending, isError, error } = useReservas();

  if (!fecha) {
    return <p role="status">Selecciona una fecha para consultar las plazas.</p>;
  }

  if (isPending) {
    return <p role="status">Consultando plazas…</p>;
  }

  if (isError) {
    return <p role="alert">{error.message}</p>;
  }

  const ocupacion = calcularOcupacion(reservas, fecha);

  return (
    <section aria-label="Ocupación por bando">
      <h3>Plazas del despliegue</h3>

      <p>
        {BANDOS.map((bando, i) => (
          <span key={bando}>
            {i > 0 && " · "}
            {NOMBRES_BANDOS[bando]}: {ocupacion[bando]}/{PLAZAS_POR_BANDO}
          </span>
        ))}
      </p>
    </section>
  );
}
