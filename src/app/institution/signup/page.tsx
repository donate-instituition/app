"use client";

import React, { useState } from 'react';

function Header() {
    return (
        <header className="w-full py-4 px-8 flex items-center border-b border-gray-200 bg-white">
            <a href="/" className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-lime-300 inline-block" />
                <span className="text-lg font-bold text-gray-800">Doe</span>
            </a>
        </header>
    );
}

function LeftPanel() {
    return (
        <div className="hidden lg:block w-1/2 bg-[#BBE269] relative overflow-hidden min-h-[220px]">
            <svg
                className="absolute inset-0 w-full h-full opacity-20"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                {[...Array(14)].map((_, i) => (
                    <path
                        key={i}
                        d={`M -50 ${30 * i} Q 200 ${30 * i + 40}, 450 ${30 * i}`}
                        stroke="#828282"
                        strokeWidth="2"
                        fill="none"
                        transform="rotate(-12 200 200)"
                    />
                ))}
            </svg>
            <h1 className="absolute top-10 left-10 text-4xl md:text-8xl font-bold text-[#29511C] z-10">Doe</h1>
            <p className="absolute bottom-10 left-10 max-w-[60%] text-xl md:text-3xl font-semibold text-[#29511C] z-10 break-words">
                Crie campanhas, receba doações e fortaleça sua causa.
            </p>
        </div>
    );
}

function SignupForm() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!form.name) newErrors.name = 'Nome obrigatório';
        if (!form.email) newErrors.email = 'E-mail obrigatório';
        if (!form.password) newErrors.password = 'Senha obrigatória';
        else {
            if (form.password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
            if (!/[^A-Za-z0-9]/.test(form.password)) newErrors.password = 'Precisa de um caractere especial';
        }
        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validation = validate();
        setErrors(validation);
        if (Object.keys(validation).length === 0) {
            alert('Cadastro realizado!');
        }
    };

    return (
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900">Crie uma conta</h2>
            <p className="text-gray-500 text-sm mb-6">Alcance pessoas dispostas a apoiar sua causa.</p>
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900" htmlFor="name">Nome <span className="text-red-500">*</span></label>
                    <input
                        className={`w-full border rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm text-gray-500 placeholder-gray-400 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="name"
                        placeholder="Digite seu nome"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900" htmlFor="email">E-mail <span className="text-red-500">*</span></label>
                    <input
                        className={`w-full border rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm text-gray-500 placeholder-gray-400 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        placeholder="Digite seu e-mail"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900" htmlFor="password">Senha <span className="text-red-500">*</span></label>
                    <input
                        className={`w-full border rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm text-gray-500 placeholder-gray-400 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                        type="password"
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        placeholder="Crie uma senha"
                    />
                    <ul className="text-[12px] mt-1 space-y-0.5">
                        <li className={form.password.length >= 8 ? 'text-green-600' : 'text-red-500'}>
                            Precisa ter ao menos 8 caracteres
                        </li>
                        <li className={/[^A-Za-z0-9]/.test(form.password) ? 'text-green-600' : 'text-red-500'}>
                            Precisa ter ao menos um caractere especial
                        </li>
                    </ul>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                <button
                    type="submit"
                    className="w-full bg-lime-300 hover:bg-lime-400 text-gray-800 font-semibold py-2.5 rounded-lg mt-2 transition-colors text-base shadow-sm"
                >
                    Criar conta
                </button>
            </form>
            <p className="text-sm text-gray-600 mt-6 text-center">
                Já tem uma conta? <a href="/user/login" className="text-black font-semibold hover:underline">Entrar</a>
            </p>
        </div>
    );
}

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-[#fafafd] flex flex-col">
            <Header />
            <main className="flex flex-1 justify-center items-center px-2 sm:px-4 py-6">
                <div className="flex flex-col lg:flex-row w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    <LeftPanel />
                    <SignupForm />
                </div>
            </main>
        </div>
    );
} 