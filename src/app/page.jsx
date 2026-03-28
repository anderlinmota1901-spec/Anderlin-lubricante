import Link from 'next/link';
import { heroHighlights, servicePillars } from '../data/products';

export default function HomePage() {
  return (
    <main className="app">
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Calidad profesional para motores exigentes</p>
            <h1>D,anderlin Lubricante</h1>
            <p>
              Suministramos lubricantes y fluidos automotrices de alto desempeño para talleres, flotas y
              distribuidores en toda Latinoamérica. Protege cada pieza con formulaciones certificadas.
            </p>
            <div className="cta-row">
              <Link className="btn" href="/#catalogo">Explorar catálogo</Link>
              <Link className="btn ghost" href="/#contacto">Solicitar cotización</Link>
            </div>
          </div>
          <figure className="hero-visual">
            <img src="/assets/anderlin-hero.jpg" alt="Botella de lubricante Anderlin con vehículos de alto rendimiento" />
          </figure>
        </div>
        <dl className="feature-grid">
          {heroHighlights.map((item) => (
            <div key={item.id} className="feature-card">
              <dt>{item.title}</dt>
              <dd>{item.description}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section id="servicios" className="services">
        <h2>Nuestros pilares de servicio</h2>
        <p className="section-intro">
          Un ecosistema diseñado para que la operación de nuestros clientes nunca se detenga.
        </p>
        <div className="services-grid">
          {servicePillars.map((pillar) => (
            <article key={pillar.id} className="service-card">
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="contacto" className="contact">
        <div className="contact-shell">
          <div>
            <h2>Conversemos sobre tu operación</h2>
            <p>
              Te apoyamos para definir la mezcla ideal de lubricantes, refrigerantes y fluidos para tus
              vehículos y maquinaria crítica.
            </p>
          </div>
          <form className="contact-form">
            <label>
              Nombre y apellido
              <input type="text" placeholder="Ingresa tu nombre" required />
            </label>
            <label>
              Empresa o taller
              <input type="text" placeholder="Nombre de tu empresa" required />
            </label>
            <label>
              Correo electrónico
              <input type="email" placeholder="nombre@empresa.com" required />
            </label>
            <label>
              Mensaje
              <textarea rows="3" placeholder="Cuéntanos qué necesitas" required />
            </label>
            <button className="btn" type="submit">Enviar consulta</button>
          </form>
        </div>
      </section>
      <footer>
        <small>D,anderlin Lubricante · Logística 24h · laboratorio certificado</small>
      </footer>
    </main>
  );
}
