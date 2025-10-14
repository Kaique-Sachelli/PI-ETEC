const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./bancodedados'); 

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
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
  const { email, senha } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO usuarios (email, senha) VALUES (?, ?)',
      [email, senha]
    );

    res.json({
      sucesso: true,
      mensagem: 'Usuário cadastrado com sucesso!',
      id: result.insertId
    });
  } catch (erro) {
    res.status(400).json({ erro: 'Erro ao cadastrar: ' + erro.message });
  }
});

// isso aqui so serve para testar se ta funcionando mesmo sem o banco, qnd usarem, apague essa parte
const PORTA = 5501;
app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));
