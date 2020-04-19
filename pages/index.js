import React, {useRef, useState} from "react";
import Layout from "../components/Layout";
import fetch from 'node-fetch'
import {parseStringPromise} from 'xml2js';
import {v4 as uuidv4} from 'uuid';
import axios from 'axios';
import download from 'downloadjs';

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
            }).reverse();
            for (let index in data) {
                for (let iindex in mcpData[data[index]][mcpVersionType]) {
                    return `${mcpData[data[index]][mcpVersionType][iindex]}-${data[index]}`;
                }
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


    const [mcVersion, setMCVersion] = useState(minecraftVersions[0]);
    const [forgeVersion, setForgeVersion] = useState(forgeVersions[0]);
    const [mcpVersionType, setMCPVersionType] = useState("snapshot");
    const [mcpVersion, setMCPVersion] = useState(getMCPVersionFromPart(mcpData, mcpVersionType, mcVersion.split("\.")[0], mcVersion.split("\.")[1]));
    return (
        <Layout>
            <div className={`flex w-2/3 mx-auto`}>
                <div className={`my-4 w-5/6 mx-auto bg-gray-200 border border-gray-700`}>
                    <div className={``}>
                        <div className={"text-center border-b border-gray-400 mb-2"}>
                            <div className={`px-4 py-2`}>
                                <h1 className={"text-2xl text-center"}>Welcome to the Forge MDK Builder!</h1>
                                <p className={`w-5/6 mx-auto text-xl `}>This website will help you quickly setup a
                                    Minecraft
                                    Forge Development Environment without all the bloat that is included in the normal
                                    MDK</p>
                            </div>
                        </div>
                        <div className={``}>
                            <div className={`text-center border-b border-gray-400 mb-2`}>
                                <div className={`px-4 py-2`}>
                                    <div className={`flex flex-row`}>
                                        <h1 className={"flex-none text-2xl"}>
                                            Minecraft Version:
                                        </h1>
                                        <div className={"flex-grow"}>
                                            <div className="relative my-auto pt-2 pl-3 pr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                     className={"fill-current h-4 w-4 ml-2 my-2 absolute svg-icon"}>
                                                    <path
                                                        d="M17 12h-6v4h1v4H8v-4h1v-4H3v4h1v4H0v-4h1v-4a2 2 0 0 1 2-2h6V6H7V0h6v6h-2v4h6a2 2 0 0 1 2 2v4h1v4h-4v-4h1v-4z"/>
                                                </svg>
                                                <select className={`w-full bg-transparent py-1`}
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
                        </div>
                        <div className={``}>
                            <div className={` text-center border-b border-gray-400 mb-2`}>
                                <div className={`px-4 py-2`}>
                                    <div className={`flex flex-row`}>
                                        <h1 className={"flex-none text-2xl"}>
                                            Forge Version:
                                        </h1>
                                        <div className={"flex-grow"}>
                                            <div className="relative my-auto pt-2 pl-3 pr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                     className={"fill-current h-4 w-4 ml-2 my-2 absolute svg-icon"}>
                                                    <path
                                                        d="M17 12h-6v4h1v4H8v-4h1v-4H3v4h1v4H0v-4h1v-4a2 2 0 0 1 2-2h6V6H7V0h6v6h-2v4h6a2 2 0 0 1 2 2v4h1v4h-4v-4h1v-4z"/>
                                                </svg>

                                                <select className={`w-full bg-transparent py-1`}
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
                        </div>
                        <div className={`flex flex-row`}>
                            <div className={`w-1/2 text-center border-b border-gray-400 mb-2`}>
                                <div className={`px-4 py-2`}>
                                    <div className={`flex flex-row`}>
                                        <h1 className={"flex-none text-2xl"}>
                                            MCP Version Type:
                                        </h1>
                                        <div className={"flex-grow"}>
                                            <div className="relative my-auto pt-2 pl-3 pr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                     className={"fill-current h-4 w-4 ml-2 my-2 absolute svg-icon"}>
                                                    <path d="M12 12l8-8V0H0v4l8 8v8l4-4v-4z"/>
                                                </svg>

                                                <select className={`w-full bg-transparent py-1`}
                                                        style={{textIndent: "2rem"}} onChange={event => {
                                                    setMCPVersionType(event.target.value);
                                                    setMCPVersion(getMCPVersionFromPart(mcpData, event.target.value, mcVersion.split("\.")[0], mcVersion.split("\.")[1]));
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
                            <div className={`w-1/2 text-center border-b border-gray-400 mb-2`}>
                                <div className={`px-4 py-2`}>
                                    <div className={`flex flex-row`}>
                                        <h1 className={"flex-none text-2xl"}>
                                            MCP Version:
                                        </h1>
                                        <div className={"flex-grow"}>
                                            <div className="relative my-auto pt-2 pl-3 pr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                     className={"fill-current h-4 w-4 ml-2 my-2 absolute svg-icon"}>
                                                    <path
                                                        d="M17 12h-6v4h1v4H8v-4h1v-4H3v4h1v4H0v-4h1v-4a2 2 0 0 1 2-2h6V6H7V0h6v6h-2v4h6a2 2 0 0 1 2 2v4h1v4h-4v-4h1v-4z"/>
                                                </svg>

                                                <select className={`w-full bg-transparent py-1`}
                                                        style={{textIndent: "2rem"}} onChange={event => {
                                                    setMCPVersion(event.target.value);
                                                }}>
                                                    {makeMCPVersions(mcVersion, forgeVersions, mcpData, mcpVersionType)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={``}>
                            <div className={`text-center mb-2`}>
                                <div className={`px-4 py-2`}>
                                    <div className="my-auto  pl-3 pr-4">
                                        <button
                                            className={"bg-blue-500 w-full block p-4 text-white hover:text-gray-200 hover:bg-blue-700 transition-colors duration-300 ease-in-out"}
                                            onClick={event => {

                                                axios.post("/api/generate", {
                                                    id: uuidv4(),
                                                    mcVersion: mcVersion,
                                                    forgeVersion: forgeVersion,
                                                    mcpVersion: mcpVersion,
                                                    mcpVersionType: mcpVersionType
                                                }).then(Response => {
                                                    download(Response.data, "FMDKB.zip", 'application/zip');
                                                })
                                            }}>Download
                                        </button>
                                    </div>
                                </div>
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