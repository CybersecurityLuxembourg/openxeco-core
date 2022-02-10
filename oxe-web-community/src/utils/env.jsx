export function getApiURL() {
	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") {
		return "http://localhost:5000/";
	}
	return "https://api." + window.location.hostname.replace("www.", "").split(".").slice(1).join(".") + "/";
}

export function getGlobalAppURL() {
	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") {
		return "http://localhost:3002/";
	}
	return "https://" + window.location.hostname.replace("www.", "").split(".").slice(1).join(".") + "/";
}

export function getCookieOptions() {
	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") {
		return { domain: "localhost", path: "/" };
	}
	return {
		secure: true,
		domain: "." + window.location.hostname.replace("www.", "").split(".").slice(1).join("."),
		path: "/",
	};
}

export function isInternetExplorer() {
	const ua = window.navigator.userAgent;
	const msie = ua.indexOf("MSIE ");

	return msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./);
}
