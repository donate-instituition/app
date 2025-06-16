import Link from "next/link";

export default function Header({
    showActions = true,
    showNav = false,
    centered = false,
}: {
    showActions?: boolean;
    showNav?: boolean;
    centered?: boolean;
}) {
    const containerClass = centered
        ? "w-full max-w-5xl flex items-center justify-between bg-white rounded-2xl px-8 py-4 shadow mx-auto"
        : "w-full flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4";

    return (
        <header className={centered ? "w-full flex justify-center pt-8" : ""}>
            <div className={containerClass}>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-lime-300 inline-block" />
                    <span className="text-2xl font-bold text-gray-800">Doe</span>
                </Link>
                {/* Nav */}
                {showNav && (
                    <nav className="hidden md:flex gap-6 text-base font-medium text-gray-700">
                        <span>Início</span>
                        <span>Como funciona?</span>
                        <span>O que é o Doe?</span>
                        <span>Sobre nós</span>
                        <span>Contato</span>
                    </nav>
                )}
                {/* Actions */}
                {showActions && (
                    <div className="flex gap-4 items-center">
                        <Link href="/user/signup" className="font-semibold text-black">Criar uma conta</Link>
                        <span className="text-gray-400">|</span>
                        <Link href="/user/login" className="font-semibold text-black">Entrar</Link>
                    </div>
                )}
            </div>
        </header>
    );
} 