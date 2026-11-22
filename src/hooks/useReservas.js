import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  obtenerReservas,
  crearReserva,
} from "../services/reservas";

// Clave compartida para la caché
export const CLAVE_RESERVAS = ["reservas"];

// Consultar reservas
export function useReservas() {
  return useQuery({
    queryKey: CLAVE_RESERVAS,
    queryFn: obtenerReservas,
  });
}

// Crear una reserva
export function useCrearReserva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crearReserva,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLAVE_RESERVAS,
      });
    },
  });
}
