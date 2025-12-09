import QRCodeGenerator from "@/components/QRCodeGenerator";

export default function Home() {
    return (
        <main className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
            <div className="w-full max-w-5xl items-center justify-center font-mono text-sm lg:flex mb-8">
                {/* Optional header content or branding could go here */}
            </div>

            <QRCodeGenerator />

            <footer className="mt-12 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Gerador de QR Code. Todos os direitos reservados.</p>
            </footer>
        </main>
    );
}
