'use client';

export const dynamic = 'force-dynamic';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProducts } from '../../../data/ProductContext';

const currency = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
  maximumFractionDigits: 2,
});

const buildWhatsappUrl = (product, phone = '+18095551234') => {
  const message = `Hola, me interesa el producto ${product.name} (${currency.format(product.price)}). ¿Podemos hablar?`;
  const normalizedPhone = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products } = useProducts();
  const id = params?.id;

  const product = useMemo(() => products.find((item) => String(item.id) === String(id)), [products, id]);

  if (!product) {
    return (
      <main className="app products-page">
        <section className="catalog-hero" style={{ textAlign: 'center' }}>
          <h1>Producto no encontrado</h1>
          <p style={{ color: 'var(--muted)' }}>
            El producto que buscas no está disponible. Regresa al catálogo para seguir explorando.
          </p>
          <a className="btn" href="/productos">Volver al catálogo</a>
        </section>
      </main>
    );
  }

  const whatsappUrl = buildWhatsappUrl(product);

  return (
    <main className="app products-page">
      <section className="catalog-hero" style={{ textAlign: 'left' }}>
        <button className="btn ghost" onClick={() => router.back()} style={{ marginBottom: 24 }}>
          ← Volver
        </button>
        <div style={{ display: 'grid', gap: 32, gridTemplateColumns: 'minmax(220px, 340px) 1fr' }}>
          <div className="product-media" style={{ borderRadius: 20, overflow: 'hidden' }}>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                className="product-media-fallback"
                style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                D,anderlin
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              <p className="product-category" style={{ marginBottom: 8 }}>{product.category}</p>
              <h1 style={{ marginTop: 0 }}>{product.name}</h1>
              <p className="product-description" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{product.description}</p>
            </div>
            <div>
              <h2 style={{ marginTop: 0 }}>Beneficios técnicos</h2>
              <ul className="product-features" style={{ fontSize: '1rem', gap: 10 }}>
                {(Array.isArray(product.features) ? product.features : []).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span className="product-price" style={{ fontSize: '1.6rem' }}>{currency.format(product.price)}</span>
              <a
                className="btn"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: '#25D366', color: '#001827' }}
              >
                Escribir al vendedor por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
