export function collapseFolder($btn) {
	const $content =
		$btn.currentTarget.parentElement.parentElement.nextElementSibling;

	if ($content.style.display === 'block') $content.style.display = 'none';
	else $content.style.display = 'block';
}
