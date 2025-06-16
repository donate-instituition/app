"use client";
import { useState } from "react";
import Link from "next/link";

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

export default function Home() {
  const [campaigns] = useState(mockCampaigns);

  const handleDonateAnonymous = (title: string) => {
    alert(`Doação anônima para: ${title} (MVP placeholder)`);
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f6f7] flex flex-col items-center">
      {/* Header */}
      <header className="w-full flex justify-center pt-8">
        <div className="w-full max-w-5xl flex items-center justify-between bg-white rounded-2xl px-8 py-4 shadow">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-lime-300 inline-block" />
            <span className="text-2xl font-bold text-gray-800">Doe</span>
          </div>
          {/* Actions */}
          <div className="flex gap-4 items-center">
            <Link href="/user/signup" className="font-semibold text-black">Criar uma conta</Link>
            <span className="text-gray-400">|</span>
            <Link href="/user/login" className="font-semibold text-black">Entrar</Link>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <main className="flex-1 w-full flex justify-center items-start mt-8">
        <div className="relative w-[1080px] max-w-5xl h-[600px] bg-white rounded-3xl shadow overflow-hidden flex items-end">
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full bg-[url('/handshake2.jpg')] bg-cover bg-center rounded-3xl" />
          {/* Overlay Content */}
          <div className="relative z-10 left-10 flex flex-col justify-end items-start pt-32 pb-8 pr-12 pl-12 gap-1 h-full w-2/3">
            <h1 className="text-white text-[170px] font-extrabold leading-none drop-shadow-lg">Doe</h1>
            <p className="text-white text-[18px] font-medium drop-shadow">Conectando instituições e pessoas.</p>
          </div>
          {/* Button bottom right */}
          <div className="absolute bottom-10 right-10 z-20">
            <Link
              href="/feed"
              className="px-8 py-4 rounded-lg bg-lime-300 text-gray-900 font-semibold text-lg shadow hover:bg-lime-400 transition"
            >
              Encontre uma causa para ajudar
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
