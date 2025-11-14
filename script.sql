--
-- Esse daqui eh o script do banco que ficou compativel com a parte de agendamentos
-- Tentei deixar o mais semelhante possivel com o do Guzz, so corrigindo uns erros e fazendo do meu jeito
-- Ate a data desse commit, 12/11 (23:46) esta funcionando perfeitamente





CREATE SCHEMA IF NOT EXISTS agendamento_lab;
USE agendamento_lab;

DROP TABLE IF EXISTS Usuario;
CREATE TABLE Usuario (
  idUsuario INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(45) NOT NULL,
  email VARCHAR(45) NOT NULL UNIQUE,
  senha VARCHAR(70) NOT NULL,
  permissao ENUM('Administrador', 'Tecnico', 'Professor') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
=
DROP TABLE IF EXISTS Laboratorio;
CREATE TABLE Laboratorio (
  idLaboratorio INT PRIMARY KEY AUTO_INCREMENT,
  sala VARCHAR(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS Reagentes;
CREATE TABLE Reagentes (
  idReagente INT PRIMARY KEY AUTO_INCREMENT,
  nomeReagente VARCHAR(45) NOT NULL,
  quantidade DECIMAL(7,2) NOT NULL,
  divisao ENUM('A19', 'A20', 'A5', 'A6', 'I', 'II', 'III', 'IV', 'IX', 'V') NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS Vidrarias;
CREATE TABLE Vidrarias (
  idVidraria INT PRIMARY KEY AUTO_INCREMENT,
  nomeVidraria VARCHAR(45) NOT NULL,
  detalhes VARCHAR(250),
  capacidade VARCHAR(10),
  quantidade SMALLINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS Solicitacoes;
CREATE TABLE Solicitacoes (
  idSolicitacao INT PRIMARY KEY AUTO_INCREMENT,
  idUsuario INT NOT NULL,
  dataPedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  statusPedido ENUM('Pendente', 'Aprovada', 'Reprovada', 'Pedido_Realizado', 'Concluida') DEFAULT 'Pendente',
  observacao TEXT,
  FOREIGN KEY (idUsuario) REFERENCES Usuario (idUsuario)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS Solicitacoes_Vidrarias;
CREATE TABLE Solicitacoes_Vidrarias (
  idSolicitacao INT NOT NULL,
  idVidraria INT NOT NULL,
  quantidade SMALLINT NOT NULL,
  PRIMARY KEY (idSolicitacao, idVidraria),
  FOREIGN KEY (idSolicitacao) REFERENCES Solicitacoes (idSolicitacao)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (idVidraria) REFERENCES Vidrarias (idVidraria)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS Solicitacoes_Reagentes;
CREATE TABLE Solicitacoes_Reagentes (
  idSolicitacao INT NOT NULL,
  idReagente INT NOT NULL,
  quantidadeSolicitada DECIMAL(7,2) NOT NULL,
  PRIMARY KEY (idSolicitacao, idReagente),
  FOREIGN KEY (idSolicitacao) REFERENCES Solicitacoes (idSolicitacao)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (idReagente) REFERENCES Reagentes (idReagente)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS Kits;
CREATE TABLE Kits (
  idKit INT PRIMARY KEY AUTO_INCREMENT,
  idUsuario INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(200),
  FOREIGN KEY (idUsuario) REFERENCES Usuario (idUsuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS Kits_Vidrarias;
CREATE TABLE Kits_Vidrarias (
  idKit INT NOT NULL,
  idVidraria INT NOT NULL,
  quantidade SMALLINT NOT NULL,
  PRIMARY KEY (idKit, idVidraria),
  FOREIGN KEY (idKit) REFERENCES Kits (idKit)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (idVidraria) REFERENCES Vidrarias (idVidraria)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS Kits_Reagentes;
CREATE TABLE Kits_Reagentes (
  idKit INT NOT NULL,
  idReagente INT NOT NULL,
  quantidade DECIMAL(7,2) NOT NULL,
  PRIMARY KEY (idKit, idReagente),
  FOREIGN KEY (idKit) REFERENCES Kits (idKit)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (idReagente) REFERENCES Reagentes (idReagente)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS Agendamentos;
CREATE TABLE Agendamentos (
  idAgendamento INT PRIMARY KEY AUTO_INCREMENT,
  idUsuario INT NOT NULL,
  data DATE NOT NULL,
  laboratorio VARCHAR(20) NOT NULL,
  kit VARCHAR(100),
  periodo VARCHAR(20),
  horario VARCHAR(20),
  statusAgendamento ENUM('Pendente', 'Aprovado', 'Cancelado', 'Finalizado') DEFAULT 'Pendente',
  FOREIGN KEY (idUsuario) REFERENCES Usuario (idUsuario)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- usuario com hash q o Guzz fez
INSERT INTO usuario (nome, email, senha, permissao) VALUES ("adm", "teste@etec.com", "$2b$10$DSRABGLTNKHdOauEu3oYoOz6SGCrJlJOFMvdQMiz54F.zf69F0nda", "Administrador"); -- senha 123 em hash 10
INSERT INTO usuario (nome, email, senha, permissao) VALUES ("adm", "teste2@etec.com", "123", "Administrador"); -- senha 123 em hash 10

SELECT * FROM usuario;


-- apenas teste
INSERT INTO Reagentes (nomeReagente, quantidade)
VALUES ('Amido Solúvel', 500), ('Cloreto de Sódio', 700);

INSERT INTO Vidrarias (nomeVidraria, capacidade, quantidade)
VALUES ('Béquer de vidro', '250ml', 40), ('Balão volumétrico', '100ml', 10);
SELECT * FROM Reagentes
SELECT * FROM Vidrarias