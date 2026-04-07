import React from "react";

const HomePage = () => {
    return(
        <main>
            <h1>Home Page</h1>
            <p>Welcome to the Home Page!</p>
            <div className="h-screen w-full bg-slate-900 flex items-center justify-center gap-6">
                <h1 className="text-white text-5xl font-black tracking-tight">
                    PostLine <span className="text-blue-500">System</span>
                </h1>
                    
                <p className="text-slate-400 text-lg">
                    Sнтерфейс тепер на Tailwind CSS 4
                </p>

                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                    Почати роботу
                </button>
            </div>
        </main>
    );
};

export default HomePage;