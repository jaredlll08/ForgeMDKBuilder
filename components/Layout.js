import NavBar from "./NavBar";
import React from "react";
import Footer from "./Footer";

export default function Layout({children}) {
    return (
        <div className="min-h-screen flex flex-col">
            <header>
                <NavBar/>
            </header>
            <main className={`flex-grow`}>
                {children}
            </main>
            <Footer/>
        </div>
    );
}