const mysql = require('mysql2/promise');

// aqui como no siga viagem voce coloca as coisas do sqwl
const pool = mysql.createPool({
  host: 'localhost',     // endereço
  user: 'root',          //usuário
  password: '',          //senha
  database: 'agendamento_lab'   //nome do banco 
});

module.exports = pool;
