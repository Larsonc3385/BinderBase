import "./globals.css";

export const metadata = {
  title: "BinderBase",
  description: "MTG Commander Deck Builder",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-bs-theme="dark">
      <head>
        {/* Bootstrap 5 + Bootswatch Vapor theme */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootswatch@5/dist/vapor/bootstrap.min.css"
        />
        {/* Bootstrap Icons */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}