import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/lib/preferences";

export const metadata = { title: "Job Tracker", description: "Track job applications. Local-first." };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
