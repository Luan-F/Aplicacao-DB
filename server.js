require('dotenv').config();

const { Server } = require('socket.io');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const sockets = new Server(server);

const db = require('./db.js');

app.use(express.static('public'));

const getAllProducts = socket => {
	db.getAllProducts((err, res) => {
		if(err){
			console.log(err);
		}
		else{
			socket.emit('getAll', res.rows);
		}
	});
}

const getAllProductsFrom = (cnpj, socket) => {
	db.getAllProductsFrom(cnpj, (err, res) => {
		if(err){
			console.log(err);
		}
		else{
			socket.emit('getAll', res.rows);
		}
	});
}

const getAllCategorys = socket => {
	db.getAllCategorys((err, res) => {
		if(err){
			console.log(err);
		}
		else{
			socket.emit('getAll', res.rows);
		}
	});
}

sockets.on('connection', socket => {
	const id = socket.id;

	socket.on('checkShop', (cnpj) => {
		db.checkShop(cnpj, (err, res) =>{
			if(err){
				console.log(`Error on checkShop ${err}`);
			}
			else{
				socket.emit('checkShop', res.rows[0]);
			}
		});
	});

	socket.on('createShop', (cnpj, name) => {
		db.createShop(cnpj, name);
	});

	socket.on('getAllProducts', () => {
		getAllProducts(socket);
	});

	socket.on('getAllProductsFrom', cnpj => {
		getAllProductsFrom(cnpj, socket);
	});

	socket.on('getAllCategorys', () => {
		getAllCategorys(socket);
	});

	socket.on('add_prod', (name, cats, price, quant, cnpj) => {
		db.addProduct(name, cats, price, quant, cnpj, () =>{
			console.log(cnpj, 'produto adicionado');
			if(cnpj === 3921){
				getAllProducts(socket);
			}
			else{
				getAllProductsFrom(cnpj, socket);
			}
		});
	});

	socket.on('update_prod', (cnpj, id, name, price, quant, cats) => {
		db.updateProduct(id, name, price, quant, cats, () => {
			if(cnpj === 3921){
				getAllProducts(socket);
			}
			else{
				getAllProductsFrom(cnpj, socket);
			}
		});
	});

	socket.on('rm_prod', (cnpj, id) => {
		db.rmProduct(id, (err, res) => {
			if(err){
				console.log(`Error on rm_prod ${err}`);
			}
			else{
				console.log('Remoção feita com sucesso');
				if(cnpj === 3921){
					getAllProducts(socket);
				}
				else{
					getAllProductsFrom(cnpj, socket);
				}
			}
		});
	});
	
	socket.on('add_cat', (name) => {
		db.addCategory(name, (err, res) => {
			if(err){
				console.log(`Error on add_prod ${err}`);
			}
			else{
				getAllCategorys(socket);
			}
		});
	});
	
	socket.on('rm_cat',  (id) => {
		db.rmCategory(id, (err, res) => {
			if(err){
				console.log(`Error on rm_prod ${err}`);
			}
			else{
				getAllCategorys(socket);
			}
		});
	});
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
	console.log('> Connected');
	console.log(`> Listen ${port}`);
});
