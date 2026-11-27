import "./globals.css";

export const metadata = {
  title: "Everest Training",
  description: "Eventos para ir al rocódromo en grupo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
