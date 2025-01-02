import React from 'react'
import {BlobReader, BlobWriter, ZipReader} from '@zip.js/zip.js';
import ReactDOM from 'react-dom'
import ImageStack from "./ImageStack";

async function readData(entries) {
    const result = [...Array(entries.length)];
    for (let i = 0; i < entries.length; i++) {
        const data = await entries[i].getData(new BlobWriter());
        const url = URL.createObjectURL(data);
        result[i] = url;
    }
    return result;
}

async function getEntries(zipReader) {
    const entries = await zipReader.getEntries();
    return entries;
}

async function getBlobsByStrings(urls) {
    const result = [...Array(urls.length)];
    for (let i = 0; i < urls.length; i++) {
        const response = await fetch(urls[i]);
        result[i] = await response.blob();
    }
    return result;
}

function renderImgsFromBlobs(blobs) {
    const urls = [...Array(blobs.length)];
    blobs.map((blob, i) => {
        urls[i] = URL.createObjectURL(blob);
    });
    const domElement = document.getElementById("imgDiv");
    const root = ReactDOM.createRoot(domElement);
    root.render(<ImageStack urls={urls}></ImageStack>);
}

export default function SearchButton() {
    return (
        <>
            <button onClick={() => (
                fetch('http://localhost:8080/v1/zip', {method: "GET", headers: {'Content-Type': 'application/zip'}}))
                .then(raw => raw.blob())
                .then(async zip => {
                        const zipReader = new ZipReader(new BlobReader(zip));
                        const entries = await getEntries(zipReader);
                        const data = await readData(entries);
                        const blobs = await getBlobsByStrings(data);
                        renderImgsFromBlobs(blobs);
                    }
                ).catch(message => {
                    console.error(message)
                })}>Push me
            </button>
        </>
    );
}