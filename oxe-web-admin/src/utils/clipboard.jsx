import { NotificationManager as nm } from "react-notifications";

export default function copyToClipboard(text) {
	const dummy = document.createElement("input");
	document.body.appendChild(dummy);
	dummy.value = text;
	dummy.select();
	dummy.setSelectionRange(0, 99999);
	document.execCommand("copy");
	document.body.removeChild(dummy);
	nm.info("Copied to clipboard!");
}
