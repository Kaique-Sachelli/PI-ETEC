const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',     // endereço
  user: 'root',          //usuário
  password: '',          //senha
  database: 'agendamento_lab'   //nome do banco 
});

module.exports = pool;
