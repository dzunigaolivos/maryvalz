

'use client';
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const QRPage = () => {
    const [input, setInput] = useState("");
    const [qrValue, setQrValue] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleGenerate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setQrValue(input);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <form onSubmit={handleGenerate} className="mb-8 w-full max-w-md flex flex-col items-center">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ingresa un link para generar el QR"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                />
                <button
                    type="submit"
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Generar QR
                </button>
            </form>
            <div className="flex items-center justify-center w-full">
                {qrValue ? (
                    <QRCodeSVG value={qrValue} size={320} level="H" includeMargin={true} />
                ) : (
                    <div className="flex h-80 w-80 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 shadow-md">
                        <div className="text-center text-gray-400">
                            <p className="text-lg font-semibold">QR Code</p>
                            <p className="mt-2 text-sm">Ingresa un link para generar el código QR.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRPage;