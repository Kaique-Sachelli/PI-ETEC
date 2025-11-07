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
      "SELECT * FROM usuario WHERE email = ? AND senha = ?",
      [email, senha]
    );

    if (rows.length > 0) {
      const usuario = rows[0];
      //popula o token com as informações do usuario
      const payload = {
        idUsuario: usuario.idUsuario,
        nome: usuario.nome,
        permissao: usuario.permissao,
      };
      //cria e assina o token
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" }); // Token expira em 1 hora
      res.json({
        sucesso: true,
        mensagem: "Login realizado com sucesso!",
        token: token,
      });
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

  try {
    const [result] = await pool.query(
      "INSERT INTO usuario (nome, email, senha, permissao) VALUES (?, ?, ?, ?)",
      [nome, email, senha, login]
    );
    res.json({
      sucesso: true,
      mensagem: "Usuário cadastrado com sucesso!",
      id: result.insertId,
    });
  } catch (erro) {
    if (erro.code == "ER_DUP_ENTRY") {
      res.json({
        sucesso: false,
        mensagem: "Email já cadastrado no sistema",
      });
    } else {
      res.json({
        sucesso: false,
        mensagem: "Erro interno: " + erro.message,
      });
    }
  }
});

// buscar usuários
app.get("/usuarios", verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT idUsuario, nome, permissao FROM usuario"
    );

    res.json({
      sucesso: true,
      usuarios: rows,
    });
  } catch (erro) {
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar usuários: " + erro.message,
    });
  }
});

//buscar informação completa do usuário
app.get("/usuarios/:id", verificarToken, async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query(
      "SELECT email, permissao FROM usuario WHERE idUsuario = ?",
      [id]
    );
    if (rows.length > 0) {
      res.json({
        sucesso: true,
        usuario: rows[0],
      });
    }
  } catch (erro) {
    res.json({
      sucesso: false,
      mensagem: "Erro ao buscar usuário: " + erro.message,
    });
  }
});

//atualiza dados do usuario
app.post("/usuarios/atualizar", verificarToken, async (req, res) => {
  const { idUsuario, email, novaSenha, permissao } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE usuario SET email = ?, senha = ?, permissao = ? WHERE idUsuario = ?",
      [email, novaSenha, permissao, idUsuario]
    );
    res.json({
      sucesso: true,
      mensagem: "Dados atualizados com sucesso!",
    });
  } catch (erro) {
    res.json({
      sucesso: false,
      mensagem: "Erro ao atualizar: " + erro.message,
    });
  }
});

//buscar Reagentes
app.get("/reagentes", verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT nomeReagente,quantidade FROM Reagentes"
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
      "SELECT nomeVidraria,capacidade,quantidade FROM Vidrarias"
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
// PUT - Atualizar status da solicitação
app.put("/api/solicitacoes/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Mapeia o status do front para o banco
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

  const sql = "UPDATE Solicitacoes SET statusPedido = ? WHERE idSolicitacao = ?";

  try {
    const [result] = await pool.query(sql, [statusBanco, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Solicitação não encontrada" });
    }

    res.json({ 
      sucesso: true,
      mensagem: "Status atualizado com sucesso!", 
      status: statusBanco 
    });
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

const PORTA = 3000;
app.listen(PORTA, () => console.log(`🚀 Servidor rodando na porta ${PORTA}`));
