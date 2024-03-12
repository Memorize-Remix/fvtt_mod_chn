// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from '../constants.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Single Select
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class DataSelector {
	constructor($parent) {
		this.choices = new Set();
		this.folders = new Set();
		this.lastChecked = null;

		// Initiate listeners
		$parent
			.find(`.bm__directory__check`)
			.on('change', this.singleSelect.bind(this));
		$parent
			.find(`.bm__check__folder`)
			.on('change', this.folderSelect.bind(this));
		$parent
			.find(`.bm__check__folder, .bm__directory__check`)
			.on('click', this.shiftSelect.bind(this));
		$parent.on('click', `.bm__selector__btn-sa`, this.selectAll.bind(this));
		$parent.on('click', `.bm__selector__btn-dsa`, this.deselectAll.bind(this));
	}

	// =================================================================
	//                          Single Select
	singleSelect($event) {
		const entity = $event.currentTarget.dataset;
		const isChecked = $event.currentTarget.checked;

		if (isChecked) this.choices.add(entity);
		else this.choices.delete(entity);
	}

	// =================================================================
	//                          Folder Select
	folderSelect($event) {
		const $content =
			$event.currentTarget.parentElement.nextElementSibling.children;
		const isChecked = $event.currentTarget.checked ? true : false;

		for (const $c of $content) {
			// Skip if hidden
			if ($c.classList.contains('bm--hidden')) continue;

			const $entity = $c.querySelector('.bm__directory__check');
			const data = $entity.dataset;

			$($entity).prop('checked', isChecked);
			if (isChecked) this.choices.add(data);
			else this.choices.delete(data);
		}

		if (isChecked) this.folders.add($event.currentTarget.dataset);
		else this.folders.delete($event.currentTarget.dataset);
	}

	// =================================================================
	//                          Shift Select
	shiftSelect($event) {
		if (!this.lastChecked) {
			this.lastChecked = $event.currentTarget;
			return;
		}

		// Get all checkboxes in scope
		const $section = $event.currentTarget.closest('.tab');
		const checks = [
			...$section.querySelectorAll(
				`.bm__li:not(.bm--hidden) > .bm__directory__folder > .bm__check__folder,
				 .bm__directory__check:not(.bm--hidden > .bm__directory__check)`
			),
		];

		if ($event.shiftKey) {
			const startTemp = checks.indexOf($event.currentTarget);
			const endTemp = checks.indexOf(this.lastChecked);

			const start = Math.min(startTemp, endTemp);
			const end = Math.max(startTemp, endTemp);

			for (let i = start; i <= end; i++) {
				// Check checkboxes but skip if not elements of the folder are selected.
				$(checks[i]).prop('checked', this.lastChecked.checked);

				const data = checks[i].dataset;

				// Skip if folder
				if (CONST.DOCUMENT_TYPES.includes(data.type)) continue;

				if (this.lastChecked.checked) this.choices.add(data);
				else this.choices.delete(data);
			}
		}

		this.lastChecked = $event.currentTarget;
	}

	// =================================================================
	//                          Select All
	selectAll($event) {
		const $section = $event.currentTarget.parentElement.parentElement;
		const $content = $section.querySelectorAll(`.bm__directory__check`);
		const $folders = $section.querySelectorAll(`.bm__check__folder`);

		// Select each element
		for (const $c of $content) {
			const data = $c.dataset;
			$($c).prop('checked', true);
			this.choices.add(data);
		}

		for (const $folder of $folders) $($folder).prop('checked', true);
	}

	// =================================================================
	//                         De-Select All
	deselectAll($event) {
		const $section = $event.currentTarget.parentElement.parentElement;
		const $content = $section.querySelectorAll(`.bm__directory__check`);
		const $folders = $section.querySelectorAll(`.bm__check__folder`);

		// Select each element
		for (const $c of $content) {
			const data = $c.dataset;
			$($c).prop('checked', false);
			this.choices.delete(data);
		}

		for (const $folder of $folders) $($folder).prop('checked', false);
	}
}
