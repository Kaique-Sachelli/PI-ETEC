const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('../PI-ETEC/JS/conexao.js');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// login
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

// cadastro
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

// buscar usuários
app.get('/usuarios', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT idUsuario, nome, permissao FROM usuario'
    );

    res.json({
      sucesso: true,
      usuarios: rows
    });

  } catch (erro) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar usuários: ' + erro.message
    });
  }
});

//buscar informação completa do usuário
app.get('/usuarios/:id', async (req, res) => {
  const id = req.params.id
  try {
    const [rows] = await pool.query(
      'SELECT email, permissao FROM usuario WHERE idUsuario = ?', [id]
    )
    if (rows.length > 0) {
      res.json({
        sucesso: true,
        usuario: rows[0]
      })
    }
  } catch (erro) {
    res.json({
      sucesso: false,
      mensagem: 'Erro ao buscar usuário: ' + erro.message
    })
  }
})

//atualiza dados do usuario
app.post('/usuarios/atualizar', async (req, res) => {
  const { idUsuario, email, novaSenha, permissao } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE usuario SET email = ?, senha = ?, permissao = ? WHERE idUsuario = ?',
      [email, novaSenha, permissao, idUsuario]
    );
    res.json({
      sucesso: true,
      mensagem: 'Dados atualizados com sucesso!'
    });
  } catch (erro) {
    res.json({
      sucesso: false,
      mensagem: 'Erro ao atualizar: ' + erro.message
    })
  }
});

//buscar Reagentes
app.get('/reagentes', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT nomeReagente,quantidade FROM Reagentes'
    )
    res.json({
      sucesso: true,
      reagentes: rows
    })
  } catch (error) {
    res.json({
      sucesso: false,
      mensagem: ('Não foi possivel encontrar reagentes' + error.message)
    })
  }
})

//buscar vidrarias
app.get('/vidrarias', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT nomeVidraria,capacidade,quantidade FROM Vidrarias'
    )
    res.json({
      sucesso: true,
      vidrarias: rows
    })
  } catch (error) {
    res.json({
      sucesso: false,
      mensagem: ('Não foi possivel encontrar vidrarias' + error.message)
    })
  }
})



const PORTA = 3000;
app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));