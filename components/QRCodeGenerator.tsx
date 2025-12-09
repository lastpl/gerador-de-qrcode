"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { Download, Loader2, QrCode, Settings2, ChevronDown, ChevronUp, Square, Circle, AppWindow } from "lucide-react";
import { cn } from "@/lib/utils";

type QRStyle = "square" | "dots" | "rounded";
const PLACEHOLDER_URL = "https://example.com";

export default function QRCodeGenerator() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Customization State
    const [showOptions, setShowOptions] = useState(false);
    const [colorDark, setColorDark] = useState("#000000");
    const [colorLight, setColorLight] = useState("#ffffff");
    const [margin, setMargin] = useState(2);
    const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<"L" | "M" | "Q" | "H">("M");
    const [qrStyle, setQrStyle] = useState<QRStyle>("square");

    // Payment State removido
    // const [isPaid, setIsPaid] = useState(false);
    // const [showPaymentModal, setShowPaymentModal] = useState(false);
    // const [paymentData, setPaymentData] = useState<{ qr_code: string, qr_code_text: string, payment_id: string } | null>(null);
    // const [checkingPayment, setCheckingPayment] = useState(false);

    const validateUrl = (string: string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    // Polling para verificar pagamento quando o modal está aberto
    // useEffect(() => {
    //     let interval: NodeJS.Timeout;

    //     if (showPaymentModal && paymentData?.payment_id && !isPaid) {
    //         interval = setInterval(async () => {
    //             try {
    //                 const res = await fetch(`/api/check-payment?id=${paymentData.payment_id}`);
    //                 const data = await res.json();
    //                 if (data.status === 'approved') {
    //                     setIsPaid(true);
    //                     setShowPaymentModal(false);
    //                     setCheckingPayment(false);
    //                     // Opcional: Auto-download ou feedback de sucesso
    //                     alert("Pagamento confirmado! Seu QR Code foi liberado.");
    //                 }
    //             } catch (err) {
    //                 console.error("Erro ao verificar pagamento", err);
    //             }
    //         }, 3000); // Checa a cada 3 segundos
    //     }

    //     return () => clearInterval(interval);
    // }, [showPaymentModal, paymentData, isPaid]);

    // const initiatePayment = async () => {
    //     setCheckingPayment(true);
    //     try {
    //         const res = await fetch('/api/create-payment', { method: 'POST' });
    //         const data = await res.json();
    //         if (data.error) throw new Error(data.error);

    //         setPaymentData(data);
    //         setShowPaymentModal(true);
    //     } catch (err) {
    //         console.error(err);
    //         alert("Erro ao gerar pagamento PIX. Verifique a configuração.");
    //         setCheckingPayment(false);
    //     }
    // };

    const drawQRCode = useCallback(async () => {
        if (!canvasRef.current) return;

        // Use URL do usuário ou placeholder para preview
        // Se o user digitou URL mas não pagou, mostramos o preview da URL dele?
        // O requisito diz "so consiga gerar ... apos pagamento".
        // Vamos permitir o PREVIEW visual, mas o download bloqueado.
        // Assim ele vê que funciona.
        const targetUrl = url ? url : PLACEHOLDER_URL;

        try {
            const qrData = await QRCode.create(targetUrl, {
                errorCorrectionLevel: errorCorrectionLevel,
            });

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const modules = qrData.modules;
            const size = modules.size;
            const data = modules.data;

            const scale = 20;
            const totalSize = (size + (margin * 2)) * scale;

            canvas.width = totalSize;
            canvas.height = totalSize;

            ctx.fillStyle = colorLight;
            ctx.fillRect(0, 0, totalSize, totalSize);

            ctx.fillStyle = colorDark;
            const offset = margin * scale;

            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (data[r * size + c]) {
                        const x = c * scale + offset;
                        const y = r * scale + offset;

                        if (qrStyle === 'dots') {
                            ctx.beginPath();
                            ctx.arc(x + scale / 2, y + scale / 2, scale / 2.2, 0, 2 * Math.PI);
                            ctx.fill();
                        } else if (qrStyle === 'rounded') {
                            ctx.beginPath();
                            if (ctx.roundRect) {
                                ctx.roundRect(x, y, scale, scale, scale * 0.4);
                            } else {
                                ctx.fillRect(x, y, scale, scale);
                            }
                            ctx.fill();
                        } else {
                            ctx.fillRect(x, y, scale, scale);
                        }
                    }
                }
            }

        } catch (err) {
            console.error(err);
        }
    }, [url, margin, colorDark, colorLight, errorCorrectionLevel, qrStyle]);

    useEffect(() => {
        drawQRCode();
    }, [drawQRCode]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        // Se já pagou, atualiza e pronto. Se não, mostra aviso ou inicia fluxo?
        // O botão "Validar & Atualizar" serve pro preview. Vamos deixar o fluxo de pagamento pro botão de DOWNLOAD ou um botão específico "Finalizar".
        // Mas o user pediu "so consiga gerar ... e por o link apos pagamento". 
        // Então, se ele tentar por o link e gerar, poderiamos bloquear. 
        // Mas bloquear a digitação é ruim. Vamos bloquear a AÇÃO FINAL.

        setError(null);
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        setLoading(false);
        drawQRCode();
    };

    const handleDownload = () => {
        if (!canvasRef.current || !url || !validateUrl(url)) {
            setError("Insira uma URL válida antes de baixar.");
            return;
        }

        const link = document.createElement("a");
        link.href = canvasRef.current.toDataURL("image/png");
        link.download = "qrcode-personalizado.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // const copyPixCode = () => {
    //     if (paymentData?.qr_code_text) {
    //         navigator.clipboard.writeText(paymentData.qr_code_text);
    //         alert("Código PIX copiado!");
    //     }
    // };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value);
        if (error) setError(null);
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 space-y-8 bg-card rounded-2xl shadow-xl border border-border/50 backdrop-blur-sm">

            {/* Modal / Overlay de Pagamento */}
            {/* {showPaymentModal && paymentData && (
                <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-4 max-w-sm">
                        <h2 className="text-xl font-bold">Libere seu QR Code</h2>
                        <p className="text-sm text-muted-foreground">
                            Pague <span className="font-bold text-foreground">R$ 5,00</span> via PIX para baixar seu QR Code em alta resolução.
                        </p>

                        <div className="border p-4 rounded-xl bg-white flex justify-center">
                            <img
                                src={`data:image/png;base64,${paymentData.qr_code}`}
                                alt="QR Code PIX"
                                className="w-48 h-48 object-contain"
                            />
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={copyPixCode}
                                className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
                            >
                                Copiar Código PIX
                            </button>
                            <p className="text-xs text-muted-foreground animate-pulse">
                                Aguardando pagamento...
                            </p>
                        </div>

                        <div className="pt-4 text-xs text-muted-foreground border-t">
                            <p className="font-semibold text-green-600 mb-1">✓ Garantia Vitalícia</p>
                            <p>Seu QR Code nunca sairá do ar. O link é direto.</p>
                        </div>

                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                        >
                            Cancelar / Voltar
                        </button>
                    </div>
                </div>
            )} */}

            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                    <QrCode className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Gerador de QR Code
                </h1>
                <p className="text-sm text-muted-foreground">
                    Crie e personalize seu QR Code em tempo real.
                </p>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="relative group mx-auto w-64 h-64 bg-transparent p-0 rounded-xl flex items-center justify-center border border-border/50 overflow-hidden shadow-sm transition-all duration-300">
                        <canvas
                            ref={canvasRef}
                            className="w-full h-full object-contain"
                        />
                        {(!url || !validateUrl(url)) && (
                            <div className="absolute inset-0 bg-background/5 flex items-end justify-center pb-2 pointer-events-none">
                                <span className="text-xs bg-muted/80 px-2 py-1 rounded text-muted-foreground backdrop-blur-md">Preview</span>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="url-input"
                            className="text-sm font-medium leading-none"
                        >
                            URL de destino
                        </label>
                        <input
                            id="url-input"
                            type="text"
                            placeholder="https://exemplo.com"
                            value={url}
                            onChange={handleInputChange}
                            className={cn(
                                "flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 py-2 text-sm shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary",
                                error && "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive"
                            )}
                        />
                        {error && (
                            <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1 fade-in-0">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm">
                        <button
                            type="button"
                            onClick={() => setShowOptions(!showOptions)}
                            className="flex items-center justify-between w-full p-4 text-sm font-medium hover:bg-muted/50 transition-colors"
                        >
                            <span className="flex items-center gap-2 text-foreground">
                                <Settings2 className="w-4 h-4 text-primary" />
                                Personalizar Estilo
                            </span>
                            {showOptions ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                        </button>

                        {showOptions && (
                            <div className="p-4 pt-0 space-y-6 animate-in slide-in-from-top-2 fade-in-0">
                                <div className="h-px w-full bg-border/50 mb-4" />

                                <div className="space-y-3">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formato</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: "square", icon: Square, label: "Quadrado" },
                                            { id: "rounded", icon: AppWindow, label: "Suave" },
                                            { id: "dots", icon: Circle, label: "Dots" }
                                        ].map(({ id, icon: Icon, label }) => (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => setQrStyle(id as QRStyle)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center py-3 px-2 rounded-lg border text-xs gap-2 transition-all hover:bg-accent hover:text-accent-foreground",
                                                    qrStyle === id
                                                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                                                        : "border-border/50 bg-background text-muted-foreground"
                                                )}
                                            >
                                                <Icon className={cn("w-5 h-5", qrStyle === id && "fill-current/10")} />
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cores</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <span className="text-xs text-muted-foreground">Código (QR)</span>
                                            <div className="flex items-center gap-2 h-10 w-full rounded-lg border border-input bg-background/50 px-3 transition-colors hover:bg-accent/50 relative">
                                                <div
                                                    className="w-6 h-6 rounded-full border border-border shadow-sm flex-shrink-0"
                                                    style={{ backgroundColor: colorDark }}
                                                />
                                                <input
                                                    type="color"
                                                    value={colorDark}
                                                    onChange={(e) => setColorDark(e.target.value)}
                                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                                />
                                                <span className="text-xs font-mono flex-1">{colorDark}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="text-xs text-muted-foreground">Fundo</span>
                                            <div className="flex items-center gap-2 h-10 w-full rounded-lg border border-input bg-background/50 px-3 transition-colors hover:bg-accent/50 relative">
                                                <div
                                                    className="w-6 h-6 rounded-full border border-border shadow-sm flex-shrink-0"
                                                    style={{ backgroundColor: colorLight }}
                                                />
                                                <input
                                                    type="color"
                                                    value={colorLight}
                                                    onChange={(e) => setColorLight(e.target.value)}
                                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                                />
                                                <span className="text-xs font-mono flex-1">{colorLight}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="margin" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Margem</label>
                                        <span className="text-xs text-muted-foreground font-medium">{margin}px</span>
                                    </div>
                                    <input
                                        id="margin"
                                        type="range"
                                        min="0"
                                        max="5"
                                        step="1"
                                        value={margin}
                                        onChange={(e) => setMargin(Number(e.target.value))}
                                        className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="error-level" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Correção de Erros
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="error-level"
                                            value={errorCorrectionLevel}
                                            onChange={(e) => setErrorCorrectionLevel(e.target.value as any)}
                                            className="w-full h-10 rounded-lg border border-input bg-background/50 px-3 text-sm appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                        >
                                            <option value="L">Baixo (7%)</option>
                                            <option value="M">Médio (15%)</option>
                                            <option value="Q">Alta (25%)</option>
                                            <option value="H">Máxima (30%)</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                "Validar & Atualizar"
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleDownload}
                            className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-input"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Baixar PNG
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
