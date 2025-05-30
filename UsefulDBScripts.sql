SELECT *
FROM clientes c
JOIN pessoas p ON c.fk_pessoa = p.codigo_pessoa;
