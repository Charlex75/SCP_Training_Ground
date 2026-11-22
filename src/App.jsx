import FormularioReserva from "./components/FormularioReserva";
import ListaReservas from "./components/ListaReservas";

function App() {
  return (
    <main>
      <h1>SCP Training Ground</h1>

      <div className="contenedor-reservas">
        <section>
          <h2>Solicitud de despliegue</h2>
          <FormularioReserva />
        </section>

        <ListaReservas />
      </div>
    </main>
  );
}

export default App;
