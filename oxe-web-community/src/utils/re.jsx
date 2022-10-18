export function validateEmail(mail) {
	if (mail === null || typeof mail === "undefined" || mail.length === 0) return false;
	const re = /@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(mail).toLowerCase()) || !mail;
}

export function validatePassword(password) {
	if (password === null || typeof password === "undefined" || password.length === 0) return false;
	return password.match(/(?=[A-Za-z0-9!@#$%^&*]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,}).*$/);
}

export function validateNotNull(value) {
	if (typeof value === "undefined" || value === null || value.length === 0) return false;
	return true;
}

export function validateUrlHandle(value) {
	if (typeof value === "undefined" || value === null || value.length === 0) return false;
	return value.match(/^[0-9a-z-_+]{4,100}$/);
}

export function validateArticleTitle(value) {
	if (typeof value === "undefined" || value === null || value.length === 0) return false;
	return value.length > 5 && value.length < 255;
}

export function validateTelephoneNumber(number) {
	if (number === null || typeof number === "undefined" || number.length === 0) return false;
	const re = /^(\+)?([0-9]){10,16}$/;
	return re.test(String(number)) || !number;
}

export function validateVatNumber(number) {
	if (number === null || typeof number === "undefined" || number.length === 0) return false;
	const re = /^(MT)?([0-9]){8}$/;
	return re.test(String(number).replace(/\s/g, "").toUpperCase()) || !number;
}

export function validateTradeReg(number) {
	if (number === null || typeof number === "undefined" || number.length === 0) return false;
	const re = /^(C)([0-9]){5}|(OC)([0-9]){4,5}|(P)([0-9]){4,5}$/;
	return re.test(String(number).replace(/\s/g, "").toUpperCase()) || !number;
}

export function validateTextWithSpaces(text) {
	if (text === null || typeof text === "undefined" || text.length === 0) return false;
	const re = /^[a-zA-Z\s]+$/;
	return re.test(String(text)) || !text;
}

export function validateWebsite(website) {
	if (website === null || typeof website === "undefined" || website.length === 0) return false;
	const re = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
	return re.test(String(website)) || !website;
}

export function validatePostcode(postcode) {
	if (postcode === null || typeof postcode === "undefined" || postcode.length === 0) return false;
	const re = /^[-a-zA-Z]{3}(\s)?[0-9]{4}$/;
	return re.test(String(postcode).toUpperCase()) || !postcode;
}
