function replaceName(name) {
	return name.slugify().replace(/([?:\/])/, '_');
}

export function onExport(data) {
	const zip = new JSZip();
	const documents = [...data].map(doc => game[doc.type].get(doc.id));
	console.log(documents);

	const folders = documents.reduce((acc, doc) => {
		let folder = doc.folder?._id;
		if (!folder) folder = 'root';

		acc[folder] ??= [];
		acc[folder].push(doc);
		return acc
	}, {});
	
	// Check if there are any folders
	if (Object.keys(folders).length > 0) {

		Object.keys(folders).forEach(folder => {
			let folderZip = zip;

			if (folder !== 'root') {
				const folderName = game.folders.get(folder).name;
				folderZip = zip.folder(folderName.slugify());
			}

			const docs = folders[folder];
			docs.forEach((doc) => {
				const data = doc.toCompendium(null);
				data.flags['exportSource'] = {
					world: game.world.id,
					system: game.system.id,
					coreVersion: game.version,
					systemVersion: game.system.version,
				};

				// Add file to zip
				folderZip.file(`${replaceName(doc.name)}.json`, JSON.stringify(data, null, 2));
			});
		});
	} else {
		documents.forEach((doc) => {
			const data = doc.toCompendium(null);
			data.flags['exportSource'] = {
				world: game.world.id,
				system: game.system.id,
				coreVersion: game.version,
				systemVersion: game.system.version,
			};

			// Add file to zip
			zip.file(`${replaceName(doc.name)}.json`, JSON.stringify(data, null, 2));
		});
	}

	// Download Zip
	console.log('Generating Zip');
	zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }).then(blob => {
		// Create an element to trigger the download
		let a = document.createElement('a');
		a.href = window.URL.createObjectURL(blob);
		a.download = 'bulk-tasks-export.zip';

		// Dispatch a click event to the element
		a.dispatchEvent(
			new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				view: window,
			})
		);
		setTimeout(() => window.URL.revokeObjectURL(a.href), 100);
	});
}