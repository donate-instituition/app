"use client";
import { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";

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
        <div className="min-h-screen w-full bg-[#f5f6f7] flex flex-col items-center">
            <Header centered showActions />
            <main className="w-full flex flex-col items-center mt-8 mb-16 px-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 text-center mb-8 flex items-center justify-center gap-2">
                    <span role="img" aria-label="heart">💚</span>
                    Campanhas Ativas
                </h1>
                <section className="w-full max-w-2xl flex flex-col gap-6">
                    {campaigns.map((c) => (
                        <div
                            key={c.id}
                            className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col sm:flex-row gap-5 items-center hover:shadow-lg transition"
                        >
                            <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 bg-gray-50 rounded-xl">
                                <Image src={c.image} alt={c.title} width={56} height={56} className="object-contain" />
                            </div>
                            <div className="flex-1 w-full flex flex-col gap-2">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-0.5">{c.title}</h2>
                                <p className="text-gray-600 text-sm mb-1">{c.description}</p>
                                <div className="mb-1">
                                    <div className="w-full bg-gray-200 rounded-full h-3 mb-1 overflow-hidden">
                                        <div
                                            className="bg-lime-400 h-3 rounded-full transition-all"
                                            style={{ width: `${Math.min((c.amountRaised / c.goal) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-700">
                                        R$ {c.amountRaised.toLocaleString()} de R$ {c.goal.toLocaleString()} arrecadados
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                                    <a
                                        href={`/campaign/${c.id}`}
                                        className="flex-1 px-4 py-2 rounded-lg bg-lime-400 text-gray-900 font-semibold text-sm md:text-base shadow hover:bg-lime-500 transition text-center"
                                    >
                                        💸 Doar
                                    </a>
                                    <button
                                        onClick={() => handleDonateAnonymous(c.title)}
                                        className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm md:text-base shadow hover:bg-gray-200 transition text-center"
                                    >
                                        🕵️ Anônimo
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
}
