import { getApiURL } from "./env.jsx";

export async function getRequest(url, callback, catchBadResponse, catchError) {
	fetch(getApiURL() + url, {
		method: "GET",
		headers: new Headers({
			Accept: "application/json, text/html",
			pragma: "no-cache",
			"cache-control": "no-cache",
		}),
		credentials: "include",
	}).then((response) => {
		if (response.status === 200) {
			return response.json();
		}
		if (response.status === 403) {
			window.location.replace("/?status=expiredSession");
		}
		if (catchBadResponse !== null) {
			catchBadResponse(response);
			throw new Error(null);
		}
		throw new Error("An error happened while requesting the server");
	}).then((jsonBody) => {
		if (typeof jsonBody !== "undefined") callback(jsonBody);
	}).catch((error) => {
		if (error.message !== "null") {
			catchError(error);
		}
	});
}

export async function getBlobRequest(url, callback, catchBadResponse, catchError) {
	fetch(getApiURL() + url, {
		method: "GET",
		headers: new Headers({
			Accept: "application/json, text/html",
			pragma: "no-cache",
			"cache-control": "no-cache",
		}),
		credentials: "include",
	}).then((response) => {
		if (response.status === 200) {
			return response.blob();
		}
		if (response.status === 403) {
			window.location.replace("/?status=expiredSession");
		}
		if (catchBadResponse !== null) {
			catchBadResponse(response);
			throw new Error(null);
		}
		throw new Error("An error happened while requesting the server");
	}).then((blob) => {
		if (typeof blob !== "undefined") callback(blob);
	}).catch((error) => {
		if (error.message !== "null") {
			catchError(error);
		}
	});
}

export async function postRequest(url, params, callback, catchBadResponse, catchError) {
	fetch(getApiURL() + url, {
		method: "POST",
		body: JSON.stringify(params),
		headers: new Headers({
			Accept: "application/json, text/html",
			"Content-Type": "application/json",
		}),
		credentials: "include",
	}).then((response) => {
		if (response.status === 200) {
			return response.json();
		}
		if (response.status === 403) {
			window.location.replace("/?status=expiredSession");
		}
		if (catchBadResponse !== null) {
			catchBadResponse(response);
			throw new Error(null);
		}
		throw new Error("An error happened while requesting the server");
	}).then((jsonBody) => {
		if (typeof jsonBody !== "undefined") callback(jsonBody);
	}).catch((error) => {
		if (error.message !== "null") {
			catchError(error);
		}
	});
}

export async function getForeignRequest(url, callback, catchBadResponse, catchError) {
	fetch(url, {
		method: "GET",
		mode: "cors",
		headers: {
			Accept: "application/json, text/html",
			"Access-Control-Allow-Headers": "Access-Control-Allow-Headers, "
                + "Origin,Accept, "
                + "X-Requested-With, "
                + "Content-Type, "
                + "Access-Control-Request-Method, "
                + "Access-Control-Request-Headers, "
                + "Access-Control-Allow-Origin, "
                + "Access-Control-Allow-Credentials",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET,OPTIONS,HEAD",
			"Access-Control-Allow-Credentials": "true",
			pragma: "no-cache",
			"cache-control": "no-cache",
		},
	}).then((response) => {
		if (response.status === 200) {
			return response.json();
		}
		if (response.status === 403) {
			window.location.replace("/?status=expiredSession");
		}
		if (catchBadResponse !== null) {
			catchBadResponse(response);
			throw new Error(response.error);
		}
		throw new Error("An error happened while requesting the server");
	}).then((jsonBody) => {
		if (typeof jsonBody !== "undefined") callback(jsonBody);
	}).catch((error) => {
		catchError(error);
	});
}
