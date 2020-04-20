import React from "react";
import {ThemeContext} from "../pages";

const {useContext} = require("react");

export default function NavBar() {
    let theme = useContext(ThemeContext);
    return (<nav className="flex items-center justify-between flex-wrap bg-blue-800 p-2">
        <div className="flex items-center flex-shrink-0 text-white mr-6">
            <svg className="fill-current h-8 w-8 mr-2" width="54" height="54" viewBox="0 0 20 20">
                <path
                    d="M6.47 9.8A5 5 0 0 1 .2 3.22l3.95 3.95 2.82-2.83L3.03.41a5 5 0 0 1 6.4 6.68l10 10-2.83 2.83L6.47 9.8z"/>
            </svg>
            <span className="text-xl tracking-tight">ForgeTools</span>
        </div>
        <button className={`text-white bg-blue-700 p-2`} onClick={() => {
            theme.toggle();
        }}>
            Toggle theme
        </button>
    </nav>);
}