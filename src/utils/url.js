
export function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }

    return null;
}

export function dictToURI(dict) {
	let args = ""
	
	if (dict !== null) {
		Object.keys(dict).forEach(key => {
		   	if (typeof dict[key] === "boolean" && dict[key])
				args += key + "=" + dict[key] + "&"
			if (typeof dict[key] === "string" && dict[key].length > 0)
				args += key + "=" + dict[key] + "&"
			if (Array.isArray(dict[key]) && dict[key].length > 0)
				args += key + "=" + dict[key].join(",") + "&"
		});
	}

	return args
}