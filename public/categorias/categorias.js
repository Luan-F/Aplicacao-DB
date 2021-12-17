export default function startForms(socket){
	const $add_cat = document.getElementById('add_cat');
	const $rm_cat = document.getElementById('rm_cat');

	$add_cat.addEventListener('submit', (event) => {
		event.preventDefault();

		const $cat_name = document.getElementById("add_cat_name");
	
		const name = $cat_name.value.toLowerCase();
		$cat_name.value = '';

		console.log(name);

		socket.emit('add_cat', name);
	});

	$rm_cat.addEventListener('submit', (event) => {
		event.preventDefault();

		const $cat_id = document.getElementById("rm_cat_id");
	
		const id = $cat_id.value;
		$cat_id.value = '';

		console.log(id);

		socket.emit('rm_cat', id);
	});
}
