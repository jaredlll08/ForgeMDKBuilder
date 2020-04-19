import React, {useRef, useState} from "react";
import Layout from "../components/Layout";
import fetch from 'node-fetch'
import {parseStringPromise} from 'xml2js';
import {v4 as uuidv4} from 'uuid';

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

export default function Home({minecraftVersions, mcpData, forgeVersions}) {

    function makeMCVersions(versions) {
        let arr = [];

        for (let index in versions) {
            arr.push(<option key={index} value={versions[index]}>{versions[index]}</option>)
        }
        return arr;
    }

    function makeForgeVersions(mcVersion, forgeVersions) {
        let arr = [];
        let filtered = forgeVersions.filter(value => {
            return value.split("-")[0] === mcVersion;
        });
        for (let index in filtered) {
            arr.push(<option key={index} value={filtered[index]}>{filtered[index]}</option>)
        }

        return arr;
    }

    function makeMCPVersions(mcVersion, forgeVersions, mcpData, mcpVersionType) {
        let arr = [];
        if (mcpData[mcVersion]) {
            let data = mcpData[mcVersion][mcpVersionType];
            if (data.length) {
                for (let index in data) {
                    arr.push(<option key={index}
                                     value={`${data[index]}-${mcVersion}`}>{data[index]}-{mcVersion}</option>)
                }
            } else {
                let major = mcVersion.split(".")[0];
                let minor = mcVersion.split(".")[1];
                let subData = makeMCPVersionsFromPart(mcpData, mcpVersionType, major, minor);
                if (subData.length) {
                    arr.push(subData);
                } else {
                    arr.push(<option key={"nodata"} value={"nodata"}>No data found!</option>)
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
                                     value={`${mcpData[data[index]][mcpVersionType][iindex]}-${data[index]}`}>{mcpData[data[index]][mcpVersionType][iindex]}-{data[index]}</option>)
                }
            }
        } else {
            arr.push(<option key={"none"} value={"none"}>No MCP data found!</option>)
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
    let disabled = modid.value.trim().length === 0 || displayName.value.trim().length === 0;
    return (
        <Layout>
            <div className={`flex w-2/3 mx-auto`}>
                <div className={`my-4 w-5/6 mx-auto bg-gray-200 border border-gray-700`}>
                    <div className={"text-center border-b border-gray-400 mb-2 px-4 py-2"}>
                        <h1 className={"text-2xl text-center"}>Welcome to the Forge MDK Builder!</h1>
                        <p className={`w-5/6 mx-auto text-xl `}>This website will help you quickly setup a Minecraft
                            Forge Development Environment without all the bloat that is included in the normal MDK</p>
                    </div>
                    <div id={"environmentOptions"}>
                        <h1 className={"text-2xl text-center"}>Environment Options</h1>
                        <div className={`text-center border-b border-gray-400 mb-2`}>
                            <div className={`px-4 py-2`}>
                                <div className={`flex flex-row`}>
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
                                            <select id="fieldMCVersion" className={`w-full bg-transparent py-1`}
                                                    style={{textIndent: "2rem"}} onChange={event =>
                                                setMCVersion(event.target.value)
                                            }>
                                                {makeMCVersions(minecraftVersions)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`text-center border-b border-gray-400 mb-2`}>
                            <div className={`px-4 py-2`}>
                                <div className={`flex flex-row`}>
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

                                            <select id="fieldForgeVersion" className={`w-full bg-transparent py-1`}
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
                        <div className={`flex flex-row mb-2`}>
                            <div className={`w-1/2 text-center border-b border-gray-400`}>
                                <div className={`px-4 py-2`}>
                                    <div className={`flex flex-row`}>
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
                                                        className={`w-full bg-transparent py-1`}
                                                        style={{textIndent: "2rem"}} onChange={event => {
                                                    setMCPVersionType(event.target.value);
                                                    let ver = getMCPVersionFromPart(mcpData, event.target.value, mcVersion.split("\.")[0], mcVersion.split("\.")[1]);
                                                    setMCPVersion(ver);
                                                }}>
                                                    <option value={"snapshot"}>
                                                        Snapshot
                                                    </option>
                                                    <option value={"stable"}>
                                                        Stable
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`w-1/2 text-center border-b border-gray-400`}>
                                <div className={`px-4 py-2`}>
                                    <div className={`flex flex-row`}>
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

                                                <select id="fieldMCPVersion" className={`w-full bg-transparent py-1`}
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
                        <h1 className={"text-2xl text-center"}>Mod Options</h1>
                        <div className={"flex flex-row mb-2"}>
                            <div className={`w-1/2 text-center border-b border-gray-400`}>
                                <div className={`px-4 py-2`}>
                                    <div className={`flex flex-row`}>
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
                                                <input id="fieldModid" type={"select"} placeholder={"examplemod"}
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
                            <div className={`w-1/2 text-center border-b border-gray-400`}>
                                <div className={`px-4 py-2`}>
                                    <div className={`flex flex-row`}>
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
                                                <input id="fieldDisplayName" type={"select"} placeholder={"Example Mod"}
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

                        <div className={"flex flex-row mb-2"}>
                            <div className={`w-1/2 text-center border-b border-gray-400`}>
                                <div className={`px-4 py-2`}>
                                    <div className={`flex flex-row`}>
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
                                                <input id="fieldAuthors" type={"select"}
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
                            <div className={`w-1/2 text-center border-b border-gray-400`}>
                                <div className={`px-4 py-2`}>
                                    <div className={`flex flex-row`}>
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
                                                <input id="fieldCredits" type={"select"}
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
                    </div>

                    <div className={`text-center mb-2`}>
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
                                    <button type={"submit"}
                                            disabled={disabled}
                                            className={`${disabled ? `opacity-50 cursor-default hover:text-white hover:bg-blue-500` : `opacity-100 hover:bg-blue-700 focus:bg-blue-700 hover:text-gray-200 focus:text-gray-200`} bg-blue-500 w-full block p-4 text-white transition-colors transition-opacity duration-300 ease-in-out`}>Download
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}


export async function getStaticProps() {

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
    let forgeVersionsLong = await (await fetch("https://blamejared.com/temp/maven-metadata.xml")).text();
    let xml = await parseStringPromise(forgeVersionsLong);
    let forgeVersions = xml.metadata.versioning[0].versions["0"].version;
    return {
        props: {
            minecraftVersions: minecraftVersions.sort(compareVersion).reverse(),
            mcpData: mcpData,
            forgeVersions: forgeVersions.reverse()
        }
    }
}