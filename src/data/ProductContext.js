'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const ProductContext = createContext(null);

const normalizeFeatures = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const mapInput = (payload) => ({
  name: payload.name,
  description: payload.description ?? '',
  category: payload.category ?? '',
  price: Number.isFinite(Number(payload.price)) ? Number(payload.price) : 0,
  image: payload.image ?? '',
  features: normalizeFeatures(payload.features),
});

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/products', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Error cargando productos');
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchProducts error', err);
      setError('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (payload) => {
    const body = mapInput(payload);
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.error ?? 'No se pudo crear el producto');
    }

    const created = await response.json();
    setProducts((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    const body = mapInput({ ...updates });
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.error ?? 'No se pudo actualizar el producto');
    }

    const updated = await response.json();
    setProducts((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const deleteProduct = useCallback(async (id) => {
    const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });

    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.error ?? 'No se pudo eliminar el producto');
    }

    setProducts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({ products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct }),
    [products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts debe usarse dentro de un ProductProvider');
  }
  return context;
}
