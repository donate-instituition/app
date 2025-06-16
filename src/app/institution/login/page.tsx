"use client";

import React, { useState } from 'react';
import Header from "@/components/Header";

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

function LoginForm() {
    const [form, setForm] = useState({ email: '', password: '', remember: false });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!form.email) newErrors.email = 'E-mail obrigatório';
        if (!form.password) newErrors.password = 'Senha obrigatória';
        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validation = validate();
        setErrors(validation);
        if (Object.keys(validation).length === 0) {
            alert('Login realizado!');
        }
    };

    return (
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900">Entrar</h2>
            <p className="text-gray-500 text-sm mb-6">Bem-vindo(a) de volta ao Doe.</p>
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900" htmlFor="email">E-mail</label>
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
                    <label className="block text-sm font-medium mb-1 text-gray-900" htmlFor="password">Senha</label>
                    <input
                        className={`w-full border rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm text-gray-500 placeholder-gray-400 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                        type="password"
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        placeholder="******"
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                <div className="flex items-center justify-between">
                    <label className="flex items-center text-sm text-gray-600 select-none">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={form.remember}
                            onChange={handleChange}
                            className="mr-2 rounded border-gray-300 focus:ring-lime-400"
                        />
                        Lembre-se de mim
                    </label>
                    <a href="#" className="text-sm text-gray-500 hover:underline">Esqueci minha senha</a>
                </div>
                <button
                    type="submit"
                    className="w-full bg-lime-300 hover:bg-lime-400 text-gray-800 font-semibold py-2.5 rounded-lg mt-2 transition-colors text-base shadow-sm"
                >
                    Entrar
                </button>
            </form>
            <p className="text-sm text-gray-600 mt-6 text-center">
                Não tem uma conta? <a href="/user/signup" className="text-black font-semibold hover:underline">Registre-se</a>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#fafafd] flex flex-col">
            <Header showActions={false} centered={false} />
            <main className="flex flex-1 justify-center items-center px-2 sm:px-4 py-6">
                <div className="flex flex-col lg:flex-row w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    <LeftPanel />
                    <LoginForm />
                </div>
            </main>
        </div>
    );
}