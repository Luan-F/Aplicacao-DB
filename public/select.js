export default function createSelect(rows_data){
	for(const row of rows_data){
		const row_data = row();
		const $btn = document.getElementById(row_data.prod_id);

		$btn.addEventListener('click', 
			(event) =>{		
				const $prod_id = document.getElementById("up_prod_id");
				const $prod_name = document.getElementById("up_prod_name"); 
				const $prod_price = document.getElementById("up_prod_price"); 
				const $prod_quant = document.getElementById("up_prod_quant"); 
				const $prod_cats = document.getElementById("up_prod_cats"); 

				$prod_id.value = row_data.prod_id;
				$prod_name.value = row_data.prod_name;
				$prod_price.value = row_data.prod_preco;
				$prod_quant.value = row_data.prod_quant;
				$prod_cats.value = row_data.prod_cat.join(', ');
			}
		);
	}
}
