// eslint-disable-next-line import/prefer-default-export
export function getSettingValue(settings, property) {
	if (settings) {
		const filteredSettings = settings.filter((s) => s.property === property);

		if (filteredSettings.length > 0) {
			return filteredSettings[0].value;
		}

		return null;
	}

	return null;
}
