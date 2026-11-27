import "./globals.css";

export const metadata = {
  title: "Everest Training",
  description: "Quedadas para ir al rocódromo en grupo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
