export default function startButtons(socket){
	const $formCNPJ = document.getElementById("cnpj_form");
	let cnpj = -999;

	const $add_prod  = document.getElementById("add_prod");
	const $update_prod  = document.getElementById("update_prod");
	const $rm_prod  = document.getElementById("rm_prod");	

	$formCNPJ.addEventListener('submit', (event) =>{
		event.preventDefault();
	
		const $inputCNPJ = document.getElementById("cnpj_input");
		const $inputName = document.getElementById("name_input");
		console.log('cnpj ', cnpj);

		if(cnpj !== ''){
			const cnpj_value = $inputCNPJ.value;
			cnpj = cnpj_value;
			const name = $inputName.value;

			socket.emit('checkShop', cnpj);
			socket.on('checkShop', (res) =>{
				console.log(res);
				if(res === null){
					console.log('name ', name);
					console.log('cnpj ', cnpj);
					socket.emit('createShop', cnpj, name);
				}

				$formCNPJ.style.display = 'none';
				const $content = document.getElementById("content");
				$content.style.display = '';
				const $cnpj = document.getElementById("cnpj");
				$cnpj.innerHTML = `Seu CNPJ: ${cnpj}`;
				socket.emit('getAllProductsFrom', cnpj);
			});
		}
	});

	$add_prod.addEventListener('submit', (event) => {
		event.preventDefault();

		const $prod_name = document.getElementById("add_prod_name"); 
		const $prod_cats = document.getElementById("add_prod_cats"); 
		const $prod_price = document.getElementById("add_prod_price"); 
		const $prod_quant = document.getElementById("add_prod_quant"); 

		const name = $prod_name.value;

		const cats = $prod_cats.value.replace(/\s/g, '').split(',');
		
		const price = $prod_price.value;
		
		const quant = $prod_quant.value;

//		console.log(name);
//		console.log(cats);
//		console.log(price);
//		console.log(quant);
//		console.log(cnpj);

		if(quant !== '' && price !== '' && name !== '' && cnpj > 0){
			$prod_name.value = '';
			$prod_cats.value = '';
			$prod_price.value = '';
			$prod_quant.value = '';
			socket.emit('add_prod', name, cats, price, quant, cnpj);
		}
		else{
			alert('Erro, o nome, pre??o e quantidade do produto s??o obrigat??rios.');
		}
	});

	$update_prod.addEventListener('submit', (event) => {
		event.preventDefault();

		const $prod_id = document.getElementById("up_prod_id");
		const $prod_name = document.getElementById("up_prod_name"); 
		const $prod_price = document.getElementById("up_prod_price"); 
		const $prod_quant = document.getElementById("up_prod_quant"); 
		const $prod_cats = document.getElementById("up_prod_cats"); 

		const id = $prod_id.value;
		const name = $prod_name.value;
		const price = $prod_price.value;
		const quant = $prod_quant.value;
		const cats = $prod_cats.value.replace(/\s/g, '').split(',');
		
		console.log(cats);

		if(id === ''){
			alert('O ID do produto ?? obrigat??rio.');
		}
		else if(name === '' && price === '' && quant === '' && cats.length < 0){
			alert('Por favor, preencha um dos campo al??m do ID.');
		}
		else{
			$prod_id.value = '';
			$prod_name.value = '';
			$prod_price.value = '';
			$prod_quant.value = '';
			$prod_cats.value = '';
			socket.emit('update_prod', cnpj, id, name, price, quant, cats);
		}
	});

	$rm_prod.addEventListener('submit', (event) => {
		event.preventDefault();

		const $prod_id = document.getElementById("rm_prod_id"); 

		const id = $prod_id.value;

		if(id !== ''){
			$prod_id.value = '';
			socket.emit('rm_prod', cnpj, id);
		}
		else{
			alert('Erro, insira o ID do produto.');
		}
	});
}
