// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from './constants.js';

import { DeleteExportApp } from './apps/deleteExportApp.js';
import { ImportApp } from './apps/importApp.js';
import { MoveApp } from './apps/moveApp.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                   Application
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

export class MainMenu extends Application {
	constructor(dialogData = {}, options = {}) {
		super(dialogData, options);
		this.data = dialogData;
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: '批量任务',
			id: 'bulk-tasks-main-menu',
			classes: ['bulk-tasks-main'],
			template: `modules/${moduleName}/templates/mainMenu.hbs`,
			width: 780,
			height: 'auto',
			resizable: true,
			closeOnSubmit: false,
		});
	}

	getData(options = {}) {
		return null;
	}

	activateListeners($parent) {
		super.activateListeners($parent);

		// Make cards clickable
		const prefix = '#bm__task-card--';
		function navigate(app) {
			this.close();
			new app().render(true);
		}

		$(`${prefix}delete`).click(e => navigate.call(this, DeleteExportApp));
		$(`${prefix}export`).click(e => navigate.call(this, DeleteExportApp));
		$(`${prefix}import`).click(e => navigate.call(this, ImportApp));
		$(`${prefix}move`).click(e => navigate.call(this, MoveApp));
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
