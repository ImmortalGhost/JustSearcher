import React, {createRef, useState} from 'react';
import ImageStack from "./ImageStack";
import {BlobReader, BlobWriter, ZipReader, ZipWriter} from "@zip.js/zip.js";
import configs from "../json/configs"

async function getEntries(zipReader) {
    const entries = await zipReader.getEntries();
    return entries;
}

async function readData(entries) {
    const result = [...Array(entries.length)];
    for (let i = 0; i < entries.length; i++) {
        const data = await entries[i].getData(new BlobWriter());
        const url = URL.createObjectURL(data);
        result[i] = url;
    }
    return result;
}

async function getBlobsByStrings(urls) {
    const result = [...Array(urls.length)];
    for (let i = 0; i < urls.length; i++) {
        const response = await fetch(urls[i]);
        result[i] = await response.blob();
    }
    return result;
}

function checkCollisions(arrayToCheck) {
    for (let i = 0; i < arrayToCheck.length; i++) {
        const elementA = arrayToCheck[i];
        for (let j = (i + 1); j < arrayToCheck.length; j++) {
            const elementB = arrayToCheck[j];
            if (elementA == elementB) {
                return false;
            }
        }
    }
    return true;
}

function checkIfContainsEmpty(arrayToCheck) {
    for (let i = 0; i < arrayToCheck.length; i++) {
        if (arrayToCheck[i] == "") {
            return false;
        }
    }
    return true;
}

async function makeZipFromBlobs(blobs, searchTexts) {
    var zipWriter = new ZipWriter(new BlobWriter("application/zip"), {
        bufferedWrite: true,
        useCompressionStream: false
    });
    blobs.map(async (blob, i) => {
        URL.createObjectURL(blob);
        await zipWriter.add("searchResult/" + searchTexts[i] + "/cover.jpg", new BlobReader(blob));
    });
    const urlZip = URL.createObjectURL(await zipWriter.close());
    return urlZip;
}

function storeZip(zipUrl) {
    const anchor = document.createElement("a");
    const clickEvent = new MouseEvent("click");
    anchor.href = zipUrl;
    anchor.download = "searchResult.zip";
    anchor.dispatchEvent(clickEvent);
}

function initControls(searchData, setIsDownloadEnabled, setIsSearchEnabled, setIsAddEnabled, setIsGlobalLoading) {
    let allDataLoaded = true;
    for (let j = 0; j < searchData.length; j++) {
        if (searchData[j].loading) {
            allDataLoaded = false;
        }
    }
    if (allDataLoaded) {
        setIsDownloadEnabled(true);
        setIsSearchEnabled(false);
        setIsAddEnabled(true);
        setIsGlobalLoading(false);
    }
}

async function requestBack(searchElement, i, searchData, updateSearchData, setIsSearchEnabled, setIsAddEnabled,
                           setIsDownloadEnabled, setIsGlobalLoading, backendUrl) {
    fetch(backendUrl + "/v1/searchImages/" + searchElement.searchText,
        {method: "GET", headers: {'Content-Type': 'application/zip'}})
        .then(response => response.blob())
        .then(async zip => {
                const zipReader = new ZipReader(new BlobReader(zip));
                const entries = await getEntries(zipReader);
                alert("!!!!!!" + entries[0].filename);
                const urls = await readData(entries);
                searchElement.urls = urls;
                searchElement.selectedUrl = urls[0];
                searchElement.enabled = true;
                searchElement.loading = false;
                updateSearchData(i, searchElement);
                searchElement.searchTextChanged = false;
                initControls(searchData, setIsDownloadEnabled, setIsSearchEnabled, setIsAddEnabled, setIsGlobalLoading);
            }
        ).catch(errorMessage => {
        searchElement.enabled = false;
        searchElement.loading = false;
        updateSearchData(i, searchElement);
        initControls(searchData, setIsDownloadEnabled, setIsSearchEnabled, setIsAddEnabled, setIsGlobalLoading);
        alert("Image '" + searchElement.searchText + "' + not found, details (" +
            errorMessage + ")");
    });
}

function Main() {
    const backendUrl = configs.backend;
    const [index, setIndex] = useState(0);
    const [searchData, setSearchData] = useState([]);
    const [addEnabled, setIsAddEnabled] = useState(true);
    const [downloadEnabled, setIsDownloadEnabled] = useState(false);
    const [searchEnabled, setIsSearchEnabled] = useState(false);
    const [globalLoading, setIsGlobalLoading] = useState(false);
    const searchTextRef = createRef();
    const addButtonRef = createRef();
    const searchButtonRef = createRef();
    const updateSearchData = (index, element) => {
        let oldArray = [...searchData];
        const updatedElement = element;
        oldArray[index] = updatedElement;
        setSearchData(oldArray);
    };
    return (
        <div>
            <div className="images">
                {searchData.map((searchComponent, i) => {
                    return <ImageStack
                        searchText={searchComponent.searchText}
                        urls={searchComponent.urls}
                        searchTextChanged={(event) => {
                            searchComponent.searchText = event.target.value;
                            searchComponent.searchTextChanged = true;
                            updateSearchData(i, searchComponent);
                            setIsDownloadEnabled(false);
                            setIsSearchEnabled(true);
                        }}
                        selectedUrlChanged={(url) => {
                            if (searchComponent.enabled) {
                                searchComponent.selectedUrl = url;
                            } else {
                                searchComponent.selectedUrl = "";
                            }
                            updateSearchData(i, searchComponent);
                        }}
                        componentRemoved={() => {
                            const newSearchData = searchData.filter(searchComponent => searchComponent.id !== i);
                            let allDataEnabled = true;
                            for (let j = 0; j < newSearchData.length; j++) {
                                newSearchData[j].id = j;
                                newSearchData[j].selectedUrl = newSearchData[j].urls[0];
                                newSearchData[j].selectedNumber = 0;
                                if (!newSearchData[j].enabled) {
                                    allDataEnabled = false;
                                }
                            }
                            setIndex(newSearchData.length);
                            if (allDataEnabled) {
                                setIsDownloadEnabled(true);
                            }
                            if (newSearchData.length === 0) {
                                setIsSearchEnabled(false);
                                setIsDownloadEnabled(false);
                            }
                            setSearchData(newSearchData);
                        }}
                        enabled={searchComponent.enabled}
                        searchTextRef={searchTextRef}
                        refUsed={searchComponent.refUsed}
                        refUsedChanged={(isUsed) => {
                            searchComponent.refUsed = isUsed;
                            updateSearchData(i, searchComponent);
                        }}
                        onKeyDown={(event) => {
                            if (event.key == "Tab" && !event.shiftKey && i == searchData.length - 1) {
                                event.preventDefault();
                                addButtonRef.current.click();
                            } else if (event.key == "Enter" && searchEnabled) {
                                searchButtonRef.current.click();
                            }
                        }}
                        selectedNumber={searchComponent.selectedNumber}
                        setSelectedNumber={(onFocusNumber) => {
                            searchComponent.selectedNumber = onFocusNumber;
                            updateSearchData(i, searchComponent);
                        }}
                        loading={searchComponent.loading}
                        globalLoading={globalLoading}
                    />;
                })}
            </div>
            <div className="controls">
                <button className="controlElement"
                        ref={addButtonRef}
                        disabled={!addEnabled}
                        onClick={() => {
                            setSearchData([...searchData, {
                                id: index,
                                searchText: "",
                                urls: [],
                                selectedUrl: "",
                                enabled: false,
                                refUsed: true,
                                selectedNumber: 0,
                                searchTextChanged: false,
                                loading: false
                            }]);
                            setIndex(index + 1);
                            setIsDownloadEnabled(false);
                        }}>Add new
                </button>

                <button className="controlElement" disabled={!searchEnabled} ref={searchButtonRef}
                        onClick={() => {
                            const searchTexts = [...Array(searchData.length)];
                            searchData.map((searchElement, i) => {
                                searchTexts[i] = searchElement.searchText;
                            });
                            if (!checkCollisions(searchTexts)) {
                                alert("There shouldn't be duplicates in search texts!");
                                return;
                            }
                            if (!checkIfContainsEmpty(searchTexts)) {
                                alert("There shouldn't be empty search texts!");
                                return;
                            }
                            let someTextChanged = false;
                            for (let i = 0; i < searchData.length; i++) {
                                if (searchData[i].searchTextChanged) {
                                    someTextChanged = true;
                                }
                            }
                            if (someTextChanged) {
                                setIsGlobalLoading(true);
                            } else {
                                setIsGlobalLoading(false);
                                return;
                            }
                            searchData.map(async (searchElement, i) => {
                                if (!searchElement.searchTextChanged) {
                                    return;
                                }
                                searchElement.enabled = false;
                                searchElement.loading = true;
                                updateSearchData(i, searchElement);
                                setIsAddEnabled(false);
                                setIsSearchEnabled(false);
                                setIsDownloadEnabled(false);

                                await requestBack(searchElement, i, searchData, updateSearchData, setIsSearchEnabled,
                                    setIsAddEnabled, setIsDownloadEnabled, setIsGlobalLoading, backendUrl);
                            });

                        }}>Search

                </button>
                <button className="controlElement" disabled={!downloadEnabled} onClick={async () => {
                    let urls = [];
                    let searchTexts = [];
                    searchData.filter(element => element.enabled).map((searchElement, i) => {
                        urls = [...urls, searchElement.selectedUrl];
                        searchTexts = [...searchTexts, searchElement.searchText];
                    });
                    if (!checkCollisions(searchTexts)) {
                        alert("There shouldn't be duplicates in search texts!");
                        return;
                    }
                    const blobs = await getBlobsByStrings(urls);
                    const urlZip = await makeZipFromBlobs(blobs, searchTexts);
                    storeZip(urlZip);
                }}>Download
                </button>
            </div>
        </div>
    );
}

export default Main;