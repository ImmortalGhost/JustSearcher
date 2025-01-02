import React from "react";

function Image(props) {
    const loading = props.loading;
    const url = props.url;
    const enabled = props.enabled;
    if (loading) {
        return <div className="loadingDiv"><p className="loading">Loading...</p></div>
    } else {
        return <img src={url} width="200px" height="200px" className={enabled ? "" : "hidden"}></img>
    }
}

export default function SelectableImage({url, selected = false, enabled = false, onSelect = f => f, loading = false}) {
    console.log("selectableImage " + url);
    return <div className={selected && enabled ? "imageBorder selectedImage" : "imageBorder"} onClick={onSelect}>
        <Image loading={loading} url={url} enabled={enabled}/>
    </div>
}