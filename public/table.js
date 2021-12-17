export default function createTable(columns, rows, add_select = true){
	let table = '<tr>';

	if(add_select){
		table += `<td></td>`;
	}
	for(const type of columns){
		table += `<td>${type[1]}</td>`;
	}
	table += '</tr>';

	const sets = {};

	let i = 0;

	// O primeiro elemento do array columns deve ser o id
	for(const row of rows){
		const id = row[columns[0][0]];
		if(sets[id] === undefined){
			sets[id] = row;
			sets[id].prod_cat = [ row.prod_cat ];
		}
		else{
			sets[id].prod_cat.push(row.prod_cat);
		}
	}

	const row_data = [];

	for(const key in sets){
		const val = sets[key];
		table += '<tr>';

		if(add_select){
			table += `<td><button id=${val.prod_id}>Selecionar</button></td>`;
			row_data.push(
				function select(){
					const values = val;

					return val;
				}
			);
		}
		for(const col of columns){
			let value = val[col[0]];
			if(value.join !== undefined){
				value = value.join(', ');
			}
			table += `<td>${value}</td>`;
		}
		table += '</tr>';
	}

	return { table, row_data };
}
