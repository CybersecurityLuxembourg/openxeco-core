export function getApiURL() {
	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") {
		return "http://localhost:5000/";
	}
	if (window.location.hostname.includes("test")) {
		return "https://api.test-db.cy.lu/";
	}
	return "https://api.cybersecurity-luxembourg.com/";
}

export function getGlobalAppURL() {
	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") {
		return "http://localhost:3002/";
	}
	if (window.location.hostname.includes("test")) {
		return "https://test.cy.lu/";
	}
	return "https://cybersecurity-luxembourg.com/";
}

export function getEcosystemAppURL() {
	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") {
		return "http://localhost:3003/";
	}
	if (window.location.hostname.includes("test")) {
		return "https://test-eco.cy.lu/";
	}
	return "https://ecosystem.cybersecurity-luxembourg.com/";
}

export function getCookieOptions() {
	// TODO use httponly cookies
	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") {
		// return { httpOnly: true };
		return { domain: "localhost", path: "/" };
	}
	if (window.location.hostname.includes("test")) {
		// return { secure: true, domain: ".cy.lu" httpOnly: true };
		return { secure: true, domain: ".cy.lu", path: "/" };
	}
	// return { secure: true, domain: ".cy.lu", httpOnly: true };
	return { secure: true, domain: ".cybersecurity-luxembourg.lu", path: "/" };
}

export function isInternetExplorer() {
	const ua = window.navigator.userAgent;
	const msie = ua.indexOf("MSIE ");

	return msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./);
}
