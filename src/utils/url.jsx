export function getUrlParameter(sParam) {
	const sPageURL = window.location.search.substring(1);
	const sURLVariables = sPageURL.split("&");

	for (let i = 0; i < sURLVariables.length; i++) {
		const sParameterName = sURLVariables[i].split("=");

		if (sParameterName[0] === sParam) {
			return sParameterName[1];
		}
	}

	return null;
}

export function dictToURI(dict) {
	let args = "";

	if (dict !== null) {
		Object.keys(dict).forEach((key) => {
			if (typeof dict[key] === "boolean") {
				args += `${key}=${dict[key]}&`;
			} else if (typeof dict[key] === "string" && dict[key].length > 0) {
				args += `${key}=${dict[key]}&`;
			} else if (Array.isArray(dict[key]) && dict[key].length > 0) {
				args += `${key}=${dict[key].join(",")}&`;
			} else if (Number.isInteger(dict[key])) {
				args += `${key}=${dict[key]}&`;
			}
		});
	}

	return args;
}
