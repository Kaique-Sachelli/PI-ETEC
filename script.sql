SELECT @@default_storage_engine ;
CREATE SCHEMA agendamento_lab ;
USE  agendamento_lab;

-- tabelas primárias
DROP TABLE IF EXISTS Usuario;
CREATE TABLE Usuario (
	idUsuario INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL,
    email VARCHAR(45) NOT NULL UNIQUE,
	senha VARCHAR(70) NOT NULL,
    permissao ENUM('Administrador', 'Tecnico', 'Professor') NOT NULL
);
DESCRIBE Usuario;

DROP TABLE IF EXISTS Laboratorio;
CREATE TABLE Laboratorio(
	idLaboratorio INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    sala VARCHAR(3)
);

DROP TABLE IF EXISTS Agendamento;
CREATE TABLE Agendamento(
	idAgendamento INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    dataAgendamento DATE NOT NULL,
    idLaboratorio INT NOT NULL,
    idUsuario INT NOT NULL,
     statusAgendamento ENUM('Pendente', 'Aprovado', 'Cancelado','Finalizado') NOT NULL DEFAULT 'Pendente',
    
    
    FOREIGN KEY(idLaboratorio)
    REFERENCES Laboratorio (idLaboratorio)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
	FOREIGN KEY(idUsuario)
    REFERENCES Usuario (idUsuario)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
DESCRIBE Agendamento;

DROP TABLE IF EXISTS Vidrarias;
CREATE TABLE Vidrarias(
	idVidraria INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nomeVidraria VARCHAR(45) NOT NULL,
    detalhes VARCHAR(250),
    capacidade VARCHAR(10) NOT NULL,
    quantidade SMALLINT NOT NULL
);
DESCRIBE Vidrarias;

DROP TABLE IF EXISTS Reagentes;
CREATE TABLE Reagentes(
	idReagente INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	nomeReagente VARCHAR(45) NOT NULL,
    quantidade DECIMAL(7,2) NOT NULL,
    divisao ENUM('A19', 'A20', 'A5', 'A6', 'I', 'II', 'III', 'IV', 'IX', 'V')
);

DROP TABLE IF EXISTS Kits;
CREATE TABLE Kits(
	idKit INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    idUsuario INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descrição VARCHAR(200),
    
    FOREIGN KEY(idUsuario)
    REFERENCES Usuario (idUsuario)
);
DROP TABLE IF EXISTS Kits_Vidrarias;
CREATE TABLE Kits_Vidrarias(
	idKit INT NOT NULL,
    idVidraria INT NOT NULL,
    quantidade SMALLINT NOT NULL,
    
    PRIMARY KEY(idKit, idVidraria),
    
    FOREIGN KEY(idKit)
    REFERENCES Kits (idKit)
	ON DELETE RESTRICT ON UPDATE CASCADE,

    
    FOREIGN KEY(idVidraria)
    REFERENCES Vidrarias (idVidraria)
	ON DELETE RESTRICT ON UPDATE CASCADE

);

DROP TABLE IF EXISTS Kits_Reagentes;
CREATE TABLE Kits_Reagentes(
	idKit INT NOT NULL,
    idReagente INT NOT NULL,
	quantidade DECIMAL(7,2) NOT NULL,

    
    PRIMARY KEY(idKit, idReagente),
    
    FOREIGN KEY(idKit)
    REFERENCES Kits (idKit)
	ON DELETE RESTRICT ON UPDATE CASCADE,

    
    FOREIGN KEY(idReagente)
    REFERENCES Reagentes (idReagente)
	ON DELETE RESTRICT ON UPDATE CASCADE

);

DROP TABLE IF EXISTS Solicitacoes;
CREATE TABLE Solicitacoes(
	idSolicitacao INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	idUsuario INT NOT NULL,
	dataPedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statusPedido ENUM('Pendente', 'Aprovada', 'Reprovada', 'Pedido_Realizado', 'Concluida') NOT NULL DEFAULT 'Pendente',
    observacao TEXT,
	FOREIGN KEY(idUsuario)
    REFERENCES Usuario (idUsuario)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- relacionamento Solicitiacoes
CREATE TABLE Solicitacoes_Vidrarias(
	idSolicitacao INT NOT NULL,
    idVidraria INT NOT NULL,
    quantidade SMALLINT NOT NULL,
    
    PRIMARY KEY(idSolicitacao, idVidraria),
    
	FOREIGN KEY(idSolicitacao)
    REFERENCES Solicitacoes (idSolicitacao)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
	FOREIGN KEY(idVidraria)
    REFERENCES Vidrarias (idVidraria)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

DROP TABLE IF EXISTS Solicitacoes_Reagentes;
CREATE TABLE Solicitacoes_Reagentes (
    idSolicitacao INT NOT NULL,
    idReagente INT NOT NULL,
    quantidadeSolicitada DECIMAL(7,2) NOT NULL,
    
    PRIMARY KEY(idSolicitacao, idReagente),
    
    FOREIGN KEY(idSolicitacao)
    REFERENCES Solicitacoes (idSolicitacao)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
    FOREIGN KEY(idReagente)
    REFERENCES Reagentes (idReagente)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
USE agendamento_lab;

INSERT INTO Vidrarias (nomeVidraria, detalhes, capacidade, quantidade) VALUES
('Bagueta', 'Vidro', 'N/A', 10),
('Balão de fundo chata', NULL, '250ml', 4),
('Balão volumétrico', NULL, '2000ml', 1),
('Balão volumétrico', NULL, '1000ml', 1),
('Balão volumétrico', NULL, '250ml', 15),
('Balão volumétrico', NULL, '200ml', 1),
('Balão volumétrico', NULL, '100ml', 12),
('Balão volumétrico', NULL, '50ml', 22),
('Balão volumétrico', NULL, '25ml', 1),
('Balão volumétrico', NULL, '10ml', 20),
('Balão volumétrico', NULL, '5ml', 43),
('Béquer de plástico', NULL, '2000ml', 1),
('Béquer de plástico', NULL, '1000ml', 1),
('Béquer de plástico', NULL, '600ml', 2),
('Béquer de plástico', NULL, '400ml', 1),
('Béquer de vidro', NULL, '2000ml', 1),
('Béquer de vidro', NULL, '600ml', 5),
('Béquer de vidro', NULL, '500ml', 8),
('Béquer de vidro', NULL, '250ml', 44),
('Béquer de vidro', NULL, '100ml', 36),
('Béquer de vidro', NULL, '50ml', 31),
('Béquer de vidro', NULL, '10ml', 10),
('Béquer de vidro', NULL, '5ml', 7),
('Bico de busen', NULL, 'N/A', 8),
('Bureta (saída lateral)', NULL, '100ml', 1),
('Bureta', NULL, '50ml', 1),
('Cadinho Groooch', NULL, '10ml', 6),
('Cadinho Porcelana', NULL, 'N/A', 9),
('Cadinho vidro com placa porosa', NULL, 'N/A', 4),
('Cápsula de porcelana', NULL, 'N/A', 4),
('Copo graduado', NULL, '500ml', 1),
('Copo graduado', NULL, '250ml', 7),
('Copo graduado', NULL, '60ml', 4),
('Erlenmeyer de boca larga', NULL, '250ml', 10),
('Escova de limpeza', 'grande', 'N/A', 3),
('Fita de ph', '1 Caixa', 'N/A', 1),
('Funil de bunchner', 'grande', 'N/A', 1),
('Funil de bunchner', 'pequeno', 'N/A', 2),
('Frasco Saybolt', NULL, '60ml', 4),
('Junta conectante adaptadora', '24/40', 'N/A', 7),
('Garra para bureta', 'unitária', 'N/A', 1),
('Garra para bureta', 'dupla', 'N/A', 7);
SELECT * FROM vidrarias;

INSERT INTO Reagentes (nomeReagente, quantidade) VALUES
('Amido Solúvel', 500),
('Biftalato de Potássio', 500),
('Carbonato de Sódio', 400),
('Cloreto de Potássio', 500),
('Cloreto de Sódio', 700),
('Iodeto de Potássio', 350),
('Lauril Sulfato de sódio', 200),
('Nitrato de Prata', 15),
('Sulfato de Alúminio', 500),
('Tiossulfato de Sódio', 400);
SELECT * FROM Reagentes;
INSERT INTO usuario (nome, email, senha, permissao) VALUES ("adm", "teste@etec.com", "$2b$10$DSRABGLTNKHdOauEu3oYoOz6SGCrJlJOFMvdQMiz54F.zf69F0nda", "Administrador"); -- senha 123 em hash 10
INSERT INTO usuario (nome, email, senha, permissao) VALUES ("adm", "teste2@etec.com", "123", "Administrador"); -- senha 123 em hash 10

SELECT * FROM usuario;

SELECT idReagente, nomeReagente,quantidade FROM Reagentes WHERE quantidade > 0;
SELECT idVidraria,nomeVidraria,capacidade,quantidade FROM Vidrarias WHERE quantidade > 0;
USE agendamento_lab;
SELECT * FROM kits;
DESCRIBE reagentes;
SELECT * FROM reagentes WHERE idReagente = 1;