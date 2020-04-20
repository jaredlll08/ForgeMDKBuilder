import NavBar from "./NavBar";
import React from "react";
import Footer from "./Footer";
import {parseCookies} from "nookies";
import {ThemeContext} from "../pages";

const {useContext} = require("react");

export default function Layout({children}) {
    const theme = useContext(ThemeContext);
    return (
        <div className="flex flex-col" style={{minHeight: "100vh"}}>
            <header>
                <NavBar/>
            </header>
            <main
                className={`flex-grow bg-styled transition-colors ease-in-out duration-150 ${theme.value === "dark" ? `bg-gray-900` : `bg-gray-200`}`}>
                {children}
            </main>
            <Footer/>
        </div>
    );
}