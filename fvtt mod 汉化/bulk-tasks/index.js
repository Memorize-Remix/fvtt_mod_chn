// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleTag, moduleName } from './modules/constants.js';
import { MainMenu } from './modules/mainMenu.js';
import { registerSettings } from './modules/settings.mjs';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Main
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Hooks.on('init', async () => {
	await registerSettings();
	console.log(`${moduleTag} | Initialized.`);
});

Hooks.on('renderSidebarTab', async (app, html) => {
	addBulkButton(app, html);
});

Hooks.on('setup', async () => {
	console.log(`${moduleTag} | Setup Complete.`);
});

Hooks.on('ready', async () => {
	templateLoader();
	console.log(`${moduleTag} | Ready.`);
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Add Bulk button
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/**
 *
 * @param {*} app
 * @param {*} html
 * @returns
 */
function addBulkButton(app, html) {
	// Check for preferences
	const forGm = game.settings.get(moduleName, 'gmOnly');
	if (forGm && !game.user.isGM) {
		return;
	}

	if (
		[
			'scenes',
			'actors',
			'items',
			'journal',
			'tables',
			'cards',
			'playlists',
			'macros',
		].includes(app.tabName)
	) {
		let button = $(
			"<button class='bulk-tasks'><i class='fas fa-edit'></i></i>批量任务</button>"
		);

		button.click(async () => {
			// Render Menu
			// new BulkMenu().render(true);
			new MainMenu().render(true);
		});

		// Render Button
		$(html).find('.header-actions').append(button);
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                HandleBar Helpers
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Handlebars.registerHelper('notIsEmpty', (v1, options) => {
	if (v1.size !== 0) {
		return options.fn(v1);
	}

	return options.inverse(v1);
});

async function templateLoader() {
	await loadTemplates([
		'modules/bulk-tasks/templates/partials/directoryView.hbs',
		'modules/bulk-tasks/templates/partials/folderView.hbs',
		'modules/bulk-tasks/templates/partials/search.hbs',
		'modules/bulk-tasks/templates/partials/selectors.hbs',
	]);
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
