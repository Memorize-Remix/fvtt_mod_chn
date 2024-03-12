// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                 Helper Functions
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const debounceReload = debounce(() => window.location.reload(), 100);

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Settings
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export async function registerSettings() {
	await game.settings.register(moduleName, 'gmOnly', {
		name: 'BM.Settings.gmOnly',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false,
		onChange: debounceReload,
	});

	await game.settings.register(moduleName, 'defaultPermDisplay', {
		name: 'BM.Settings.permDefaultName',
		scope: 'world',
		config: true,
		type: String,
		choices: {
			gmOnly: 'BM.Settings.permDefaultGMOnly',
			all: 'BM.Settings.permDefaultAll',
		},
		default: 'gmOnly',
	});
}
