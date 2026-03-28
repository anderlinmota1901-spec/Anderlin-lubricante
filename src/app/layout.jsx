import './globals.css';
import Providers from './providers';
import NavBar from '../components/NavBar';

export const metadata = {
  title: 'D,anderlin Lubricante',
  description: 'Lubricantes técnicos para distribuidores y flotas',
  icons: {
    icon: '/logo.jpeg',
    shortcut: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
