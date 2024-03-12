import { moduleName } from '../constants.js';

export function permsFilter(inputArray) {
	return inputArray.filter(doc => hasPerms(doc));
}

/**
 * V9 Fallback
 * @returns {boolean}
 */
function hasPerms(doc) {
	const defaultPermDisplay = game.settings.get(
		moduleName,
		'defaultPermDisplay'
	);

	if (game.release.generation >= 10) {
		if (doc?.ownership)
			return doc.ownership.default == 3 || doc.ownership[game.user.id] == 3;

		if (defaultPermDisplay === 'gmOnly') return game.user.isGM;
		else return true;
	} else {
		if (doc?.data?.permission)
			return (
				doc.data.permission.default == 3 ||
				doc.data.permission[game.user.id] == 3
			);

		if (defaultPermDisplay === 'gmOnly') return game.user.isGM;
		else return true;
	}
}
