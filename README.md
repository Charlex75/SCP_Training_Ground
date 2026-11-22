# SCP Training Ground

Misión M4 · Full Contact Forms — Web Development I.

Sistema de reservas para partidas de airsoft ambientado en el universo SCP. Cada jugador es un agente que solicita un «despliegue»: elige fecha, bando (Fundación SCP o Insurgencia del Caos), equipo propio o de alquiler y hasta cinco acompañantes. Las reservas se guardan en una API y se muestran en un registro de agentes.

La idea mezcla dos cosas que tenía muy presentes: el airsoft, porque tenía una partida en pocos días y me había tocado organizar algo parecido para mi cumpleaños, y el universo SCP, del que últimamente veía mucho contenido.

## Cómo probarlo

Hacen falta **dos terminales**:

```bash
npm install
npm run api
```

```bash
npm run dev
```

`npm run api` arranca json-server con `db.json` en el puerto 3001. La URL de la API se lee de la variable de entorno `VITE_API_URL`, definida en `.env`.

## Qué hace

- **Formulario de despliegue** con React Hook Form y Zod:
  - mensajes de error propios en tono SCP;
  - campos que aparecen según las respuestas: la autorización del tutor solo con 16 o 17 años, y la talla o la réplica y sus FPS según el tipo de equipo;
  - acompañantes dinámicos con `useFieldArray`.
- **Reglas de validación**:
  - edad mínima de 16 años, con autorización del tutor por debajo de 18;
  - FPS máximos según el tipo de réplica;
  - solo fines de semana y nunca fechas pasadas;
  - designaciones de agente sin repetir.
- **Plazas libres por bando** para la fecha elegida, calculadas a partir de las reservas. Si el bando está lleno, la reserva no se envía.
- **Registro de agentes**, con filtro por fecha y cancelación de reservas, que pide confirmación antes de cancelar.
- **Estados de carga, error y éxito** en todas las peticiones, anunciados con `role="status"` y `role="alert"`.
- **Bonus**: la respuesta de la API se valida con `safeParse`. Para comprobarlo:
  1. con `npm run api` parado, escribe a mano en `db.json` una reserva con `"fps": "muchos"`;
  2. arranca de nuevo y verás «DATOS CORRUPTOS» en el registro, con el detalle del error en la consola.

## Estructura

```
src/
├── main.jsx               → QueryClientProvider y DevTools de TanStack Query
├── App.jsx
├── constantes.js          → bandos, tallas, límites de FPS, plazas…
├── schemas/
│   ├── reserva.js         → esquema base y esquema del formulario (superRefine)
│   └── reservaGuardada.js → esquema base + id, para validar la respuesta de la API
├── services/reservas.js   → todos los fetch (GET, POST, DELETE)
├── hooks/useReservas.js   → useQuery y useMutation con la clave ["reservas"]
├── utils/plazas.js        → cálculo de la ocupación por bando
└── components/            → FormularioReserva, ListaReservas, Ocupacion, Campo, MensajeError
```

## Uso de IA

He usado **Claude Code** como asesor durante toda la misión, con el mismo método que en las anteriores: yo montaba el proyecto, Claude me daba instrucciones detalladas por fases, yo escribía el código y Claude lo revisaba. Al empezar se lo pedí así:

> «Mismo procedimiento?»

refiriéndome al de las misiones anteriores.

**La idea es mía.** Propuse las reservas de airsoft y la temática SCP («Hay que pensar en un nombre primero... SCP_Training_Ground? Me ha dado por ver de SCP últimamente»). Claude sugirió cómo encajar la temática en el formulario: los bandos Fundación e Insurgencia, la reserva como «solicitud de despliegue» y los mensajes de error en tono de expediente.

**Qué hizo Claude directamente:**

- **El CSS entero** (`index.css`). Para poder maquetarlo añadió algunas clases a los componentes y la cabecera de `App.jsx`. Se lo pedí porque el CSS me parece la parte más tediosa: «el CSS y el README, la misma historia de siempre».
- **Este README**, a partir de lo que ocurrió en el proceso.
- **Arreglos de estructura y formato**:
  - movió el proyecto, que había quedado en una carpeta duplicada dentro del repo;
  - corrigió la sangría y unió líneas que yo había partido demasiado, sin tocar la lógica.

**Qué me propuso y yo implementé**, siguiendo sus instrucciones:

- usar json-server, porque PokéAPI y JSONPlaceholder no guardan los datos y la invalidación no se notaría;
- el esquema con `discriminatedUnion` para el equipo y `superRefine` para las reglas cruzadas;
- la capa de servicios y los hooks con una clave de query compartida;
- la ocupación por bando, el filtro por fecha y la cancelación como detalles extra;
- separar el esquema base para reutilizarlo al validar la respuesta.

**Qué escribí yo**: el esquema de Zod, el formulario con React Hook Form y sus componentes, los servicios, los hooks, la lista, la ocupación y la validación de la respuesta.

**Cómo usé las revisiones:**

- En cada fase Claude me señalaba los fallos en lugar de arreglarlos. El más serio:
  - usaba `shouldUnregister: true`, y con eso un adulto no podía enviar el formulario ni veía ningún error;
  - la causa era la casilla de autorización oculta: al no estar en pantalla llegaba como `undefined` y además impedía que se ejecutara el `superRefine`.
- También me señaló errores que se mostraban dos veces, un mensaje que salía en inglés y que el foco no iba al error de aforo.

**Verificación:**

- Probé cada fase en el navegador con las dos terminales.
- Claude además:
  - comprobó el esquema con una batería de casos válidos e inválidos;
  - probó el flujo completo en un navegador con una copia aparte de la base de datos: envío, invalidación, aforo lleno, filtro, cancelación, API caída y registro corrupto;
  - pasó `npm run lint` y `npm run build`.

## Autopsia

1. **La idea: reservas de airsoft con temática SCP.** Elegir de qué va el formulario es lo que más cuesta, porque la misión es abierta y de esa decisión dependen tanto la originalidad como las reglas de validación que se pueden plantear. Partí de algo real: iba a jugar una partida de airsoft y, por mi cumpleaños, me había tocado organizar algo parecido, así que conocía qué datos hacen falta (edad, equipo, bando…). Le sumé la temática SCP, de la que veía mucho contenido, porque encajaba de forma natural: bandos enfrentados, agentes con designación y protocolos de seguridad. Descarté un formulario de reservas genérico, como un restaurante o un escape room, porque habría tenido menos reglas interesantes y menos personalidad. El riesgo es que la temática despiste del objetivo de la misión, así que la limité a la ambientación y a los mensajes, sin cambiar cómo funciona el formulario.

2. **El control de aforo se hace solo en el cliente.** Antes de enviar, calculo las plazas libres a partir de las reservas que ya tengo en caché y, si el bando está lleno, marco el error con `setError`. Descarté validarlo en el servidor porque json-server no permite reglas propias. El coste es que no es seguro: si dos personas reservan a la vez la última plaza, el servidor acepta las dos. Como dice la teoría, la validación del cliente es experiencia de usuario, no seguridad. Con un backend propio, el aforo tendría que comprobarse allí.

3. **Si un registro de la API está corrupto, falla el listado entero.** Valido la respuesta completa con `z.array(esquemaGuardada).safeParse()` y, si algo no cumple el esquema, muestro «DATOS CORRUPTOS» en lugar de las reservas. Descarté filtrar los registros rotos y pintar el resto, porque prefiero que un dato corrupto se note en lugar de desaparecer sin avisar. El coste es que un solo registro roto oculta todos los buenos. Además, TanStack Query reintenta la petición tres veces antes de mostrar el error, aunque reintentar no arregla un dato corrupto. Se podría evitar con la opción `retry`.

## Créditos

- Ambientación basada en la [SCP Foundation](https://scp-wiki.wikidot.com/), contenido publicado bajo licencia [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
