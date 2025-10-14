const mysql = require('mysql2/promise');

// aqui como no siga viagem voce coloca as coisas do sqwl
const pool = mysql.createPool({
  host: ' ',     // endereço
  user: ' ',          //usuário
  password: ' ',          //senha
  database: ' '   //nome do banco 
});

module.exports = pool;
