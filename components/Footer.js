import React from "react";

export default function Footer() {
    return (<footer className={`py-4 bg-gray-700 text-center`}>
            <p className="text-gray-600">
                © {new Date().getFullYear()}
            </p>
    </footer>);
}