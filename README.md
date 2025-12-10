
# 🗓️ Agendamento e Gerenciamento de Aulas Práticas - ETEC

![Status](https://img.shields.io/badge/Finalizado-green?style=for-the-badge)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

---
## 📖 Sobre o Projeto

Este projeto foi desenvolvido como Projeto Integrador para a **ETEC Júlio de Mesquita** mediado pelo **Instituto Mauá de Tecnologia**. O sistema visa modernizar e organizar o processo de agendamento de laboratórios de química, criação de kits de materiais e gerenciamento de estoque de vidrarias e reagentes.

O objetivo é substituir processos manuais ou em papel por uma plataforma web intuitiva, segura e eficiente, atendendo Professores, Técnicos e Administradores.

## 🚀 Funcionalidades Principais

O sistema possui controle de acesso baseado em níveis de permissão (Roles):

### 👨‍🏫 Professores
* **Agendamento de Aulas:** Visualização de calendário mensal e semanal para reservar laboratórios.
* **Criação de Kits:** Montagem personalizada de kits com vidrarias e reagentes disponíveis no estoque.
* **Gestão de Kits:** Visualização e exclusão de seus próprios kits.
* **Histórico:** Acompanhamento do status das solicitações (Pendente, Aprovado, Finalizado, Cancelado).
* **Restrição de Tempo:** Agendamentos permitidos apenas com 48h de antecedência.

### 📦 Técnicos
* **Controle de Estoque:** Visualização de itens disponíveis e indisponíveis.
* **Solicitação de Reposição:** Pedidos de compra ou reposição de materiais.
* **Gestão de Solicitações:** Aprovação de kits (separação de material), devolução de kits (pós-aula) e cancelamentos.
* **Atualização de Inventário:** Entrada e saída automática de estoque baseada no uso dos kits.

### 🛡️ Administradores
* **Gestão de Usuários:** Cadastro de novos usuários e alteração de permissões/senhas.
* **Acesso Total:** Visibilidade de todas as funcionalidades do sistema.

## 🛠️ Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3, JavaScript (ES6 Modules), Bootstrap 5.2.3.
* **Back-end:** Node.js com Express.
* **Banco de Dados:** MySQL.
* **Autenticação:** JSON Web Token (JWT) e Bcrypt (Hash de senhas).
* **Bibliotecas:** `cors`, `body-parser`, `mysql2`.

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/)
* [MySQL Server](https://dev.mysql.com/downloads/installer/)
* Git (opcional, para clonar o repositório)

## 🔧 Instalação e Configuração

1.  **Clone o repositório**
    ```bash
    git clone https://Kaique-Sachelli/PI-ETEC.git
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    ```

3.  **Configuração do Banco de Dados**
    * Crie um banco de dados MySQL chamado `agendamento_lab`.
    * Execute o script SQL (se disponível) ou certifique-se de que as tabelas (`Usuario`, `Kits`, `Vidrarias`, `Reagentes`, `Agendamento`, etc.) existam.
    * Verifique o arquivo `JS/conexao.js` e ajuste as credenciais se necessário:
    ```javascript
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',      // Seu usuário MySQL
      password: '1234',  // Sua senha MySQL
      database: 'agendamento_lab'
    });
    ```

4.  **Inicie o Servidor**
    ```bash
    npm start
    ```
    *O servidor rodará, por padrão, na porta 3000.*

5.  **Acesse o Sistema**
    * Abra o navegador e acesse a interface (geralmente via Live Server ou abrindo o `HTML/login.html`).
    * Certifique-se de que o Front-end esteja apontando para `http://localhost:3000`.

## 🗄️ Estrutura do Banco de Dados (Resumo)

O sistema depende das seguintes tabelas principais (inferidas pelo código):

* **Usuario:** `idUsuario`, `nome`, `email`, `senha`, `permissao` (Enum: Professor, Tecnico, Administrador).
* **Laboratorio:** `idLaboratorio`, `sala`.
* **Vidrarias / Reagentes:** Controle de nome e quantidade.
* **Kits:** Cabeçalho do kit criado pelo professor.
* **Kits_Vidrarias / Kits_Reagentes:** Tabelas associativas (N:N) com as quantidades dos itens no kit.
* **Agendamento:** Relaciona Usuário, Laboratório, Kit, Data, Período e Aula.
  
## 🏆 Avaliação e Resultados

Este projeto foi submetido a uma banca avaliadora composta pelos professores das disciplinas do semestre e pelo parceiro da **ETEC Júlio de Mesquita**.

<p align="center">
  <img src="Img/nota.png" alt="Nota 9.5" width="120">
  <br>
  <br>
  Recebemos a nota <strong>9,5</strong>, com destaque para a organização do código, segurança de controle do sistema e a usabilidade da aplicação para os técnicos e professores.
</p>

## 🧑‍💻 Integrantes

| Nome                                | RA           |
|-------------------------------------|--------------|
| Erick Ken Tamae                     | 25.00240-3   |
| Guilherme Grigoletto Visone         | 25.01373-1   |
| Gustavo Henrique Martin Silva       | 25.00855-8   |
| Jordana Barbosa Balestrin           | 25.00907-7   |
| Kaique Sachelli Fernandes Ferreira  | 25.01423-4   |
| Pedro Moreno                        | 25.01358-2   |

---
