const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const pool = require("../PI-ETEC/JS/conexao.js");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
const JWT_SECRET = "chave-secreta";
const bcrypt = require('bcrypt');
const saltrounds = 10; //custo computacional para gerar o hash

// Middleware para verificar o token JWT
function verificarToken(req, res, next) {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ sucesso: false, mensagem: "Token não fornecido." });
  }

  let token;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    token = authHeader;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ sucesso: false, mensagem: "Token inválido ou expirado." });
  }
}

// login
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM usuario WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      const usuario = rows[0];
      const match = await bcrypt.compare(senha, usuario.senha);
      if (match) {
        //popula o token com as informações do usuario
        const payload = {
          idUsuario: usuario.idUsuario,
          nome: usuario.nome,
          permissao: usuario.permissao
        };
        //cria e assina o token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expira em 1 hora
        res.json({
          sucesso: true,
          mensagem: "Login realizado com sucesso!",
          token: token,
        });
      } else {
        res.json({ sucesso: false, mensagem: "Email ou senha incorretos." });
      }
    } else {
      res.json({ sucesso: false, mensagem: "Email ou senha incorretos." });
    }
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// cadastro
app.post("/cadastro", verificarToken, async (req, res) => {
  const { nome, email, senha, login } = req.body;
  const permissaoUsuario = req.usuario.permissao
  if (permissaoUsuario !== "Administrador") { //segurança com base em permissão
    return res.status(403).json({ // return para parar a rota
      sucesso: false,
    })
  } else {
    try {
      const hashSenha = await bcrypt.hash(senha, saltrounds); //pega a senha em texto puro e gera o hash
      const [result] = await pool.query(
        'INSERT INTO usuario (nome, email, senha, permissao) VALUES (?, ?, ?, ?)',
        [nome, email, hashSenha, login]
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
  }
});

// buscar usuários
app.get('/usuarios', verificarToken, async (req, res) => {
  const permissaoUsuario = req.usuario.permissao
  if (permissaoUsuario !== "Administrador") {
    return res.status(403).json({
      sucesso: false
    })
  } else {
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
  }
});

//buscar informação completa do usuário
app.get('/usuarios/:id', verificarToken, async (req, res) => {
  const permissaoUsuario = req.usuario.permissao
  if (permissaoUsuario !== "Administrador") {
    return res.status(403).json({
      sucesso: false
    })
  } else {
    const id = req.params.id;
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
  }
});

//atualiza dados do usuario
app.post("/usuarios/atualizar", verificarToken, async (req, res) => {
  const { idUsuario, email, novaSenha, permissao } = req.body;
  const permissaoUsuario = req.usuario.permissao
  if (permissaoUsuario !== "Administrador") {
    return res.status(403).json({
      sucesso: false
    })
  } else {
    try {
      const hashSenha = await bcrypt.hash(novaSenha, saltrounds) //Não salva mais senhas em texto puro
      const [result] = await pool.query(
        'UPDATE usuario SET email = ?, senha = ?, permissao = ? WHERE idUsuario = ?',
        [email, hashSenha, permissao, idUsuario]
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
  }
});

//buscar Reagentes
app.get("/reagentes", verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT idReagente,nomeReagente,quantidade FROM Reagentes"
    );
    res.json({
      sucesso: true,
      reagentes: rows,
    });
  } catch (error) {
    res.json({
      sucesso: false,
      mensagem: "Não foi possivel encontrar reagentes" + error.message,
    });
  }
});

//buscar vidrarias
app.get("/vidrarias", verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT idVidraria,nomeVidraria,capacidade,quantidade FROM Vidrarias"
    );
    res.json({
      sucesso: true,
      vidrarias: rows,
    });
  } catch (error) {
    res.json({
      sucesso: false,
      mensagem: "Não foi possivel encontrar vidrarias" + error.message,
    });
  }
});
// criar nova solicitação
app.post("/solicitacoes", verificarToken, async (req, res) => {
  const { idUsuario, observacao } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO Solicitacoes (idUsuario, observacao) VALUES (?, ?)",
      [idUsuario, observacao || null]
    );
    res.json({
      sucesso: true,
      mensagem: "Solicitação criada com sucesso!",
      id: result.insertId,
    });
  } catch (erro) {
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao criar solicitação: " + erro.message,
    });
  }
});

// buscar solicitações
app.get("/api/solicitacoes", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.idSolicitacao AS id,
        u.nome AS professor,
        s.statusPedido AS status,
        DATE_FORMAT(s.dataPedido, '%d/%m/%Y %H:%i') AS dataSolicitacao,
        'Vespertino' AS periodo,
        '11:00 - 13:00' AS horario,
        'LAB1' AS sala
      FROM Solicitacoes s
      JOIN Usuario u ON s.idUsuario = u.idUsuario
      ORDER BY s.dataPedido DESC
    `);

    res.json(rows);
  } catch (erro) {
    console.error("Erro ao buscar solicitações:", erro);
    res.status(500).json({ erro: "Erro ao buscar solicitações" });
  }
});

// atualizar status (KIT PRONTO, CONCLUÍDA, etc.)
app.put("/api/solicitacoes/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!status) {
    return res.status(400).json({ erro: "Campo 'status' é obrigatório." });
  }

  const mapaStatus = {
    pendente: "Pendente",
    aprovado: "Aprovada",
    cancelado: "Reprovada",
    finalizado: "Concluida",
  };

  const statusBanco = mapaStatus[status];
  if (!statusBanco) {
    return res.status(400).json({ erro: "Status inválido" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE Solicitacoes SET statusPedido = ? WHERE idSolicitacao = ?",
      [statusBanco, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Solicitação não encontrada" });
    }

    res.json({
      sucesso: true,
      mensagem: "Status atualizado com sucesso!",
      status: statusBanco,
    });
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});
// ===============================
// REPOSIÇÃO DE ESTOQUE
// ===============================
app.get("/api/reposicao", verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.idReposicao AS id,
        u.nome AS usuario,
        r.status,
        DATE_FORMAT(r.dataPedido, '%d/%m/%Y %H:%i') AS dataPedido,
        r.observacao
      FROM ReposicaoEstoque r
      JOIN Usuario u ON r.idUsuario = u.idUsuario
      ORDER BY r.dataPedido DESC
    `);
    res.json(rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar reposições" });
  }
});

app.post("/api/reposicao", verificarToken, async (req, res) => {
  const { idUsuario, observacao } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO ReposicaoEstoque (idUsuario, observacao) VALUES (?, ?)",
      [idUsuario, observacao || null]
    );
    res.json({
      sucesso: true,
      mensagem: "Pedido de reposição criado com sucesso!",
      id: result.insertId,
    });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao criar pedido de reposição" });
  }
});
app.put("/api/reposicao/:id", verificarToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ erro: "O campo 'status' é obrigatório." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE ReposicaoEstoque SET status = ? WHERE idReposicao = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Pedido de reposição não encontrado." });
    }

    res.json({ sucesso: true, mensagem: "Status atualizado com sucesso!" });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao atualizar status: " + erro.message });
  }
});
//salvar kit
app.post('/kits/salvar', verificarToken, async (req, res) => {
  const idUsuario = req.usuario.idUsuario;
  const { nomeKit, descricaoKit, produtos } = req.body;

  if (!nomeKit || !produtos || produtos.length === 0) {
    res.json({ sucesso: false, mensagem: 'Nome ou Produtos do kit faltando' })
  }
  let connection;
  try {
    connection = await pool.getConnection() // usa transação para garantir que nao haja kits fantamas
    await connection.beginTransaction();
    const [resultKit] = await connection.query(
      'INSERT INTO Kits (idUsuario, nome, descrição) VALUES (?, ?, ?)',
      [idUsuario, nomeKit, descricaoKit || null] //null se a descrição não vir
    )
    const idKit = resultKit.insertId;
    for (const produto of produtos) {
      if (produto.tipo == 'vidraria') {
        await connection.query(
          'INSERT INTO Kits_Vidrarias (idKit, idVidraria, quantidade) VALUES (?, ?, ?)',
          [idKit, produto.idProduto, produto.quantidade]
        )
      } else if (produto.tipo == 'reagente') {
        await connection.query(
          'INSERT INTO Kits_Reagentes(idKit, idReagente, quantidade) VALUES(?, ?, ?)',
          [idKit, produto.idProduto, produto.quantidade]
        )
      }
    }
    await connection.commit(); //salva a operação se TODOS os loops funcionarem
    res.json({
      sucesso: true,
      mensagem: 'Kit salvo com sucesso!'
    })
  } catch (error) {
    if (connection) await connection.rollback()
    res.status(500).json({
      sucesso: false,
      mensagem: 'Houve um erro ao salvar o kit',
      erro: error.message
    })
  } finally {
    if (connection) connection.release(); //depois de toda operação libera a conexão
  }
})
//buscar kits
app.get('/kits/buscar', verificarToken, async (req, res) => {
  let conexao = await pool.getConnection();
  const idUsuario = req.usuario.idUsuario;
  try {
    const [kits] = await conexao.query(
      `SELECT k.idKit, k.idUsuario, k.nome AS nomeKit, k.descrição, u.nome AS nomeProfessor
      FROM kits k
      INNER JOIN usuario u
      WHERE k.idUsuario = u.idUsuario AND k.idUsuario = ?`,
      [idUsuario]
    );
    for (let kit of kits) {
      const [vidrarias] = await conexao.query(
        `SELECT 
           v.nomeVidraria, 
           v.capacidade, 
           kv.quantidade 
         FROM Kits_Vidrarias kv
         JOIN Vidrarias v ON kv.idVidraria = v.idVidraria
         WHERE kv.idKit = ?`,
        [kit.idKit]
      );
      const [reagentes] = await conexao.query(
        `SELECT 
           r.nomeReagente, 
           kr.quantidade 
         FROM Kits_Reagentes kr
         JOIN Reagentes r ON kr.idReagente = r.idReagente
         WHERE kr.idKit = ?`,
        [kit.idKit]
      );
      kit.produtos = [
        ...vidrarias.map(v => ({
          nome: `${v.nomeVidraria} ${v.capacidade || ''}`.trim(),
          quantidade: v.quantidade
        })),
        ...reagentes.map(r => ({
          nome: r.nomeReagente,
          quantidade: r.quantidade
        }))
      ];
    }
    res.json({
      sucesso: true,
      kits: kits
    });
  } catch (erro) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar Kits: ' + erro.message
    });
  } finally {
    if (conexao) conexao.release();
  }
})
//exluir kit
app.delete('/kits/excluir/:idKit', verificarToken, async (req,res) => {
  const {idKit} = req.params;
  const conexao = await pool.getConnection();
  //inicia transação
  await conexao.beginTransaction();
  try {
    await conexao.query(
      `DELETE FROM kits_vidrarias WHERE idKit =?;`,
      [idKit]
    );
    await conexao.query(
      `DELETE FROM kits_reagentes WHERE idKit =?;`,
      [idKit]
    );
    await conexao.query(
      `DELETE FROM kits WHERE idKit = ? ;`,
      [idKit]
    );
    //se os três DELETES deram certo, faz o commit
    await conexao.commit();
    res.json({
      sucesso : true,
      mensagem : 'Kit deletado com sucesso!'
    });
  } catch (error) {
    //se algum dos três DELETES falharem, desfaz toda operação
    await conexao.rollback();
    res.json({
      sucesso : false,
      mensagem : 'Houve um erro ao deletar o kit',
      erro : error.message
    });
  }finally{
    //libera a conexão
    if (conexao) conexao.release();
  }
})


const PORTA = 3000;
app.listen(PORTA, () => console.log(`🚀 Servidor rodando na porta ${PORTA}`));