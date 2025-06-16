"use client";
import { useState } from "react";
import Link from "next/link";
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

export default function Home() {
  const [campaigns] = useState(mockCampaigns);

  const handleDonateAnonymous = (title: string) => {
    alert(`Doação anônima para: ${title} (MVP placeholder)`);
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f6f7] from-lime-50 via-white to-lime-100 flex flex-col items-center">
      <Header centered showActions />
      {/* Hero Section */}
      <main className="flex-1 w-full flex flex-col items-center justify-start mt-4 md:mt-8 px-2 md:px-0">
        <div className="relative w-full max-w-5xl h-[320px] md:w-[1080px] md:h-[600px] bg-white rounded-3xl shadow overflow-hidden flex items-end">
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full bg-[url('/handshake2.jpg')] bg-cover bg-center rounded-3xl" />
          {/* Soft overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent rounded-3xl" />
          {/* Overlay Content */}
          <div className="relative z-10 flex flex-col justify-end items-start md:left-10 pt-10 md:pt-32 pb-6 md:pb-8 pr-4 md:pr-12 pl-4 md:pl-12 gap-1 h-full w-full md:w-2/3">
            <h1 className="text-white text-5xl md:text-[170px] font-extrabold leading-none drop-shadow-lg">Doe</h1>
            <p className="text-white text-base md:text-[18px] font-medium drop-shadow">Conectando instituições e pessoas.</p>
            <div className="block md:hidden w-full mt-4">
              <Link
                href="/feed"
                className="w-full block px-6 py-3 rounded-lg bg-lime-300 text-gray-900 font-semibold text-base shadow hover:bg-lime-400 transition text-center"
              >
                Encontre uma causa para ajudar
              </Link>
            </div>
          </div>
          {/* Button bottom right on desktop */}
          <div className="hidden md:block absolute bottom-10 right-10 z-20">
            <Link
              href="/feed"
              className="px-8 py-4 rounded-lg bg-lime-300 text-gray-900 font-semibold text-lg shadow hover:bg-lime-400 transition"
            >
              Encontre uma causa para ajudar
            </Link>
          </div>
        </div>
        {/* How it works section */}
        <section className="w-full max-w-4xl mt-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="flex flex-col items-center bg-white rounded-2xl shadow p-6 w-full md:w-1/3">
            <div className="bg-lime-100 rounded-full p-3 mb-3">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">Escolha uma causa</h3>
            <p className="text-gray-600 text-center text-sm">Encontre projetos e instituições que tocam seu coração.</p>
          </div>
          <div className="flex flex-col items-center bg-white rounded-2xl shadow p-6 w-full md:w-1/3">
            <div className="bg-lime-100 rounded-full p-3 mb-3">
              <span className="text-3xl">🤲</span>
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">Doe com carinho</h3>
            <p className="text-gray-600 text-center text-sm">Contribua de forma simples, rápida e segura para quem precisa.</p>
          </div>
          <div className="flex flex-col items-center bg-white rounded-2xl shadow p-6 w-full md:w-1/3">
            <div className="bg-lime-100 rounded-full p-3 mb-3">
              <span className="text-3xl">🌱</span>
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">Veja o impacto</h3>
            <p className="text-gray-600 text-center text-sm">Acompanhe o resultado das doações e inspire-se com histórias reais.</p>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="w-full flex flex-col items-center mt-16 mb-4 text-gray-500 text-sm">
        <div className="flex gap-4 mb-2">
          <Link href="#">Sobre</Link>
          <span>|</span>
          <Link href="#">Contato</Link>
          <span>|</span>
          <Link href="#">Termos</Link>
        </div>
        <div className="flex gap-4 mb-2">Feito com 💚 para quem quer ajudar.</div>
        <div>© {new Date().getFullYear()} Doe.</div>
      </footer>
    </div>
  );
}
