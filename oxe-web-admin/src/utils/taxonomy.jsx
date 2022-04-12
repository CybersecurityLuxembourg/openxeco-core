// eslint-disable-next-line import/prefer-default-export
export function getCategory(taxonomies, categoryName) {
	if (categoryName && taxonomies) {
		const categories = taxonomies.categories
			.filter((c) => c.name === categoryName);

		if (categories.length > 0) {
			return categories[0];
		}

		return null;
	}

	return null;
}
