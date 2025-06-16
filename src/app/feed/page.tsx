"use client";
import { useState } from "react";
import Image from "next/image";

// This page uses a mock in-memory data store for campaigns (MVP only)
// TODO (MVP):
// - Implement /campaign/[id] page (campaign detail)
// - Implement donation flow (form, PIX, thank you)
// - Implement institution dashboard for campaign creation
// - Implement updates feed for campaigns

// Mock campaign data
const mockCampaigns = [
    {
        id: "1",
        title: "Ajude o Lar dos Animais",
        description: "Campanha para arrecadar fundos para o abrigo de animais abandonados.",
        image: "/globe.svg",
        goal: 5000,
        amountRaised: 1200,
    },
    {
        id: "2",
        title: "Doe para a Creche Esperança",
        description: "Apoie a educação de crianças em situação de vulnerabilidade.",
        image: "/file.svg",
        goal: 8000,
        amountRaised: 3500,
    },
];

export default function Feed() {
    const [campaigns] = useState(mockCampaigns);

    const handleDonateAnonymous = (title: string) => {
        alert(`Doação anônima para: ${title} (MVP placeholder)`);
    };

    return (
        <div className="min-h-screen p-8 pb-20 flex flex-col items-center bg-gray-50 bg-[url('/noun-donation.svg')] bg-center bg-[length:600px_1200px]">
            {/* Header with logo and actions */}
            <header className="w-full max-w-5xl flex items-center justify-between mb-10">
                <a href="/" className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-lime-300 inline-block" />
                    <span className="text-lg font-bold text-gray-800">Doe</span>
                </a>
                <div className="flex gap-4">
                    <a href="/user/signup" className="px-3 py-1.5 text-sm rounded-md bg-lime-400 text-gray-900 font-semibold hover:bg-lime-500 transition">Criar Conta</a>
                    <a href="/user/login" className="px-3 py-1.5 text-sm rounded-md border border-lime-400 text-lime-700 font-semibold hover:bg-lime-50 transition">Entrar</a>
                </div>
            </header>
            <h1 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                <span role="img" aria-label="heart">💚</span>
                Campanhas Ativas
            </h1>
            <div className="grid gap-4 w-full max-w-3xl">
                {campaigns.map((c) => (
                    <div key={c.id} className="bg-white rounded-lg shadow p-3 flex flex-col sm:flex-row gap-3 items-center">
                        <Image src={c.image} alt={c.title} width={80} height={80} className="rounded-lg object-cover" />
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold mb-1 text-gray-900">{c.title}</h2>
                            <p className="text-gray-600 mb-2 text-sm">{c.description}</p>
                            <div className="mb-1">
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                    <div
                                        className="bg-lime-400 h-2 rounded-full"
                                        style={{ width: `${Math.min((c.amountRaised / c.goal) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-700">
                                    R$ {c.amountRaised.toLocaleString()} de R$ {c.goal.toLocaleString()} arrecadados
                                </span>
                            </div>
                            <div className="flex gap-2 mt-1">
                                <a
                                    href={`/campaign/${c.id}`}
                                    className="px-2 py-1 text-xs rounded bg-lime-400 text-gray-900 font-semibold hover:bg-lime-500 transition"
                                >
                                    💸 Doar
                                </a>
                                <button
                                    onClick={() => handleDonateAnonymous(c.title)}
                                    className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                                >
                                    🕵️ Anônimo
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
