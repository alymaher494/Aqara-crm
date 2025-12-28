import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["300", "400", "500", "700"] });

export const metadata: Metadata = {
    title: "Aqara Plus CRM",
    description: "Advanced Real Estate CRM",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    const lang = localStorage.getItem('app-lang');
                                    if (lang === 'ar') {
                                        document.documentElement.dir = 'rtl';
                                    } else {
                                        document.documentElement.dir = 'ltr';
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body className={cn("min-h-screen bg-slate-50 font-sans antialiased", cairo.className)}>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
