import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "T20 Predictor",
  description: "Predict & Compete",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}