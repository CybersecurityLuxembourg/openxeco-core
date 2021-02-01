

export function getApiURL() {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "")
        return "http://127.0.0.1:5000/";
    else
        return "https://api." + window.location.hostname + "/";
}

export function isInternetExplorer() {

    let ua = window.navigator.userAgent;
    let msie = ua.indexOf("MSIE ");

    return msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./);
}