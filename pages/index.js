import React, {useRef, useState} from "react";
import Layout from "../components/Layout";
import fetch from 'node-fetch'
import {parseStringPromise} from 'xml2js';
import {v4 as uuidv4} from 'uuid';
import {parseCookies, setCookie} from "nookies";

function compareVersion(v1, v2) {
    if (typeof v1 !== 'string') return false;
    if (typeof v2 !== 'string') return false;
    v1 = v1.split('.');
    v2 = v2.split('.');
    const k = Math.min(v1.length, v2.length);
    for (let i = 0; i < k; ++i) {
        v1[i] = parseInt(v1[i], 10);
        v2[i] = parseInt(v2[i], 10);
        if (v1[i] > v2[i]) return 1;
        if (v1[i] < v2[i]) return -1;
    }
    return v1.length === v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
}

export const ThemeContext = React.createContext({
    value: "light",
    toggle: () => {
    }
});

export default function Home({minecraftVersions, mcpData, forgeVersions, themeVal}) {

    function makeMCVersions(versions) {
        let arr = [];

        for (let index in versions) {
            if (versions[index].indexOf("1.15") !== -1)
                arr.push(<option key={index} value={versions[index]}
                                 className={"text-black"}>{versions[index]}</option>)
        }
        return arr;
    }

    function makeForgeVersions(mcVersion, forgeVersions) {
        let arr = [];
        let filtered = forgeVersions.filter(value => {
            return value.split("-")[0] === mcVersion;
        });
        for (let index in filtered) {
            arr.push(<option key={index} value={filtered[index]} className={"text-black"}>{filtered[index]}</option>)
        }

        return arr;
    }

    function getForgeVersion(mcVersion, forgeVersions) {
        let filtered = forgeVersions.filter(value => {
            return value.split("-")[0] === mcVersion;
        });

        return filtered[0];
    }

    function makeMCPVersions(mcVersion, forgeVersions, mcpData, mcpVersionType) {
        let arr = [];
        if (mcpData[mcVersion]) {
            let data = mcpData[mcVersion][mcpVersionType];
            if (data.length) {
                for (let index in data) {
                    arr.push(<option key={index}
                                     value={`${data[index]}-${mcVersion}`}
                                     className={"text-black"}>{data[index]}-{mcVersion}</option>)
                }
            } else {
                let major = mcVersion.split(".")[0];
                let minor = mcVersion.split(".")[1];
                let subData = makeMCPVersionsFromPart(mcpData, mcpVersionType, major, minor);
                if (subData.length) {
                    arr.push(subData);
                } else {
                    arr.push(<option key={"nodata"} value={"nodata"} className={"text-black"}>No data found!</option>)
                }
            }
        } else {
            let major = mcVersion.split(".")[0];
            let minor = mcVersion.split(".")[1];
            arr.push(makeMCPVersionsFromPart(mcpData, mcpVersionType, major, minor));
        }
        return arr;
    }

    function getMCPVersionFromPart(mcpData, mcpVersionType, major, minor) {
        if (mcpData[major + "." + minor]) {
            let data = Object.keys(mcpData).sort((a, b) => compareVersion(b, a)).filter(value => {
                return value.startsWith(major + "." + minor);
            });
            let returned = `${mcpData[data[0]][mcpVersionType][0]}-${data[0]}`;
            if (mcpData[data[0]][mcpVersionType][0]) {
                return returned;
            }
            return "";
        } else {
            return "";
        }
    }

    function makeMCPVersionsFromPart(mcpData, mcpVersionType, major, minor) {
        let arr = [];
        if (mcpData[major + "." + minor]) {
            let data = Object.keys(mcpData).sort((a, b) => compareVersion(b, a)).filter(value => {
                return value.startsWith(major + "." + minor);
            });
            for (let index in data) {
                for (let iindex in mcpData[data[index]][mcpVersionType]) {
                    arr.push(<option key={`${data[index]}-${iindex}`}
                                     value={`${mcpData[data[index]][mcpVersionType][iindex]}-${data[index]}`}
                                     className={"text-black"}>{mcpData[data[index]][mcpVersionType][iindex]}-{data[index]}</option>)
                }
            }
        } else {
            arr.push(<option key={"none"} value={"none"} className={"text-black"}>No MCP data found!</option>)
        }
        return arr;
    }

    const [selectedField, setSelectedField] = useState("");
    const [mcVersion, setMCVersion] = useState(minecraftVersions[0]);
    const [forgeVersion, setForgeVersion] = useState(forgeVersions[0]);
    const [mcpVersionType, setMCPVersionType] = useState("snapshot");
    const [mcpVersion, setMCPVersion] = useState(getMCPVersionFromPart(mcpData, mcpVersionType, mcVersion.split("\.")[0], mcVersion.split("\.")[1]));
    const [modid, setModid] = useState({changed: false, value: "examplemod"});
    const [displayName, setDisplayName] = useState({changed: false, value: "Example Mod"});
    const [authors, setAuthors] = useState("");
    const [credits, setCredits] = useState("");

    const [group, setGroup] = useState("com.example.mod");
    const [archiveName, setArchiveName] = useState("ExampleMod-" + mcVersion);
    const [vendor, setVendor] = useState("examplemods-r-us");
    const [maven, setMaven] = useState(true);

    const [loggingMarkers, setLoggingMarkers] = useState(false);
    const [debugLogging, setDebugLogging] = useState(false);
    const [description, setDescription] = useState("");

    let disabled = modid.value.trim().length === 0 || displayName.value.trim().length === 0 || group.trim().length === 0 || archiveName.trim().length === 0 || vendor.trim().length === 0 || description.trim().length === 0;

    let [theme, setTheme] = useState(themeVal);
    return (
        <ThemeContext.Provider value={{
            value: theme, toggle: () => {
                let nTheme = theme === "dark" ? "light" : "dark";
                setCookie(null, 'theme', nTheme, {
                    maxAge: 30 * 24 * 60 * 60,
                    path: '/',
                });
                setTheme(nTheme);
            }
        }}>
            <Layout>
                <div className={`lg:flex w-full lg:w-5/6 mx-auto `}>
                    <div
                        className={`my-4 w-5/6 mx-auto transition-colors ease-in-out duration-150 ${theme === "dark" ? "bg-gray-800 text-gray-200" : "bg-gray-200"} border border-gray-700`}>
                        <div className={"text-center border-b border-gray-400 mb-2 px-4 py-2"}>
                            <h1 className={"text-2xl text-center"}>Welcome to the Forge MDK Builder!</h1>
                            <p className={`w-5/6 mx-auto text-xl `}>This website will help you quickly setup a Minecraft
                                Forge Development Environment without having to manually remove some of the bloat
                                included
                                with the Forge provided MDKs</p>
                        </div>
                        <div id={"environmentOptions"}>
                            <h1 className={"text-2xl text-center"}>Environment Options</h1>
                            <div className={`text-center border-b border-gray-400`}>
                                <div className={`px-4 py-2`}>
                                    <div className={`lg:flex flex-row`}>
                                        <label htmlFor={"fieldMCVersion"} className={"flex-none text-2xl"}>
                                            Minecraft Version:
                                        </label>
                                        <div className={"flex-grow"}>
                                            <div className="relative my-auto pt-1 pl-3 pr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                     className={"fill-current h-4 w-4 ml-2 my-2 absolute svg-icon pointer-events-none"}>
                                                    <path
                                                        d="M17 12h-6v4h1v4H8v-4h1v-4H3v4h1v4H0v-4h1v-4a2 2 0 0 1 2-2h6V6H7V0h6v6h-2v4h6a2 2 0 0 1 2 2v4h1v4h-4v-4h1v-4z"/>
                                                </svg>
                                                <select id="fieldMCVersion"
                                                        className={`w-full bg-transparent py-1 appearance-none`}
                                                        style={{textIndent: "2rem"}} onChange={event => {
                                                    setMCVersion(event.target.value);
                                                    setForgeVersion(getForgeVersion(event.target.value, forgeVersions));
                                                }}>
                                                    {makeMCVersions(minecraftVersions)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`text-center border-b border-gray-400`}>
                                <div className={`px-4 py-2`}>
                                    <div className={`lg:flex flex-row`}>
                                        <label htmlFor={"fieldForgeVersion"} className={"flex-none text-2xl"}>
                                            Forge Version:
                                        </label>
                                        <div className={"flex-grow"}>
                                            <div className="relative my-auto pt-1 pl-3 pr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                     className={"fill-current h-4 w-4 ml-2 my-2 absolute svg-icon pointer-events-none"}>
                                                    <path
                                                        d="M17 12h-6v4h1v4H8v-4h1v-4H3v4h1v4H0v-4h1v-4a2 2 0 0 1 2-2h6V6H7V0h6v6h-2v4h6a2 2 0 0 1 2 2v4h1v4h-4v-4h1v-4z"/>
                                                </svg>

                                                <select id="fieldForgeVersion"
                                                        className={`w-full bg-transparent py-1 appearance-none`}
                                                        style={{textIndent: "2rem"}} onChange={event => {
                                                    setForgeVersion(event.target.value);
                                                }}>
                                                    {makeForgeVersions(mcVersion, forgeVersions)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`lg:flex flex-row`}>
                                <div className={`lg:w-1/2 text-center border-b border-gray-400`}>
                                    <div className={`px-4 py-2`}>
                                        <div className={`lg:flex flex-row`}>
                                            <label htmlFor={"fieldMCPVersionType"} className={"flex-none text-2xl"}>
                                                MCP Version Type:
                                            </label>
                                            <div className={"flex-grow"}>
                                                <div className="relative my-auto pt-1 pl-3 pr-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                         className={"fill-current h-4 w-4 ml-2 my-2 absolute svg-icon pointer-events-none"}>
                                                        <path d="M12 12l8-8V0H0v4l8 8v8l4-4v-4z"/>
                                                    </svg>

                                                    <select id="fieldMCPVersionType"
                                                            className={`w-full bg-transparent py-1 appearance-none`}
                                                            style={{textIndent: "2rem"}} onChange={event => {
                                                        setMCPVersionType(event.target.value);
                                                        let ver = getMCPVersionFromPart(mcpData, event.target.value, mcVersion.split("\.")[0], mcVersion.split("\.")[1]);
                                                        setMCPVersion(ver);
                                                    }}>
                                                        <option value={"snapshot"} className={"text-black"}>
                                                            Snapshot
                                                        </option>
                                                        <option value={"stable"} className={"text-black"}>
                                                            Stable
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`lg:w-1/2 text-center border-b border-gray-400`}>
                                    <div className={`px-4 py-2`}>
                                        <div className={`lg:flex flex-row`}>
                                            <label htmlFor={"fieldMCPVersion"} className={"flex-none text-2xl"}>
                                                MCP Version:
                                            </label>
                                            <div className={"flex-grow"}>
                                                <div className="relative my-auto pt-1 pl-3 pr-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                         className={"fill-current h-4 w-4 ml-2 my-2 absolute svg-icon pointer-events-none"}>
                                                        <path
                                                            d="M17 12h-6v4h1v4H8v-4h1v-4H3v4h1v4H0v-4h1v-4a2 2 0 0 1 2-2h6V6H7V0h6v6h-2v4h6a2 2 0 0 1 2 2v4h1v4h-4v-4h1v-4z"/>
                                                    </svg>

                                                    <select id="fieldMCPVersion"
                                                            className={`w-full bg-transparent py-1 appearance-none`}
                                                            style={{textIndent: "2rem"}} onChange={event => {
                                                        setMCPVersion(event.target.value);
                                                    }} value={mcpVersion}>
                                                        {makeMCPVersions(mcVersion, forgeVersions, mcpData, mcpVersionType)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id={"modOptions"}>
                            <h1 className={"text-2xl text-center mt-2"}>Mod Options</h1>
                            <div className={"lg:flex flex-row"}>
                                <div className={`lg:w-1/2 text-center border-b border-gray-400`}>
                                    <div className={`px-4 py-2`}>
                                        <div className={`lg:flex flex-row`}>
                                            <label htmlFor={"fieldModid"} className={"flex-none text-2xl"}>
                                                ModId:
                                            </label>
                                            <div className={"flex-grow"}>
                                                <div className="relative my-auto pt-1 pl-3 pr-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                         className={`fill-current h-4 w-4 ml-2 my-2 absolute svg-icon pointer-events-none transition-opacity duration-300 ${modid.value.trim().length ? `text-blue-500` : `text-red-500`} ${selectedField === "fieldModid" ? "opacity-0 ease-out" : `opacity-100 ease-in`}`}>
                                                        <path
                                                            d="M2 4v14h14v-6l2-2v10H0V2h10L8 4H2zm10.3-.3l4 4L8 16H4v-4l8.3-8.3zm1.4-1.4L16 0l4 4-2.3 2.3-4-4z"/>
                                                    </svg>
                                                    <input id="fieldModid" type={"text"} placeholder={"examplemod"}
                                                           className={"w-full bg-transparent py-1"}
                                                           value={modid.value}
                                                           style={{textIndent: "2rem"}}
                                                           onFocus={event => setSelectedField(event.target.id)}
                                                           onBlur={() => setSelectedField("")}
                                                           required={true}
                                                           onChange={event => {
                                                               setModid({
                                                                   changed: true,
                                                                   value: event.target.value.toLowerCase().replace(/\s/, "_")
                                                               });
                                                           }}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`lg:w-1/2 text-center border-b border-gray-400`}>
                                    <div className={`px-4 py-2`}>
                                        <div className={`lg:flex flex-row`}>
                                            <label htmlFor={"fieldDisplayName"} className={"flex-none text-2xl"}>
                                                Display Name:
                                            </label>
                                            <div className={"flex-grow"}>
                                                <div className="relative my-auto pt-1 pl-3 pr-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                         className={`fill-current h-4 w-4 ml-2 my-2 absolute svg-icon pointer-events-none transition-opacity duration-300 ${displayName.value.trim().length ? `text-blue-500` : `text-red-500`} ${selectedField === "fieldDisplayName" ? "opacity-0 ease-out" : "opacity-100 ease-in"}`}>
                                                        <path
                                                            d="M0 10V2l2-2h8l10 10-10 10L0 10zm4.5-4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                                                    </svg>
                                                    <input id="fieldDisplayName" type={"text"}
                                                           placeholder={"Example Mod"}
                                                           className={"w-full bg-transparent py-1"}
                                                           value={displayName.value}
                                                           style={{textIndent: "2rem"}}
                                                           onFocus={event => setSelectedField(event.target.id)}
                                                           onBlur={() => setSelectedField("")}
                                                           required={true}
                                                           onChange={event => {
                                                               setDisplayName({
                                                                   changed: true,
                                                                   value: event.target.value
                                                               });
                                                               if (!modid.changed) {
                                                                   setModid({
                                                                       changed: false,
                                                                       value: event.target.value.toLowerCase().replace(/\s/g, "")
                                                                   });
                                                               }
                                                           }}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={"lg:flex flex-row"}>
                                <div className={`lg:w-1/2 text-center border-b border-gray-400`}>
                                    <div className={`px-4 py-2`}>
                                        <div className={`lg:flex flex-row`}>
                                            <label htmlFor={"fieldGroup"} className={"flex-none text-2xl"}>
                                                Group:
                                            </label>
                                            <div className={"flex-grow"}>
                                                <div className="relative my-auto pt-1 pl-3 pr-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                         className={`fill-current h-4 w-4 ml-2 my-2 absolute svg-icon pointer-events-none transition-opacity duration-300 ${group.trim().length ? `text-blue-500` : `text-red-500`} ${selectedField === "fieldGroup" ? "opacity-0 ease-out" : `opacity-100 ease-in`}`}>
                                                        <path
                                                            d="M2 4v14h14v-6l2-2v10H0V2h10L8 4H2zm10.3-.3l4 4L8 16H4v-4l8.3-8.3zm1.4-1.4L16 0l4 4-2.3 2.3-4-4z"/>
                                                    </svg>
                                                    <input id="fieldGroup" type={"text"} placeholder={"com.example.mod"}
                                                           className={"w-full bg-transparent py-1"}
                                                           value={group}
                                                           style={{textIndent: "2rem"}}
                                                           onFocus={event => setSelectedField(event.target.id)}
                                                           onBlur={() => setSelectedField("")}
                                                           required={true}
                                                           onChange={event => {
                                                               setGroup(event.target.value);
                                                           }}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`lg:w-1/2 text-center border-b border-gray-400`}>
                                    <div className={`px-4 py-2`}>
                                        <div className={`lg:flex flex-row`}>
                                            <label htmlFor={"fieldArchiveName"} className={"flex-none text-2xl"}>
                                                Archive Name:
                                            </label>
                                            <div className={"flex-grow"}>
                                                <div className="relative my-auto pt-1 pl-3 pr-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                         className={`fill-current h-4 w-4 ml-2 my-2 absolute svg-icon pointer-events-none transition-opacity duration-300 ${archiveName.trim().length ? `text-blue-500` : `text-red-500`} ${selectedField === "fieldArchiveName" ? "opacity-0 ease-out" : "opacity-100 ease-in"}`}>
                                                        <path
                                                            d="M0 10V2l2-2h8l10 10-10 10L0 10zm4.5-4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                                                    </svg>
                                                    <input id="fieldArchiveName" type={"text"}
                                                           placeholder={`ExampleMod-${mcVersion}`}
                                                           className={"w-full bg-transparent py-1"}
                                                           value={archiveName}
                                                           style={{textIndent: "2rem"}}
                                                           onFocus={event => setSelectedField(event.target.id)}
                                                           onBlur={() => setSelectedField("")}
                                                           required={true}
                                                           onChange={event => {
                                                               setArchiveName(event.target.value);
                                                           }}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={"lg:flex flex-row"}>
                                <div className={`lg:w-1/2 text-center border-b border-gray-400`}>
                                    <div className={`px-4 py-2`}>
                                        <div className={`lg:flex flex-row`}>
                                            <label htmlFor={"fieldAuthors"} className={"flex-none text-2xl"}>
                                                Authors:
                                            </label>
                                            <div className={"flex-grow"}>
                                                <div className="relative my-auto pt-1 pl-3 pr-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                         className={`fill-current h-4 w-4 ml-2 my-2 absolute svg-icon pointer-events-none transition-opacity duration-300 ${authors.trim().length ? `text-blue-500` : ``} ${selectedField === "fieldAuthors" ? "opacity-0 ease-out" : "opacity-100 ease-in"}`}>
                                                        <path
                                                            d="M7 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 1c2.15 0 4.2.4 6.1 1.09L12 16h-1.25L10 20H4l-.75-4H2L.9 10.09A17.93 17.93 0 0 1 7 9zm8.31.17c1.32.18 2.59.48 3.8.92L18 16h-1.25L16 20h-3.96l.37-2h1.25l1.65-8.83zM13 0a4 4 0 1 1-1.33 7.76 5.96 5.96 0 0 0 0-7.52C12.1.1 12.53 0 13 0z"/>
                                                    </svg>
                                                    <input id="fieldAuthors" type={"text"}
                                                           placeholder={"Optional list of authors"}
                                                           className={"w-full bg-transparent py-1"}
                                                           value={authors}
                                                           style={{textIndent: "2rem"}}
                                                           onFocus={event => setSelectedField(event.target.id)}
                                                           onBlur={() => setSelectedField("")}
                                                           onChange={event => {
                                                               setAuthors(event.target.value);
                                                           }}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`lg:w-1/2 text-center border-b border-gray-400`}>
                                    <div className={`px-4 py-2`}>
                                        <div className={`lg:flex flex-row`}>
                                            <label htmlFor={"fieldCredits"} className={"flex-none text-2xl"}>
                                                Credits:
                                            </label>
                                            <div className={"flex-grow"}>
                                                <div className="relative my-auto pt-1 pl-3 pr-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                         className={`fill-current h-4 w-4 ml-2 my-2 absolute svg-icon pointer-events-none transition-opacity duration-300 ${credits.trim().length ? `text-blue-500` : ``} ${selectedField === "fieldCredits" ? "opacity-0 ease-out" : "opacity-100 ease-in"}`}>
                                                        <path
                                                            d="M1 4h2v2H1V4zm4 0h14v2H5V4zM1 9h2v2H1V9zm4 0h14v2H5V9zm-4 5h2v2H1v-2zm4 0h14v2H5v-2z"/>
                                                    </svg>
                                                    <input id="fieldCredits" type={"text"}
                                                           placeholder={"Optional list of credits"}
                                                           className={"w-full bg-transparent py-1"}
                                                           value={credits}
                                                           style={{textIndent: "2rem"}}
                                                           onFocus={event => setSelectedField(event.target.id)}
                                                           onBlur={() => setSelectedField("")}
                                                           onChange={event => {
                                                               setCredits(event.target.value);
                                                           }}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={"lg:flex flex-row"}>
                                <div className={`lg:w-1/2 text-center border-b border-gray-400`}>
                                    <div className={`px-4 py-2`}>
                                        <div className={`lg:flex flex-row`}>
                                            <label htmlFor={"fieldVendor"} className={"flex-none text-2xl"}>
                                                Vendor:
                                            </label>
                                            <div className={"flex-grow"}>
                                                <div className="relative my-auto pt-1 pl-3 pr-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                         className={`fill-current h-4 w-4 ml-2 my-2 absolute svg-icon pointer-events-none transition-opacity duration-300 ${vendor.trim().length ? `text-blue-500` : `text-red-500`} ${selectedField === "fieldVendor" ? "opacity-0 ease-out" : "opacity-100 ease-in"}`}>
                                                        <path
                                                            d="M5 5a5 5 0 0 1 10 0v2A5 5 0 0 1 5 7V5zM0 16.68A19.9 19.9 0 0 1 10 14c3.64 0 7.06.97 10 2.68V20H0v-3.32z"/>
                                                    </svg>
                                                    <input id="fieldVendor" type={"text"}
                                                           placeholder={"Used for the Jar file manifest"}
                                                           className={"w-full bg-transparent py-1"}
                                                           value={vendor}
                                                           style={{textIndent: "2rem"}}
                                                           onFocus={event => setSelectedField(event.target.id)}
                                                           onBlur={() => setSelectedField("")}
                                                           onChange={event => {
                                                               setVendor(event.target.value);
                                                           }}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`lg:w-1/2 text-center border-b border-gray-400`}>
                                    <div className={`px-4 py-2`}>
                                        <div className={`lg:flex flex-row`}>
                                            <label htmlFor={"fieldMaven"} className={"flex-none text-2xl"}>
                                                Maven Publishing:
                                            </label>
                                            <div className={"flex-grow"}>
                                                <div className="my-auto pt-1 pl-3 pr-4">
                                                    <button id="fieldMaven" type={"button"}
                                                            className={`w-full bg-transparent py-1 text-white transition-colors duration-300 ease-in-out ${maven ? `bg-green-500 hover:bg-green-700 focus:bg-green-700` : `bg-red-500 hover:bg-red-700 focus:bg-red-700`}`}
                                                            value={maven}
                                                            onFocus={event => setSelectedField(event.target.id)}
                                                            onBlur={() => setSelectedField("")}
                                                            onClick={event => {
                                                                setMaven(!maven);
                                                            }}
                                                    >
                                                        {maven ? "Enabled" : "Disabled"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={"lg:flex flex-row"}>
                                <div className={`lg:w-1/2 text-center border-b border-gray-400`}>
                                    <div className={`px-4 py-2`}>
                                        <div className={`lg:flex flex-row`}>
                                            <label htmlFor={"fieldLoggingMarkers"} className={"flex-none text-2xl"}>
                                                Logging Markers:
                                            </label>
                                            <div className={"flex-grow"}>
                                                <div className="my-auto pt-1 pl-3 pr-4">
                                                    <button id="fieldLoggingMarkers" type={"button"}
                                                            className={`w-full bg-transparent py-1 text-white transition-colors duration-300 ease-in-out ${loggingMarkers ? `bg-green-500 hover:bg-green-700 focus:bg-green-700` : `bg-red-500 hover:bg-red-700 focus:bg-red-700`}`}
                                                            value={loggingMarkers}
                                                            onFocus={event => setSelectedField(event.target.id)}
                                                            onBlur={() => setSelectedField("")}
                                                            onClick={event => {
                                                                setLoggingMarkers(!loggingMarkers);
                                                            }}
                                                    >
                                                        {loggingMarkers ? "Enabled" : "Disabled"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`lg:w-1/2 text-center border-b border-gray-400`}>
                                    <div className={`px-4 py-2`}>
                                        <div className={`lg:flex flex-row`}>
                                            <label htmlFor={"fieldDebugLogging"} className={"flex-none text-2xl"}>
                                                Debug Logging:
                                            </label>
                                            <div className={"flex-grow"}>
                                                <div className="my-auto pt-1 pl-3 pr-4">
                                                    <button id="fieldDebugLogging" type={"button"}
                                                            className={`w-full bg-transparent py-1 text-white transition-colors duration-300 ease-in-out ${debugLogging ? `bg-green-500 hover:bg-green-700 focus:bg-green-700` : `bg-red-500 hover:bg-red-700 focus:bg-red-700`}`}
                                                            value={debugLogging}
                                                            onFocus={event => setSelectedField(event.target.id)}
                                                            onBlur={() => setSelectedField("")}
                                                            onClick={event => {
                                                                setDebugLogging(!debugLogging);
                                                            }}
                                                    >
                                                        {debugLogging ? "Enabled" : "Disabled"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`mb-2`}>
                                <div className={`px-4 py-2 border-b border-gray-400`}>
                                    <div className={`lg:flex flex-row`}>
                                        <label htmlFor={"fieldDescription"} className={"flex-none text-2xl"}>
                                            Description:
                                        </label>
                                        <div className={`flex-grow`}>
                                            <div className="relative my-auto pt-1 pl-3 pr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                     className={`fill-current h-4 w-4 ml-2 my-2 absolute svg-icon pointer-events-none transition-opacity duration-300 ${description.trim().length ? `text-blue-500` : `text-red-500`} ${selectedField === "fieldDescription" ? "opacity-0 ease-out" : "opacity-100 ease-in"}`}>
                                                    <path
                                                        d="M7.03 2.6a3 3 0 0 1 5.94 0L15 3v1h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h1V3l2.03-.4zM5 6H4v12h12V6h-1v1H5V6zm5-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                                                </svg>
                                                <textarea id="fieldDescription"
                                                          placeholder={"Description of the project"}
                                                          className={"w-full bg-transparent py-1 min-h-32"}
                                                          value={description}
                                                          style={{textIndent: "2rem"}}
                                                          onFocus={event => setSelectedField(event.target.id)}
                                                          onBlur={() => setSelectedField("")}
                                                          onChange={event => {
                                                              setDescription(event.target.value);
                                                          }}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`text-center`}>
                            <div className={`px-4 py-2`}>
                                <div className="my-auto  pl-3 pr-4">
                                    <form method={"post"} action={"/api/generate"}>
                                        <input hidden={true} readOnly={true} value={uuidv4()} name={"id"}/>
                                        <input hidden={true} readOnly={true} value={mcVersion} name={"mcVersion"}/>
                                        <input hidden={true} readOnly={true} value={forgeVersion}
                                               name={"forgeVersion"}/>
                                        <input hidden={true} readOnly={true} value={mcpVersion}
                                               name={"mcpVersion"}/>
                                        <input hidden={true} readOnly={true} value={mcpVersionType}
                                               name={"mcpVersionType"}/>
                                        <input hidden={true} readOnly={true} value={modid.value}
                                               name={"modid"}/>
                                        <input hidden={true} readOnly={true} value={displayName.value}
                                               name={"displayName"}/>
                                        <input hidden={true} readOnly={true} value={authors}
                                               name={"authors"}/>
                                        <input hidden={true} readOnly={true} value={credits}
                                               name={"credits"}/>
                                        <input hidden={true} readOnly={true} value={group}
                                               name={"group"}/>
                                        <input hidden={true} readOnly={true} value={archiveName}
                                               name={"archiveName"}/>
                                        <input hidden={true} readOnly={true} value={vendor}
                                               name={"vendor"}/>
                                        <input hidden={true} readOnly={true} value={maven}
                                               name={"maven"}/>
                                        <input hidden={true} readOnly={true} value={loggingMarkers}
                                               name={"loggingMarkers"}/>
                                        <input hidden={true} readOnly={true} value={debugLogging}
                                               name={"debugLogging"}/>
                                        <input hidden={true} readOnly={true} value={description}
                                               name={"description"}/>
                                        <button type={"submit"}
                                                disabled={disabled}
                                                className={`${disabled ? `opacity-50 cursor-default bg-blue-500 hover:text-white hover:bg-blue-500` : `opacity-100 bg-blue-500 hover:bg-blue-700 focus:bg-blue-700 hover:text-gray-200 focus:text-gray-200`} w-full block p-4 text-white transition duration-300 ease-in-out`}>Download
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </ThemeContext.Provider>
    )
}


export async function getServerSideProps(ctx) {

    const minecraftVersionsLong = (await (await fetch("https://files.minecraftforge.net/maven/net/minecraftforge/forge/promotions_slim.json")).json())["promos"];
    let minecraftVersions = [];
    for (let index in minecraftVersionsLong) {
        if (index === "latest-1.7.10") {
            continue;
        }
        minecraftVersions.push(index.split("-")[0])
    }
    minecraftVersions = minecraftVersions.filter((value, index) => minecraftVersions.indexOf(value) === index);
    const mcpData = await (await fetch('http://export.mcpbot.bspk.rs/versions.json')).json();
    let forgeVersionsLong = await (await fetch("https://files.minecraftforge.net/maven/net/minecraftforge/forge/maven-metadata.xml")).text();
    let xml = await parseStringPromise(forgeVersionsLong);
    let forgeVersions = xml.metadata.versioning[0].versions["0"].version;
    let theme = parseCookies(ctx)["theme"];
    if (!theme) {
        theme = "light";
        setCookie(ctx, 'theme', theme, {
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });
    }
    return {
        props: {
            minecraftVersions: minecraftVersions.sort(compareVersion).reverse(),
            mcpData: mcpData,
            forgeVersions: forgeVersions.reverse(),
            themeVal: theme
        }
    }
}