const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('../PI-ETEC/JS/conexao.js');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuario WHERE email = ? AND senha = ?',
      [email, senha]
    );

    if (rows.length > 0) {
      res.json({ sucesso: true, mensagem: 'Login realizado com sucesso!' });
    } else {
      res.json({ sucesso: false, mensagem: 'Email ou senha incorretos.' });
    }
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});


app.post('/cadastro', async (req, res) => {
  const { nome, email, senha, login } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO usuario (nome, email, senha, permissao) VALUES (?, ?, ?, ?)',
      [nome, email, senha, login]
    );
    res.json({
      sucesso: true,
      mensagem: 'Usuário cadastrado com sucesso!',
      id: result.insertId
    });
  } catch (erro) {
    if (erro.code == 'ER_DUP_ENTRY') {
      res.json({
        sucesso: false,
        mensagem: 'Email já cadastrado no sistema'
      })
    } else {
      res.json({
        sucesso: false,
        mensagem: 'Erro interno: ' + erro.message
      })
    }

  }
});

const PORTA = 5502;
app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));