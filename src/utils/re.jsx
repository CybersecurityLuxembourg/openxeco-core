export function validateEmail(mail) {
	if (mail === null || typeof mail === "undefined" || mail.length === 0) return false;
	const re = /@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(mail).toLowerCase()) || !mail;
}

export function validatePassword(password) {
	if (password === null || typeof password === "undefined" || password.length === 0) return false;
	return password.match(/^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&amp;*])).{8,30}$/);
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
