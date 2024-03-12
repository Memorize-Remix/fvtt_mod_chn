// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';

import { collapseFolder } from '../partials/viewUtils.js';
import { DataSelector } from '../partials/DataSelector.js';
import { MainMenu } from '../mainMenu.js';
import { onDelete } from '../partials/delete.js';
import { onExport } from '../partials/export.js';
import { permsFilter } from '../partials/permsFilter.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                   Bulk Menu
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class DeleteExportApp extends Application {
	constructor(dialogData = {}, options = {}) {
		super(dialogData, options);
		this.data = dialogData;

		this.directory = null;

		// Instantiate listeners
		this.hookID = Hooks.on('renderSidebarTab', this._refreshContent.bind(this));
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: '批量任务',
			id: 'bulk-tasks-menu',
			classes: ['bulk-tasks-main'],
			template: `modules/${moduleName}/templates/bulkDeleteExport.hbs`,
			width: 580,
			height: 'auto',
			resizable: true,
			closeOnSubmit: false,
			tabs: [
				{ navSelector: '.tabs', contentSelector: 'form', initial: 'actors' },
			],
			filters: [
				{
					inputSelector: 'input[name="search"]',
					contentSelector: '.bm__directory-view-data',
				},
			],
		});
	}

	getData(options = {}) {
		// Get Directories
		const docTypes = {
			actors: game.actors.directory,
			cards: game.cards.directory,
			journal: game.journal.directory,
			items: game.items.directory,
			macros: game.macros.directory,
			scenes: game.scenes.directory,
			tables: game.tables.directory,
			playlists: game.playlists.directory,
		};

		// Construct self folder lists
		const directory = {};

		for (const docType in docTypes) {
			const folders = docTypes[docType].folders;

			// Add to directory
			directory[docType] = { folders: [], orphans: [] };

			folders.forEach(folder => {
				const temp = permsFilter(folder.contents);

				// Create our own object
				const customFolder = {
					id: folder.id,
					name: folder.name,
					content: temp,
					type: folder.type,
				};
				directory[docType].folders.push(customFolder);
			});

			// Add content not in folder
			const entities = docTypes[docType].documents;
			const noParent = permsFilter(
				entities.filter(e => e.folder === null)
			);

			directory[docType].orphans = [...noParent];
		}

		const data = directory;

		this.directory = directory;
		return data;
	}

	/**
	 * @param {*} $parent
	 */
	activateListeners($parent) {
		super.activateListeners($parent);

		// Data Selection
		const data = new DataSelector($parent);

		// On delete
		$parent.on('click', '#bm__btn--delete', async event => {
			await onDelete.call(this, [data.choices, data.folders]);
		});

		// On Export
		$parent.on('click', '#bm__btn--export', async event => {
			onExport(data.choices);
			data.choices.clear();
			this.render(true);
		});

		// TODO: Remove
		// On move
		$parent.on('click', '#bm__btn--move', async event => {
			new MoveMenu({}, {}, data.choices).render(true);
			this.close();
		});

		// TODO: Convert to back
		// On cancel
		$parent.on('click', '#bm__btn--cancel', event => {
			this.close();
			new MainMenu().render(true);
		});

		// Collapsible folders
		$parent.on('click', '.bm__btn--collapsible', $btn => {
			collapseFolder($btn);
		});
	}

	/**
	 * @param {*} event
	 * @param {*} query
	 * @param {*} rgx
	 * @param {*} $parent
	 */
	_onSearchFilter(event, query, rgx, $parent) {
		// Expand all folders on query
		for (const $f of $parent.querySelectorAll(
			'.bm__directory__folder-content:not(.bm--show)'
		)) {
			if (query) $f.style.display = 'block';
			else $f.style.display = 'none';
		}

		// Hide elements
		for (const $entity of $parent.querySelectorAll('.bm__directory__entity')) {
			if (!query) {
				$entity.classList.remove('bm--hidden');
				continue;
			}

			const title = $entity.querySelector(`.bm__directory__check`).dataset.name;
			const match = rgx.test(SearchFilter.cleanQuery(title));
			$entity.classList.toggle('bm--hidden', !match);
		}

		// Hide folders with no children
		for (const $entity of $parent.querySelectorAll('.bm__li')) {
			if (!query) {
				$entity.classList.remove('bm--hidden');
				continue;
			}

			const $content = $(
				$entity.querySelector('.bm__directory__folder-content')
			);
			const match = $content.children(':visible').length === 0;
			$entity.classList.toggle('bm--hidden', match);
		}
	}

	_refreshContent() {
		this.render(true);
	}

	async close() {
		Hooks.off('renderSidebarTab', this.hookID);
		super.close();
	}
}
