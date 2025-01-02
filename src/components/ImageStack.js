import React, {useEffect} from "react";
import SelectableImage from "./SelectableImage";

function getImages(urls, length, selectedNumber, setSelectedNumber, enabled, selectedUrlChanged, loading) {
    const result = [...Array(length)];
    for (let i = 0; i < length; i++) {
        result[i] = <SelectableImage
            url={urls[i]}
            selected={selectedNumber == i}
            onSelect={() => {
                setSelectedNumber(i);
                selectedUrlChanged(urls[i])
            }}
            enabled={enabled}
            loading={loading}
        />;
    }
    return result;
}

export default function ImageStack({
                                       urls = [], length = 4, searchText = "", searchTextChanged, enabled,
                                       selectedUrlChanged, componentRemoved, searchTextRef, refUsed,
                                       refUsedChanged, onKeyDown, selectedNumber, setSelectedNumber,
                                       loading, globalLoading
                                   }) {
    useEffect(() => {
        if (refUsed) {
            searchTextRef.current.focus();
            refUsedChanged(false);
        }
    });
    return (
        <div className="imageStackDiv">
            <div className="searchTextDiv">
                <input className="searchText" value={searchText} onChange={searchTextChanged} ref={searchTextRef}
                       onKeyDown={onKeyDown}/>
                <button className="controlElement componentOptions" tabIndex={-1} disabled={globalLoading}
                        onClick={() => {
                            componentRemoved();
                        }}>X
                </button>
            </div>
            <div className="componentOptions">

            </div>
            <div className="imageDiv">
                {getImages(urls, length, selectedNumber, setSelectedNumber, enabled, selectedUrlChanged, loading)}
            </div>
        </div>
    );
}