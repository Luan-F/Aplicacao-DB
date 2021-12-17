const { Client }= require('pg');

const client = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false
	}
});

client.connect();

function checkShop(cnpj, callback){
	client.query("Select * FROM loja WHERE cnpj=$1", [cnpj], callback);
}

function createShop(cnpj, name){
	client.query("INSERT INTO loja (cnpj, nome) VALUES($1, $2)", [cnpj, name], (err, res) => {
		if(err){
			console.log(`Error on createShop ${err}`);
		}
	});
}

function getAllProducts(callback){
	client.query('SELECT p1.id prod_id, p1.nome prod_name, c2.nome prod_cat, c1.quantidade prod_quant, c1.preco prod_preco FROM produto p1 JOIN catalogo c1 ON (p1.id = c1.prod_id) JOIN produto_categoria pc1 ON (pc1.prod_id = p1.id) JOIN categoria c2 ON (pc1.cat_id = c2.id);',
		(err, res) => {
				callback(err, res);
		}
	);
}

function getAllProductsFrom(cnpj, callback){
	client.query('SELECT p1.id prod_id, p1.nome prod_name, c2.nome prod_cat, c1.quantidade prod_quant, c1.preco prod_preco FROM produto p1 JOIN catalogo c1 ON (p1.id = c1.prod_id) JOIN produto_categoria pc1 ON (pc1.prod_id = p1.id) JOIN categoria c2 ON (pc1.cat_id = c2.id) WHERE c1.cnpj=$1;', [cnpj],
		(err, res) => {
				callback(err, res);
		}
	);
}

function getAllCategorys(callback){
	client.query('SELECT id cat_id, nome cat_name FROM categoria;', (err, res) => {
		callback(err, res);
	});
}

function insertProdCat(prod_id, cat_id, errorHandle){
	client.query('INSERT INTO produto_categoria (prod_id, cat_id) VALUES($1, $2)', [prod_id ,cat_id],
		(err, res) => {
			if(err){
				console.log(`> Error on insert prod_cat ${err}`);
				errorHandle();
				return;
			};
		}
	);
}

function selectCatsId(names, callback, errorHandle, done){
	console.log(names);
	let i = 0;
	for( ; i < names.length-1 ; i++){
		let name = names[i];
		client.query('SELECT id FROM categoria WHERE nome=$1', [name],
			(err, res) => {
				if(err){
					console.log(`> Error on search cat ${err}`);
					errorHandle();
				}
				else{
					callback(res.rows[0].id);
				}
			}
		);	
	}

	if(names.length > 0){
		let name = names[i];
		client.query('SELECT id FROM categoria WHERE nome=$1', [name],
			(err, res) => {
				if(err){
					console.log(`> Error on search cat ${err}`);
					errorHandle();
				}
				else{
					if(res.rows.length > 0){
						callback(res.rows[0].id);
					}
					done();
				}
			}
		);
	}
	else{
		done();
	}
}

function insertCatalog(cnpj, prod_id, price, quant, errorHandle){
	client.query('INSERT INTO catalogo (cnpj, prod_id, preco, quantidade) VALUES($1, $2, $3, $4)', [cnpj, prod_id, price, quant],
		(err, res) => {
			if(err){
				console.log(`> Error on instering on catalogo ${err}`);
				errorHandle();
				return;
			}
		}
	);
}

function  insertProduct(name, callback, errorHandle) {
	client.query("INSERT INTO produto (nome, especificacao) VALUES($1, 'teste') RETURNING id", [name],
		(err, res) => {
			if(err){
				console.log(err);
				errorHandle();
				return;
			}
			else{
				callback(res.rows[0].id);
			}
		}
	);
}

function rollback(){
	client.query("ROLLBACK");
}

function commit(){
	client.query("COMMIT");
}

function addProduct(name, cats, price, quant, cnpj, callback){
	let prod_id;

	client.query("BEGIN", (err, res) => {
			if(err) {
				console.log(`Error on add_prod (BEGIN) ${err}`);
				rollback();
				return;
			}
			else{
				insertProduct(name, (prod_id) => {
						insertCatalog(cnpj, prod_id, price, quant, rollback);
						selectCatsId(cats, (cat_id) => {
							insertProdCat(prod_id, cat_id, rollback);
						}, rollback, () => {
							commit();
							callback();
						});
				}, rollback);
			}
		}
	);
}

function rmProduct(id, callback){
	client.query('DELETE FROM produto WHERE id=$1;'
		, [id]
		, (err, res) => {
			callback(err, res);
		}
	);
}

function updateProduct(id, name, price, quant, cats, callback){
	console.log(cats);
	if(name !== ''){
		client.query('UPDATE produto SET nome = $2 WHERE id = $1', [id, name], (err, res) => {
			callback(err, res);
		});
	}

	if(price !== ''){	
		client.query('UPDATE catalogo SET preco = $2 WHERE prod_id = $1', [id, price], (err, res) => {
			callback(err, res);
		});
	}
	if(quant !== ''){
		client.query('UPDATE catalogo SET quantidade = $2 WHERE prod_id = $1', [id, quant], (err, res) => {
			callback(err, res);
		});
	}

	if(cats.length > 0){
		client.query('BEGIN', (err, res) =>{
			client.query('DELETE FROM produto_categoria WHERE prod_id=$1', [id], (err, res) => {
				if(err){
					console.log(`Error on updateProduct(delete categorys) ${err}`);
					client.query('ROLLBACK');
				}
				else{
						client.query('SELECT * FROM categoria;', (err, res) => {
							if(err){
								console.log(`Error on updateProduct(select categorys) ${err}`);
								client.query('ROLLBACK');
							}
							else{
								const rows = res.rows;
								const id_name_cat = {};
								for(const row of rows){
									for(const cat of cats){
										if(row.nome === cat){ 
											id_name_cat[cat] = row.id;
										}
									}
								}
								for(const cat_name in id_name_cat){
	
									client.query('INSERT INTO produto_categoria (prod_id, cat_id) VALUES($1, $2)', [id, id_name_cat[cat_name]], (err, res) => {
										if(err){
											console.log(`Error on updateProduct(insert category) ${err}`);
											client.query('ROLLBACK');
										}
										else{
	
										}
									})
								}
								callback(err, res);
							}
						});
				}
			});
		});
	}
}

function addCategory(name, callback){
	client.query('INSERT INTO categoria (nome) VALUES($1);', [name], 
		(err, res) => {
			callback(err, res);
		}
	);
}

function rmCategory(id, callback){
	client.query('DELETE FROM categoria WHERE id=$1;'
		, [id]
		, (err, res) => {
			callback(err, res);
		}
	);
}

function getAllT(callback){
	client.query('SELECT * FROM produtos p1 JOIN precos p2 USING(prod_id) JOIN estoque e1 USING(prod_id);', 
		(err, res) => {
			callback(err, res);
	});
}

function getAll(tableName, callback){
	client.query(`SELECT * FROM ${tableName};`,
		(err, res) => {
			callback(err, res);
		}
	);
}

function getProduct(type, value, callback){
	client.query(`SELECT * FROM produtos WHERE ${type}=$1`,
		[value],	
		(err, res) => {
			callback(err, res);
		}
	);
}

//function addProduct(name, category, callback){
//	client.query('INSERT INTO produtos(prod_name, prod_cat) VALUES($1, $2);',
//		[name, category],
//		(err, res) => {
//			callback(err, res)
//		}
//	);
//}

function checkUser(login, callback){
	client.query('SELECT login, password FROM usuario WHERE login=$1', [login], callback);
}

module.exports = {
	checkShop,
	createShop,
	getAllProducts,
	getAllProductsFrom,
	getAllCategorys,
	addProduct,
	rmProduct,
	updateProduct,
	addCategory,
	rmCategory,
	getAllT,
	getAll,
	getProduct,	
	checkUser
};
