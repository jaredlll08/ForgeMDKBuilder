import React from "react";

export default function Footer() {
    return (<footer className={`py-4 bg-gray-900 text-center`}>
        <p className="text-gray-500">
            Provided by <a href={"https://twitter.com/jaredlll08"}
                           className={`hover:text-blue-500 transition-colors ease-in duration-300`}>Jaredlll08</a>
        </p>
    </footer>);
}