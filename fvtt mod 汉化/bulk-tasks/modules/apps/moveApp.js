// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';

import { collapseFolder } from '../partials/viewUtils.js';
import { DataSelector } from '../partials/DataSelector.js';
import { MainMenu } from '../mainMenu.js';
import { permsFilter } from '../partials/permsFilter.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    MoveApp
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class MoveApp extends Application {
	constructor(dialogData = {}, options = {}) {
		super(dialogData, options);

		this.data = dialogData;
		this.directory = null;

		// Instantiate listeners
		this.hookID = Hooks.on('renderSidebarTab', this._refreshContent.bind(this));
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: '移动文件',
			id: 'bulk-tasks-move',
			classes: ['bulk-tasks-main'],
			template: `modules/${moduleName}/templates/bulkMove.hbs`,
			width: 750,
			height: 'auto',
			resizable: true,
			closeOnSubmit: false,
			tabs: [
				{ navSelector: '.tabs', contentSelector: 'form', initial: 'actors' },
			],
			filters: [
				{
					inputSelector: 'input[name="search"]',
					contentSelector:
						'.bm__directory-view-data, .bm__folder-directory-view-data',
				},
			],
		});
	}

	getData(options = {}) {
		const data = {};

		// Create Directory Data
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

		// +++++++++++++++++++++++++++++++++++++++++++
		// Construct self folder lists
		const directory = {};
		const foldersDir = {};

		for (const docType in docTypes) {
			const folders = docTypes[docType].folders;

			// Add to foldersDir
			foldersDir[docType] = folders
				.filter(f => f.permission === 3)
				.map(f => {
					return { id: f.id, name: f.name, type: f.type };
				});

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
			foldersDir[docType].push({
				id: docTypes[docType].tabName,
				name: 'root',
				type: game[docTypes[docType].tabName].documentName,
			});
		}

		data.directory = directory;
		this.directory = directory;
		data.foldersDir = foldersDir;

		console.log(data.directory);
		return data;
	}

	/**
	 * @param {Document} $parent
	 */
	activateListeners($parent) {
		super.activateListeners($parent);

		// Data Selection
		const data = new DataSelector($parent);

		// On move
		$parent.on('click', '#bm__btn--move', async (event) => {
			if (data.choices.size == 0)
				return ui.notifications.error('未选择要移动的文件。');

			// Get folder choices
			// const folders = [...$parent.find('.bm__radio__folder:checked')].map(
			// 	f => f.dataset
			// );

			const folders = [...$parent.find('.bm__move__folders')]
				.map(e => e.options[e.selectedIndex])
				.filter(e => e.value !== "")
				.map(e => e.dataset);

			if (folders.length == 0)
				return ui.notifications.error('未选择文件夹。');

			// Move
			const destFolders = new Map();
			folders.forEach(f => {
				const _f = game.folders.get(f.id);
				if (!_f && f.name === 'root') destFolders.set(f.id, null);
				else destFolders.set(_f.documentClass.collectionName, _f._id);
			});

			for await (const [collectionName, folderId] of destFolders.entries()) {
				const updates = [];

				data.choices.forEach((d) => {
					if (d.type !== collectionName) return;
					updates.push({_id: d.id, folder: folderId});
				});

				ui.notifications.info(`Moving ${updates.length} ${collectionName} documents.`);
				const documentClass = game[collectionName].documentClass;
				await documentClass.updateDocuments(updates);
				ui.notifications.info(`Moved ${updates.length} ${collectionName} documents.`);
			}
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
