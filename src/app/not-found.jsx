export default function NotFound() {
  return (
    <main className="app">
      <section className="hero" style={{ textAlign: 'center' }}>
        <h1>Página no encontrada</h1>
        <p style={{ color: 'var(--muted)' }}>
          El recurso que buscas no existe o fue movido. Regresa al catálogo para seguir explorando.
        </p>
        <a className="btn" href="/productos">Volver al catálogo</a>
      </section>
    </main>
  );
}
