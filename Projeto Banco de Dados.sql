CREATE DATABASE identidadeproject;

USE identidadeproject;

CREATE TABLE Usuarios (
    	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    	nome VARCHAR(60) NOT NULL,
    	cpf CHAR(14) NOT NULL UNIQUE,
    	telefone CHAR(15) NOT NULL,
    	email VARCHAR(60) NOT NULL UNIQUE,
    	senha VARCHAR(255) NOT NULL,
        funcionario BOOLEAN NOT NULL,
        administrador BOOLEAN NOT NULL
);

CREATE TABLE Pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_cliente VARCHAR(255),
    cpf_cliente VARCHAR(14),
    email_cliente VARCHAR(255),
    telefone_cliente VARCHAR(15),
    produtos TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
    data_pedido DATETIME,
    status VARCHAR(50) DEFAULT 'A pagar',
    usuario_id INT, -- Referência à tabela de usuários
    FOREIGN KEY (usuario_id) REFERENCES Usuarios (id) -- Define a chave estrangeira
);

CREATE TABLE Fornecedores (
    	codigo_fornecedor INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    	nome VARCHAR(60) NOT NULL,
    	cnpj_cpf VARCHAR(18) NOT NULL UNIQUE
);

CREATE TABLE Produtos (
    codigo_produto INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    fk_fornecedor INT NOT NULL,
    nome VARCHAR(60) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    genero VARCHAR(9) NOT NULL,
    quant_estoque INT,
    descricao VARCHAR(256),
    preco NUMERIC(10, 2) NOT NULL,
    imagem BLOB NULL,
    tamanho VARCHAR(5),
    cor VARCHAR(25),
    FOREIGN KEY (fk_fornecedor) REFERENCES Fornecedores(codigo_fornecedor)
);
