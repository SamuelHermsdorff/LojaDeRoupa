INSERT INTO Fornecedores (nome, cnpj_cpf)
VALUES ('Fornecedor Moda Brasil', '12345678000199');

INSERT INTO Fornecedores (nome, cnpj_cpf) 
VALUES ('Fornecedor Joao Batista', '12345678000195');

INSERT INTO Fornecedores (nome, cnpj_cpf) 
VALUES ('Fornecedor Alpaca', '98765432000176');

INSERT INTO Produtos (fk_fornecedor, nome, tipo, genero, quant_estoque, descricao, preco, imagem, tamanho, cor) VALUES
(1, 'Camiseta Básica', 'Camiseta', 'Unissex', 50, 'Camiseta leve de algodão 100% nacional.', 59.90, NULL, 'M', 'Branco'),
(1, 'Vestido Florido', 'Vestido', 'Feminino', 30, 'Vestido casual com estampa floral e caimento leve.', 129.90, NULL, 'G', 'Azul'),
(1, 'Bermuda Jeans', 'Bermuda', 'Masculino', 20, 'Bermuda jeans com bolsos e lavagem moderna.', 99.90, NULL, 'G', 'Jeans'),
(1, 'Top Fitness', 'Top', 'Feminino', 25, 'Top esportivo com tecido respirável para treinos intensos.', 49.90, NULL, 'P', 'Preto'),
(1, 'Jaqueta Corta-Vento', 'Jaqueta', 'Unissex', 15, 'Jaqueta leve, ideal para ventos e chuvas leves.', 159.90, NULL, 'M', 'Vermelho'),
(1, 'Tênis Corrida Pro', 'Tênis', 'Masculino', 40, 'Tênis com amortecimento para alto desempenho.', 219.90, NULL, '42', 'Cinza'),
(1, 'Saia Plissada', 'Saia', 'Feminino', 18, 'Saia com corte plissado e tecido leve.', 89.90, NULL, 'M', 'Bege'),
(1, 'Regata Dry Fit', 'Camiseta', 'Masculino', 35, 'Regata com tecnologia dry fit para atividades físicas.', 39.90, NULL, 'G', 'Verde'),
(1, 'Calça Moletom', 'Calça', 'Unissex', 45, 'Moletom com bolso canguru e ajuste na cintura.', 109.90, NULL, 'G', 'Cinza'),
(1, 'Macacão Casual', 'Macacão', 'Feminino', 12, 'Macacão de malha macia, perfeito para o dia a dia.', 149.90, NULL, 'M', 'Preto');
