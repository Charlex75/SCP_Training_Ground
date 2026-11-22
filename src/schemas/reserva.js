import { z } from "zod";

import {
  BANDOS,
  LIMITES_FPS,
  TALLAS,
  EDAD_MINIMA,
  EDAD_CON_AUTORIZACION,
  MAX_ACOMPANANTES,
} from "../constantes";

// Identificación de agentes
const designacionSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]{3,16}$/, {
    error:
      "IDENTIFICACIÓN INVÁLIDA: usa entre 3 y 16 caracteres (letras, números, - o _)",
  });

// Protocolo de equipamiento
const equipoSchema = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("alquiler"),
    talla: z.enum(TALLAS, {
      error: "EQUIPAMIENTO NO DISPONIBLE: selecciona una talla válida",
    }),
  }),

  z.object({
    tipo: z.literal("propio"),
    replica: z.enum(Object.keys(LIMITES_FPS), {
      error: "RÉPLICA NO AUTORIZADA: categoría desconocida",
    }),
    fps: z.coerce.number({
      error: "LECTURA INVÁLIDA: introduce los FPS de la réplica",
    })
      .int({ error: "Los FPS deben ser un número entero" })
      .positive({ error: "Los FPS deben ser mayores que cero" }),
  }),
], {
  error: "PROTOCOLO DE EQUIPAMIENTO: selecciona un tipo de equipo válido",
});

// Esquema principal de reserva
export const esquemaReserva = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, {
        error: "IDENTIFICACIÓN INVÁLIDA: mínimo 2 caracteres",
      }),

    email: z.email({
      error: "COMUNICACIÓN FALLIDA: correo electrónico no válido",
    }),

    designacion: designacionSchema,

    edad: z.coerce.number({
      error: "REGISTRO INVÁLIDO: introduce una edad válida",
    })
      .int({ error: "REGISTRO INVÁLIDO: la edad debe ser entera" })
      .min(EDAD_CON_AUTORIZACION, {
        error: "ACCESO DENEGADO: edad inferior al mínimo permitido",
      }),

    autorizacionTutor: z.boolean({
      error: "PROTOCOLO DE MENORES: indica si dispones de autorización",
    }),

    fecha: z.iso.date({
      error: "FECHA INVÁLIDA: utiliza el formato AAAA-MM-DD",
    }),

    bando: z.enum(BANDOS, {
      error: "AFILIACIÓN DESCONOCIDA: selecciona un bando autorizado",
    }),

    equipo: equipoSchema,

    acompanantes: z
      .array(
        z.object({
          designacion: designacionSchema,
        })
      )
      .max(MAX_ACOMPANANTES, {
        error: `LÍMITE DE PERSONAL: máximo ${MAX_ACOMPANANTES} acompañantes`,
      }),

    proteccionOcular: z.literal(true, {
      error: "PROTOCOLO DE SEGURIDAD: protección ocular obligatoria",
    }),

    aceptaNormas: z.literal(true, {
      error: "ACCESO DENEGADO: debes aceptar las normas del recinto",
    }),
  })
  .superRefine((datos, ctx) => {

    // 1. Autorización de menores
    if (
      datos.edad >= EDAD_CON_AUTORIZACION &&
      datos.edad < EDAD_MINIMA &&
      !datos.autorizacionTutor
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "ACCESO DENEGADO: se requiere autorización del tutor para agentes menores de 18",
        path: ["autorizacionTutor"],
      });
    }

    // 2. Comprobación de FPS
    if (datos.equipo.tipo === "propio") {
      const limite = LIMITES_FPS[datos.equipo.replica];

      if (datos.equipo.fps > limite) {
        ctx.addIssue({
          code: "custom",
          message: `Réplica fuera de protocolo: máximo ${limite} FPS`,
          path: ["equipo", "fps"],
        });
      }
    }

    // 3. Validación de fecha
    const fechaReserva = new Date(
      datos.fecha + "T00:00:00"
    );

    // Si la fecha es inválida, no comprobamos el día
    if (!Number.isNaN(fechaReserva.getTime())) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaReserva < hoy) {
        ctx.addIssue({
          code: "custom",
          message:
            "ERROR TEMPORAL: no se permiten operaciones en fechas pasadas",
          path: ["fecha"],
        });
      }

      const diaSemana = fechaReserva.getDay();

      if (diaSemana !== 0 && diaSemana !== 6) {
        ctx.addIssue({
          code: "custom",
          message:
            "OPERACIÓN NO AUTORIZADA: las reservas solo se permiten en fin de semana",
          path: ["fecha"],
        });
      }
    }

    // 4. Designaciones duplicadas
    const designaciones = new Set([datos.designacion]);

    datos.acompanantes.forEach((acompanante, i) => {
      if (designaciones.has(acompanante.designacion)) {
        ctx.addIssue({
          code: "custom",
          message:
            "CONFLICTO DE IDENTIDAD: designación de agente duplicada",
          path: ["acompanantes", i, "designacion"],
        });
      }

      designaciones.add(acompanante.designacion);
    });
  });
