import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { esquemaReserva } from "../schemas/reserva";
import {
  BANDOS,
  NOMBRES_BANDOS,
  TALLAS,
  LIMITES_FPS,
  EDAD_CON_AUTORIZACION,
  EDAD_MINIMA,
  MAX_ACOMPANANTES,
} from "../constantes";

import Campo from "./Campo";
import MensajeError from "./MensajeError";

import { useCrearReserva } from "../hooks/useReservas";

export default function FormularioReserva() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquemaReserva),

    defaultValues: {
      nombre: "",
      email: "",
      designacion: "",
      edad: "",
      autorizacionTutor: false,
      fecha: "",
      bando: "fundacion",
      equipo: {
        tipo: "alquiler",
        talla: "",
        replica: "",
        fps: "",
      },
      acompanantes: [],
      proteccionOcular: false,
      aceptaNormas: false,
    },
  });

  const mutacion = useCrearReserva();

  // Lista dinámica de acompañantes
  const { fields, append, remove } = useFieldArray({
    control,
    name: "acompanantes",
  });

  // Campos que determinan qué mostrar
  const tipoEquipo = useWatch({control, name: "equipo.tipo"});
  const edad = useWatch({control, name: "edad"});

  const necesitaAutorizacion =
    edad !== "" &&
    Number(edad) >= EDAD_CON_AUTORIZACION &&
    Number(edad) < EDAD_MINIMA;

  // De momento, solo mostramos los datos
  const onSubmit = (datos) => {
    mutacion.mutate(datos, {
      onSuccess: () => reset(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>

      <fieldset>
        <legend>Identificación del agente</legend>

        <Campo
          id="nombre"
          etiqueta="Nombre completo"
          autoComplete="name"
          registro={register("nombre")}
          error={errors.nombre}
        />

        <Campo
          id="email"
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          registro={register("email")}
          error={errors.email}
        />

        <Campo
          id="designacion"
          etiqueta="Designación de agente"
          registro={register("designacion")}
          error={errors.designacion}
        />

        <Campo
          id="edad"
          etiqueta="Edad"
          type="number"
          min={EDAD_CON_AUTORIZACION}
          registro={register("edad")}
          error={errors.edad}
        />

        {necesitaAutorizacion && (
          <div>
            <label htmlFor="autorizacionTutor">
              <input
                id="autorizacionTutor"
                type="checkbox"
                {...register("autorizacionTutor")}
                aria-invalid={!!errors.autorizacionTutor}
                aria-describedby={
                  errors.autorizacionTutor
                    ? "autorizacionTutor-error"
                    : undefined
                }
              />
              Dispongo de autorización de mi tutor
            </label>

            <MensajeError
              id="autorizacionTutor-error"
              error={errors.autorizacionTutor}
            />
          </div>
        )}

        <Campo
          id="fecha"
          etiqueta="Fecha del despliegue"
          type="date"
          registro={register("fecha")}
          error={errors.fecha}
        />
      </fieldset>

      <fieldset
        aria-invalid={!!errors.bando}
        aria-describedby={
          errors.bando ? "bando-error" : undefined
        }
      >
        <legend>Asignación de bando</legend>

        {BANDOS.map((bando) => (
          <label key={bando}>
            <input
              type="radio"
              value={bando}
              {...register("bando")}
            />
            {NOMBRES_BANDOS[bando]}
          </label>
        ))}

        <MensajeError
          id="bando-error"
          error={errors.bando}
        />
      </fieldset>

      <fieldset>
        <legend>Protocolo de equipamiento</legend>

        <fieldset
          aria-invalid={!!errors.equipo?.tipo}
          aria-describedby={
            errors.equipo?.tipo
              ? "equipo-tipo-error"
              : undefined
          }
        >
          <legend>Tipo de equipo</legend>

          <label>
            <input
              type="radio"
              value="alquiler"
              {...register("equipo.tipo")}
            />
            Equipo de alquiler
          </label>

          <label>
            <input
              type="radio"
              value="propio"
              {...register("equipo.tipo")}
            />
            Equipo propio
          </label>

          <MensajeError
            id="equipo-tipo-error"
            error={errors.equipo?.tipo}
          />
        </fieldset>

        {tipoEquipo === "alquiler" && (
          <div>
            <label htmlFor="talla">Talla del equipo</label>

            <select
              id="talla"
              {...register("equipo.talla")}
              aria-invalid={!!errors.equipo?.talla}
              aria-describedby={
                errors.equipo?.talla
                  ? "talla-error"
                  : undefined
              }
            >
              <option value="">Selecciona una talla</option>

              {TALLAS.map((talla) => (
                <option key={talla} value={talla}>
                  {talla}
                </option>
              ))}
            </select>

            <MensajeError
              id="talla-error"
              error={errors.equipo?.talla}
            />
          </div>
        )}

        {tipoEquipo === "propio" && (
          <>
            <div>
              <label htmlFor="replica">
                Categoría de réplica
              </label>

              <select
                id="replica"
                {...register("equipo.replica")}
                aria-invalid={!!errors.equipo?.replica}
                aria-describedby={
                  errors.equipo?.replica
                    ? "replica-error"
                    : undefined
                }
              >
                <option value="">Selecciona una réplica</option>

                {Object.keys(LIMITES_FPS).map((replica) => (
                  <option key={replica} value={replica}>
                    {replica}
                  </option>
                ))}
              </select>

              <MensajeError
                id="replica-error"
                error={errors.equipo?.replica}
              />
            </div>

            <Campo
              id="fps"
              etiqueta="Potencia de la réplica (FPS)"
              type="number"
              min="1"
              registro={register("equipo.fps")}
              error={errors.equipo?.fps}
            />
          </>
        )}
      </fieldset>

      <fieldset>
        <legend>Personal acompañante</legend>

        {fields.map((field, i) => (
          <div key={field.id}>
            <Campo
              id={`acompanante-${i}`}
              etiqueta={`Designación del agente ${i + 1}`}
              registro={register(
                `acompanantes.${i}.designacion`
              )}
              error={
                errors.acompanantes?.[i]?.designacion
              }
            />

            <button
              type="button"
              onClick={() => remove(i)}
            >
              Quitar agente
            </button>
          </div>
        ))}

        <MensajeError
          id="acompanantes-error"
          error={errors.acompanantes?.root}
        />

        <button
          type="button"
          onClick={() => append({ designacion: "" })}
          disabled={fields.length >= MAX_ACOMPANANTES}
        >
          Añadir agente
        </button>
      </fieldset>

      <fieldset>
        <legend>Protocolos de seguridad</legend>

        <div>
          <label htmlFor="proteccionOcular">
            <input
              id="proteccionOcular"
              type="checkbox"
              {...register("proteccionOcular")}
              aria-invalid={!!errors.proteccionOcular}
              aria-describedby={
                errors.proteccionOcular
                  ? "proteccionOcular-error"
                  : undefined
              }
            />
            Confirmo el uso de protección ocular
          </label>

          <MensajeError
            id="proteccionOcular-error"
            error={errors.proteccionOcular}
          />
        </div>

        <div>
          <label htmlFor="aceptaNormas">
            <input
              id="aceptaNormas"
              type="checkbox"
              {...register("aceptaNormas")}
              aria-invalid={!!errors.aceptaNormas}
              aria-describedby={
                errors.aceptaNormas
                  ? "aceptaNormas-error"
                  : undefined
              }
            />
            Acepto las normas del recinto
          </label>

          <MensajeError
            id="aceptaNormas-error"
            error={errors.aceptaNormas}
          />
        </div>
      </fieldset>


      <button type="submit" disabled={mutacion.isPending}>
        {mutacion.isPending ? "Procesando…" : "Solicitar despliegue"}
      </button>

      {mutacion.isSuccess && (
        <p role="status">
          Despliegue autorizado. Preséntese en el Sitio a las 09:00
        </p>
      )}

      {mutacion.isError && (
        <p role="alert">
          {mutacion.error.message}
        </p>
      )}

    </form>
  );
}