import FormularioReserva from "./components/FormularioReserva";
import ListaReservas from "./components/ListaReservas";

function App() {
  return (
    <main>
      <header className="cabecera">
        <p className="clasificacion">Nivel de autorización 2 · Sitio de entrenamiento</p>
        <h1>SCP Training Ground</h1>
        <p className="lema">Asegurar. Contener. Proteger.</p>
      </header>

      <div className="contenedor-reservas">
        <section className="panel">
          <h2>Solicitud de despliegue</h2>
          <FormularioReserva />
        </section>

        <ListaReservas />
      </div>
    </main>
  );
}

export default App;
