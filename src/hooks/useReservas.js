import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { obtenerReservas, crearReserva, cancelarReserva } from "../services/reservas";

export const CLAVE_RESERVAS = ["reservas"];

// Consultar todas las reservas o filtrar por fecha
export function useReservas(fecha) {
  return useQuery({
    queryKey: [...CLAVE_RESERVAS, fecha ?? "todas"],
    queryFn: () => obtenerReservas(fecha),
  });
}

// Crear una reserva
export function useCrearReserva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crearReserva,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLAVE_RESERVAS }),
  });
}

// Cancelar una reserva
export function useCancelarReserva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelarReserva,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLAVE_RESERVAS }),
  });
}
