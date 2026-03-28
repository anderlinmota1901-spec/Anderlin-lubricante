'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '../../data/ProductContext';

const currency = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
  maximumFractionDigits: 2,
});

export default function ProductsPage() {
  const router = useRouter();
  const { products } = useProducts();
  const categories = useMemo(
    () => ['Todos', ...new Set(products.map((item) => item.category).filter(Boolean))],
    [products]
  );
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const inCategory =
        activeCategory === 'Todos' || product.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesQuery =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        (Array.isArray(product.features) ? product.features : []).some((feature) =>
          feature.toLowerCase().includes(term)
        );
      return inCategory && matchesQuery;
    });
  }, [products, activeCategory, query]);

  return (
    <main className="app products-page">
      <section id="catalogo" className="catalog-hero">
        <p className="eyebrow">Catálogo especializado</p>
        <h1>Productos técnicos D,anderlin</h1>
        <p>
          Lubricantes, fluidos y consumibles diseñados para prolongar la vida útil de motores, transmisiones y
          sistemas de frenos. Selecciona tu categoría o filtra por aplicación.
        </p>
        <div className="catalog-filters">
          <label className="search-field">
            <span>Buscar producto</span>
            <input
              type="search"
              placeholder="Filtrar por nombre, especificación o beneficio"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="category-pills" role="tablist" aria-label="Categorías de productos">
            {categories.map((category) => {
              const isActive = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`pill ${isActive ? 'pill-active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <section className="catalog-results">
        <div className="catalog-grid">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <h2>Sin resultados</h2>
              <p>
                Ajusta tu búsqueda o revisa otra categoría. Nuestro equipo comercial puede ayudarte a encontrar la
                formulación adecuada.
              </p>
              <a className="btn" href="/#contacto">Hablar con un asesor</a>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <article
                key={product.id}
                className="product-card"
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/productos/${product.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    router.push(`/productos/${product.id}`);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-media" aria-hidden="true">
                  {product.image ? (
                    <img src={product.image} alt="" loading="lazy" />
                  ) : (
                    <div className="product-media-fallback">D,anderlin</div>
                  )}
                </div>
                <div className="product-header">
                  <p className="product-category">{product.category}</p>
                  <h2>{product.name}</h2>
                  <p className="product-description">{product.description}</p>
                </div>
                <ul className="product-features">
                  {(Array.isArray(product.features) ? product.features : []).map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <div className="product-footer">
                  <span className="product-price">{currency.format(product.price)}</span>
                  <a
                    className="btn ghost"
                    href="/#contacto"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Solicitar ficha técnica
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
