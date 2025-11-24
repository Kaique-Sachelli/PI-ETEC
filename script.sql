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

DROP TABLE IF EXISTS Kits;
CREATE TABLE Kits(
	idKit INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    idUsuario INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descrição VARCHAR(200),
    
    FOREIGN KEY(idUsuario)
    REFERENCES Usuario (idUsuario)
);

DROP TABLE IF EXISTS Agendamento;
CREATE TABLE Agendamento(
	idAgendamento INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    dataAgendamento DATE NOT NULL,
    periodoAgendamento ENUM('Matutino','Vespertino', 'Noturno') NOT NULL,
    aula ENUM('1ª Aula', '2ª Aula', '3ª Aula', '4ª Aula', '5ª Aula', '6ª Aula') NOT NULL,
    idLaboratorio INT NOT NULL,
    idUsuario INT NOT NULL,
    idKit INT NOT NULL,
	statusAgendamento ENUM('Pendente', 'Aprovado', 'Cancelado','Finalizado') NOT NULL DEFAULT 'Pendente',
    
    
    FOREIGN KEY(idLaboratorio)
    REFERENCES Laboratorio (idLaboratorio)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
	FOREIGN KEY(idUsuario)
    REFERENCES Usuario (idUsuario)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
    FOREIGN KEY(idKit)
    REFERENCES Kits (idKit)
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

-- produtos indisponiveis
INSERT INTO Vidrarias (nomeVidraria, detalhes, capacidade, quantidade) VALUES
('Bagueta', 'Vidro', 'N/A', 0),
('Balão de fundo chata', NULL, '250ml', 0),
('Balão volumétrico', NULL, '2000ml', 0),
('Balão volumétrico', NULL, '1000ml', 0),
('Balão volumétrico', NULL, '250ml', 0);
SELECT * FROM vidrarias;

INSERT INTO Reagentes (nomeReagente, quantidade) VALUES
('Amido Solúvel', 0),
('Biftalato de Potássio', 0),
('Carbonato de Sódio', 0);
INSERT INTO usuario (nome, email, senha, permissao) VALUES ("adm", "teste@etec.com", "$2b$10$DSRABGLTNKHdOauEu3oYoOz6SGCrJlJOFMvdQMiz54F.zf69F0nda", "Administrador"); -- senha 123 em hash 10
INSERT INTO usuario (nome, email, senha, permissao) VALUES ("adm", "teste2@etec.com", "123", "Administrador"); -- senha 123 em hash 10
INSERT INTO usuario (nome, email, senha, permissao) VALUES ("adm", "teste3@etec.com", "1234", "Professor");

SELECT * FROM usuario;

SELECT idReagente, nomeReagente,quantidade FROM Reagentes WHERE quantidade > 0;
SELECT idVidraria,nomeVidraria,capacidade,quantidade FROM Vidrarias WHERE quantidade > 0;
USE agendamento_lab;
SELECT * FROM kits;
DESCRIBE reagentes;
SELECT * FROM reagentes WHERE idReagente = 1;

DESCRIBE solicitacoes;
USE agendamento_lab;

-- teste de agendamentos
INSERT INTO Laboratorio (sala) VALUES ('101'); -- popula labs
SELECT * FROM Laboratorio;

INSERT INTO Kits (idUsuario, nome, descrição) VALUES (1, 'Kit Titulação Ácido-Base', 'Materiais para titulação básica.'); -- popula kits
SELECT * FROM kits;

INSERT INTO Agendamento (idUsuario, dataAgendamento, periodoAgendamento, aula, idLaboratorio, idKit, statusAgendamento) VALUES -- popula agendamentos
(1, '2026-03-10', 'Vespertino', '1ª Aula', 1, 1, 'Pendente');

INSERT INTO Agendamento (idUsuario, dataAgendamento, periodoAgendamento, aula, idLaboratorio, idKit, statusAgendamento) VALUES
(2, '2026-03-15', 'Matutino', '3ª Aula', 1, 1, 'Aprovado');

INSERT INTO Agendamento (idUsuario, dataAgendamento, periodoAgendamento, aula, idLaboratorio, idKit, statusAgendamento) VALUES
(2, '2026-03-20', 'Noturno', '4ª Aula', 1, 1, 'Cancelado');

-- query para consulta e tratamento dos agendamentos
SELECT 
    a.idAgendamento,
    DATE_FORMAT(a.dataAgendamento, '%d/%m/%Y') AS data,
    a.periodoAgendamento AS periodo,
    a.aula,
    -- Todo esse case funciona como um if else para mandar as aulas com seus respectivos horarios para facilitar o tratamento no site. 
    CASE 
        -- MATUTINO
        WHEN a.periodoAgendamento = 'Matutino' AND a.aula = '1ª Aula' THEN '07:10 - 08:00'
        WHEN a.periodoAgendamento = 'Matutino' AND a.aula = '2ª Aula' THEN '08:00 - 08:50'
        WHEN a.periodoAgendamento = 'Matutino' AND a.aula = '3ª Aula' THEN '08:50 - 09:40'
        WHEN a.periodoAgendamento = 'Matutino' AND a.aula = '4ª Aula' THEN '10:00 - 10:50'
        WHEN a.periodoAgendamento = 'Matutino' AND a.aula = '5ª Aula' THEN '10:50 - 11:40'
        WHEN a.periodoAgendamento = 'Matutino' AND a.aula = '6ª Aula' THEN '11:40 - 12:30'
        
        -- VESPERTINO
        WHEN a.periodoAgendamento = 'Vespertino' AND a.aula = '1ª Aula' THEN '13:00 - 13:50'
        WHEN a.periodoAgendamento = 'Vespertino' AND a.aula = '2ª Aula' THEN '13:50 - 14:40'
        WHEN a.periodoAgendamento = 'Vespertino' AND a.aula = '3ª Aula' THEN '14:40 - 15:30'
        WHEN a.periodoAgendamento = 'Vespertino' AND a.aula = '4ª Aula' THEN '15:50 - 16:40'
        WHEN a.periodoAgendamento = 'Vespertino' AND a.aula = '5ª Aula' THEN '16:40 - 17:30'
        WHEN a.periodoAgendamento = 'Vespertino' AND a.aula = '6ª Aula' THEN '17:30 - 18:20'
        
        -- NOTURNO
        WHEN a.periodoAgendamento = 'Noturno' AND a.aula = '1ª Aula' THEN '18:50 - 19:40'
        WHEN a.periodoAgendamento = 'Noturno' AND a.aula = '2ª Aula' THEN '19:40 - 20:30'
        WHEN a.periodoAgendamento = 'Noturno' AND a.aula = '3ª Aula' THEN '20:44 - 21:34'
        WHEN a.periodoAgendamento = 'Noturno' AND a.aula = '4ª Aula' THEN '21:34 - 22:20'
        
        ELSE 'Horário Indefinido'
    END AS horarioAula,
    a.statusAgendamento AS status,
    u.nome,
    l.idLaboratorio,
    l.sala,
    k.nome AS kit
FROM 
    Agendamento a
JOIN Usuario u ON a.idUsuario = u.idUsuario
JOIN Laboratorio l ON a.idLaboratorio = l.idLaboratorio
JOIN Kits k ON a.idKit = k.idKit
ORDER BY a.dataAgendamento DESC;






