'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../auth/AuthContext';

import logo from '../assets/logo.jpeg';

export default function NavBar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="nav-shell">
      <Link className="brand" href="/">
        <Image
          className="brand-logo"
          src={logo}
          alt="Logo D,anderlin Lubricante"
          width={100}
          height={100}
          priority
        />
        <span className="brand-text">
          D,anderlin <span className="brand-highlight">Lubricante</span>
        </span>
      </Link>
      <nav className="nav-links">
        <Link className="nav-item" href="/">Inicio</Link>
        <Link className="nav-item" href="/productos">Productos</Link>
        <Link className="nav-item" href="/#servicios">Servicios</Link>
        <Link className="nav-item" href="/dashboard">Panel distribuidores</Link>
      </nav>
      {isAuthenticated ? (
        <button className="btn ghost" onClick={logout}>Cerrar sesión</button>
      ) : (
        <Link className="btn" href="/login">Acceso distribuidores</Link>
      )}
    </header>
  );
}
