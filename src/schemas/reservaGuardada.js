import { z } from "zod";

import { esquemaReservaBase } from "./reserva";

// Una reserva guardada incluye todos los campos
// del esquema base más su identificador
export const esquemaGuardada = esquemaReservaBase.extend({
  id: z.string({
    error: "REGISTRO INVÁLIDO: identificador de reserva incorrecto",
  }),
});
