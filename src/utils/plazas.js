export function calcularOcupacion(reservas, fecha) {
  return reservas
    .filter((reserva) => reserva.fecha === fecha)
    .reduce(
      (ocupacion, reserva) => {
        const plazasOcupadas = 1 + reserva.acompanantes.length;

        if (Object.hasOwn(ocupacion, reserva.bando)) {
          ocupacion[reserva.bando] += plazasOcupadas;
        }

        return ocupacion;
      },
      { fundacion: 0, insurgencia: 0 }
    );
}
