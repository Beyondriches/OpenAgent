export const metadata = {
  title: "Theo Crypto Agent",
  description: "OpenAgent crypto analysis workspace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
