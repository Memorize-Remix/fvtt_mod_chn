// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';
import { MainMenu } from '../mainMenu.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Single Select
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class ImportApp extends Application {
	constructor(dialogData = {}, options = {}, selected = {}) {
		super(dialogData, options);

		this.data = dialogData;

		this.chosen = new Set();
		this.selected = CONST.DOCUMENT_LINK_TYPES.reduce(
			(o, key) => Object.assign(o, { [key]: new Set() }),
			{}
		);

		console.log(this.selected);
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: '批量导入',
			id: 'bulk-tasks-import',
			classes: ['bulk-tasks-main'],
			template: `modules/${moduleName}/templates/bulkImport.hbs`,
			width: 700,
			height: 'auto',
			resizable: true,
			closeOnSubmit: false,
		});
	}

	getData(options = {}) {
		const data = {};

		data.documentTypes = CONST.DOCUMENT_LINK_TYPES;
		data.chosen = [...this.chosen];

		// Filter Selected
		data.selected = this.selected;

		return data;
	}

	activateListeners($parent) {
		super.activateListeners($parent);

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// Showcase selected files.
		$parent.on('change', '#bm__import--files', event => {
			const files = [...event.currentTarget.files].filter(
				file => file.type === 'application/json'
			);

			// Add files to chosen.
			files.forEach(f => this.chosen.add(f));
			console.log(this.chosen);

			this.render(true);
		});

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// Queue Button
		$parent.on('click', '#bm__import--queue', event => {
			const selectMenu = event.currentTarget.previousElementSibling;
			const type = selectMenu.options[selectMenu.selectedIndex].value;

			this.chosen.forEach(f => {
				this.selected[type].add(f);
				this.chosen.delete(f);
			});

			// console.log(this.selected);
			this.render(true);
		});

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// X Choices Button
		$parent.on('click', '.bm__import--remove-choices', event => {
			const name = event.currentTarget.nextElementSibling.id;
			const toDelete = [...this.chosen].find(obj => obj.name === name);

			this.chosen.delete(toDelete);
			this.render(true);
		});

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// X Selected Button
		$parent.on('click', '.bm__import--remove-selected', event => {
			const name = event.currentTarget.nextElementSibling.id;
			const parent = event.currentTarget.nextElementSibling.dataset.parent;
			const toDelete = [...this.selected[parent]].find(
				obj => obj.name === name
			);

			this.selected[parent].delete(toDelete);
			this.render(true);
		});

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// Remove All Button
		$parent.on('click', '#bm__import--reset', event => {
			this.chosen.clear();
			for (const [type, files] of Object.entries(this.selected)) files.clear();
			this.render(true);
		});

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// Import Button
		$parent.on('click', '#bm__import--confirm', async event => {
			ui.notifications.info('导入文件。请耐心等待...');

			for (const [doc, files] of Object.entries(this.selected)) {
				[...files].forEach(async file => {
					readTextFromFile(file).then(async json => {

						// Construct a document class to (strictly) clean and validate the source data
						const tempDoc = new CONFIG[doc].constructor(JSON.parse(json), {strict: true});
						
						// Treat JSON import using the same workflows that are used when importing from a compendium pack
						const data = CONFIG[doc].collection.prototype.fromCompendium(tempDoc, {addFlags: false});

    				// Preserve certain fields from the destination document
    				const preserve = Object.fromEntries(
							CONFIG[doc].documentClass.metadata.preserveOnImport.map(k => {
    				  	return [k, foundry.utils.getProperty(this, k)];
    					})
						);
    				
						preserve.folder = this.folder?.id;
    				foundry.utils.mergeObject(data, preserve);

						// Create new document
						CONFIG[doc].documentClass.create(data);
					});
				});

				files.clear();
				this.render(true);
			}

			ui.notifications.info('导入完成');
		});

		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// TODO: Convert to back
		// On cancel
		$parent.on('click', '#bm--cancel', event => {
			this.close();
			new MainMenu().render(true);
		});
	}
}
