CREATE TABLE Loja(
	cnpj BIGINT PRIMARY KEY,
	nome VARCHAR(32) NOT NULL
);

CREATE TABLE Produto(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(32) NOT NULL,
	especificacao TEXT NOT NULL	
);

CREATE TABLE Categoria(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(16) NOT NULL
);

CREATE TABLE Produto_Categoria(
	prod_id SERIAL NOT NULL,
	cat_id SERIAL NOT NULL,
	CONSTRAINT fk_prod_id FOREIGN KEY (prod_id) REFERENCES Produto(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_prod_cat FOREIGN KEY (cat_id) REFERENCES Categoria(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Catalogo(
	cnpj BIGINT,
	prod_id SERIAL,
	preco FLOAT NOT NULL,
	quantidade INT NOT NULL,
	detalhes TEXT,
	CONSTRAINT fk_cnpj FOREIGN KEY (cnpj) REFERENCES Loja(cnpj) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_prod_id FOREIGN KEY (prod_id) REFERENCES Produto(id) ON DELETE CASCADE ON UPDATE CASCADE,
	PRIMARY KEY(cnpj, prod_id)
);

-- Teste

INSERT INTO loja (cnpj, nome) VALUES(3921, 'loja1');

INSERT INTO categoria (nome) VALUES ('eletronicos');
INSERT INTO categoria (nome) VALUES ('video-game');

INSERT INTO produto (nome, especificacao) VALUES('htc vive', 'um óculos vr');

INSERT INTO produto_categoria (prod_id, cat_id) VALUES(2, 5);
INSERT INTO produto_categoria (prod_id, cat_id) VALUES(2, 6);

INSERT INTO catalogo (cnpj, prod_id, preco, quantidade) VALUES(3921, 2, 4999.90, 100);

-- Teste consulta

SELECT * FROM produto p1
JOIN catalogo c1 ON (c1.prod_id = p1.id)
JOIN produto_categoria pc1 ON (pc1.prod_id = p1.id)
WHERE p1.id = 2;
