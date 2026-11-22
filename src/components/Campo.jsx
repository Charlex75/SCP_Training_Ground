import MensajeError from "./MensajeError";

export default function Campo({ id, etiqueta, error, registro, ...resto }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>

      <input
        id={id}
        {...registro}
        {...resto}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />

      <MensajeError id={`${id}-error`} error={error} />
    </div>
  );
}
