
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const pool = require("../PI-ETEC/JS/conexao.js");
const bcrypt = require('bcrypt');
const saltrounds = 10;


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
      const hashSenha = await bcrypt.hash(senha, saltrounds) //Não salva mais senhas em texto puro

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

      "SELECT idReagente, nomeReagente,quantidade FROM Reagentes WHERE quantidade > 0"

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
      "SELECT idVidraria,nomeVidraria,capacidade,quantidade FROM Vidrarias WHERE quantidade > 0"
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

//buscar Reagentes indisponíveis
app.get("/reagentes/indisponiveis", verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT idReagente,nomeReagente,quantidade FROM Reagentes WHERE quantidade <= 0"
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
//buscar vidrarias indisponíveis
app.get("/vidrarias/indisponiveis", verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT idVidraria,nomeVidraria,capacidade,quantidade FROM Vidrarias WHERE quantidade <= 0"
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

// buscar agendamentos
app.get("/agendamentos/buscar", verificarToken, async (req, res) => {
  let conexao;
  try {
    conexao = await pool.getConnection();
    const [agendamentos] = await conexao.query(`
SELECT 
    a.idAgendamento,
    DATE_FORMAT(a.dataAgendamento, '%d/%m/%Y') AS data,
    a.periodoAgendamento AS periodo,
    a.aula,
    -- Todo esse case funciona como um if else para mandar as aulas com seus respectivos horarios para facilitar o tratamento no site. 
    CASE 
        -- MATUTINO
        WHEN a.periodoAgendamento = 'Matutino' AND a.aula = '1ª Aula' THEN '07:10 - 08:00'
        WHEN a.periodoAgendamento = 'Matutino' AND a.aula = '2ª Aula' THEN '08:00 - 08:50'
        WHEN a.periodoAgendamento = 'Matutino' AND a.aula = '3ª Aula' THEN '08:50 - 09:40'
        WHEN a.periodoAgendamento = 'Matutino' AND a.aula = '4ª Aula' THEN '10:00 - 10:50'
        WHEN a.periodoAgendamento = 'Matutino' AND a.aula = '5ª Aula' THEN '10:50 - 11:40'
        WHEN a.periodoAgendamento = 'Matutino' AND a.aula = '6ª Aula' THEN '11:40 - 12:30'
        
        -- VESPERTINO
        WHEN a.periodoAgendamento = 'Vespertino' AND a.aula = '1ª Aula' THEN '13:00 - 13:50'
        WHEN a.periodoAgendamento = 'Vespertino' AND a.aula = '2ª Aula' THEN '13:50 - 14:40'
        WHEN a.periodoAgendamento = 'Vespertino' AND a.aula = '3ª Aula' THEN '14:40 - 15:30'
        WHEN a.periodoAgendamento = 'Vespertino' AND a.aula = '4ª Aula' THEN '15:50 - 16:40'
        WHEN a.periodoAgendamento = 'Vespertino' AND a.aula = '5ª Aula' THEN '16:40 - 17:30'
        WHEN a.periodoAgendamento = 'Vespertino' AND a.aula = '6ª Aula' THEN '17:30 - 18:20'
        
        -- NOTURNO
        WHEN a.periodoAgendamento = 'Noturno' AND a.aula = '1ª Aula' THEN '18:50 - 19:40'
        WHEN a.periodoAgendamento = 'Noturno' AND a.aula = '2ª Aula' THEN '19:40 - 20:30'
        WHEN a.periodoAgendamento = 'Noturno' AND a.aula = '3ª Aula' THEN '20:44 - 21:34'
        WHEN a.periodoAgendamento = 'Noturno' AND a.aula = '4ª Aula' THEN '21:34 - 22:20'
        
        ELSE 'Horário Indefinido'
    END AS horarioAula,
    a.statusAgendamento AS status,
    u.nome,
    l.idLaboratorio,
    l.sala,
    k.nome AS kit,
    a.idKit
    FROM 
    Agendamento a
      JOIN Usuario u ON a.idUsuario = u.idUsuario
    JOIN Laboratorio l ON a.idLaboratorio = l.idLaboratorio
    JOIN Kits k ON a.idKit = k.idKit
    ORDER BY a.dataAgendamento DESC;
    `);
    // buscar os detalhes dos produtos de CADA KIT
    for (const agendamento of agendamentos) {
      const idKit = agendamento.idKit;

      const [vidrarias] = await conexao.query(
        `SELECT 
           v.nomeVidraria, 
           v.capacidade, 
           kv.quantidade 
         FROM Kits_Vidrarias kv
         JOIN Vidrarias v ON kv.idVidraria = v.idVidraria
         WHERE kv.idKit = ?`,
        [idKit]
      );

      const [reagentes] = await conexao.query(
        `SELECT 
           r.nomeReagente, 
           kr.quantidade 
         FROM Kits_Reagentes kr
         JOIN Reagentes r ON kr.idReagente = r.idReagente
         WHERE kr.idKit = ?`,
        [idKit]
      );

      agendamento.produtos = [
        ...vidrarias.map(v => ({
          nome: `${v.nomeVidraria} ${v.capacidade || ''}`.trim(),
          quantidade: v.quantidade,
          tipo: 'vidraria'
        })),
        ...reagentes.map(r => ({
          nome: r.nomeReagente,
          quantidade: r.quantidade,
          tipo: 'reagente'
        }))
      ];
    }
    res.json(agendamentos);
  } catch (erro) {
    console.error("Erro ao buscar solicitações:", erro);
    res.status(500).json({ erro: "Erro ao buscar solicitações" });
  } finally {
    if (conexao) conexao.release();
  }
});

// atualizar status (KIT PRONTO, CONCLUÍDA, etc.)
app.put("/agendamentos/atualizar/:id", verificarToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!status) {
    return res.status(400).json({ erro: "Campo 'status' é obrigatório." });
  }

  const mapaStatus = {
    pendente: "Pendente",
    aprovado: "Aprovado",
    cancelado: "Cancelado",
    finalizado: "Finalizado",
  };

  const statusBanco = mapaStatus[status];
  if (!statusBanco) {
    return res.status(400).json({ erro: "Status inválido" });
  }
  let conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    //controla o estoque se o agendamento for aprovado
    if(statusBanco === 'Aprovado'){
       const [row] = await conexao.query(
        'SELECT idKit FROM agendamento WHERE idAgendamento = ?',
        [id]
      )
      const idKit = row[0].idKit;
      const [vidrarias] = await conexao.query(
        'SELECT idVidraria, quantidade FROM Kits_Vidrarias WHERE idKit = ?',
        [idKit]
      )
      for(let vidraria of vidrarias){
        await conexao.query(
          'UPDATE Vidrarias SET quantidade = quantidade - ? WHERE idVidraria = ?',
          [vidraria.quantidade, vidraria.idVidraria]
        )
      }
      const [reagentes] = await conexao.query(
        'SELECT idReagente, quantidade FROM Kits_Reagentes WHERE idKit =?',
        [idKit]
      )
  
      for(let reagente of reagentes){
        await conexao.query(
          'UPDATE Reagentes SET quantidade = quantidade - ? WHERE idReagente = ?',
          [reagente.quantidade, reagente.idReagente]
        )
      }
    }

    // retorna as vidrarias ao estoque quando a aula é concluida
    if (statusBanco === 'Finalizado') {
       const [row] = await conexao.query(
        'SELECT idKit FROM agendamento WHERE idAgendamento = ?',
        [id]
      )
      const idKit = row[0].idKit;
      const [vidrariasDoKit] = await conexao.query("SELECT idVidraria, quantidade FROM Kits_Vidrarias WHERE idKit = ?", [idKit]);
        for (const item of vidrariasDoKit) {
            await conexao.query("UPDATE Vidrarias SET quantidade = quantidade + ? WHERE idVidraria = ?",
              [item.quantidade, item.idVidraria]
            );
        }
    }

    // apos toda operação ser concluida atualiza o status do agendamento
    const [result] = await conexao.query(
      "UPDATE Agendamento SET statusAgendamento = ? WHERE idAgendamento = ?",
      [statusBanco, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Agendamento não encontrado" });
    }
    await conexao.commit(); // faz as alterações no banco
    res.json({
      sucesso: true,
      mensagem: "Status atualizado com sucesso!",
      status: statusBanco,
    });

  } catch (err) {
    await conexao.rollback(); // se qualquer coisa der errado desfaz toda a operação
    console.error("Erro ao atualizar status:", err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
  if (conexao) conexao.release();
});

// Rota para buscar Solicitações com seus produtos
app.get("/solicitacoes", verificarToken, async (req, res) => {
  let conexao;
  try {
    conexao = await pool.getConnection();
    const [rows] = await conexao.query(`
      SELECT 
        s.idSolicitacao,
        DATE_FORMAT(s.dataPedido, '%d/%m/%Y') AS data, 
        s.statusPedido AS status,
        s.observacao,
        u.nome AS tecnico
      FROM Solicitacoes s
      JOIN Usuario u ON s.idUsuario = u.idUsuario
      ORDER BY s.dataPedido DESC
    `);

    for (const solicitacao of rows) {
      const id = solicitacao.idSolicitacao;

      const [vidrarias] = await conexao.query(`
        SELECT v.nomeVidraria AS nome, sv.quantidade, 'vidraria' as tipo
        FROM Solicitacoes_Vidrarias sv
        JOIN Vidrarias v ON sv.idVidraria = v.idVidraria
        WHERE sv.idSolicitacao = ?
      `, [id]);

      const [reagentes] = await conexao.query(`
        SELECT r.nomeReagente AS nome, sr.quantidadeSolicitada AS quantidade, 'reagente' as tipo
        FROM Solicitacoes_Reagentes sr
        JOIN Reagentes r ON sr.idReagente = r.idReagente
        WHERE sr.idSolicitacao = ?
      `, [id]);

      // Unir os produtos no objeto da solicitação
      solicitacao.produtos = [...vidrarias, ...reagentes];
    }

    res.json(rows);

  } catch (erro) {
    console.error("Erro ao buscar solicitações:", erro);
    res.status(500).json({ erro: "Erro ao buscar solicitações" });
  } finally {
    if (conexao) conexao.release();
  }
});


// Rota para ALTERAR solicitação (Atualizar Status)
app.put("/solicitacoes/atualizar/:id", verificarToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      const [result] = await pool.query(
        "UPDATE Solicitacoes SET statusPedido = ? WHERE idSolicitacao = ?",
        [status, id]
      );
      
      if (result.affectedRows > 0) {
          res.json({ sucesso: true, mensagem: "Status atualizado com sucesso!" });
      } else {
          res.status(404).json({ sucesso: false, mensagem: "Solicitação não encontrada." });
      }
    } catch (erro) {
      console.error("Erro ao atualizar solicitação:", erro);
      res.status(500).json({ erro: "Erro ao atualizar solicitação" });
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

app.post("/agendamentos", verificarToken, async (req, res) => {
  const { data, laboratorio, kit, periodo, horario } = req.body;
  const idUsuario = req.usuario.idUsuario; // pega o usuário logado do JWT

  // valida
  if (!data || !laboratorio || !periodo || !horario) {
    return res.status(400).json({ sucesso: false, mensagem: "Preencha todos os campos" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO Agendamentos (idUsuario, data, laboratorio, kit, periodo, horario) VALUES (?, ?, ?, ?, ?, ?)",
      [idUsuario, data, laboratorio, kit, periodo, horario]
    );

    res.json({ sucesso: true, mensagem: "Agendamento solicitado", id: result.insertId });
  } catch (erro) {
    console.error("Erro ao agendar:", erro);
    res.status(500).json({ sucesso: false, mensagem: "Erro ao agendar: " + erro.message });
  }
})

//salva kit
app.post('/kits/salvar', verificarToken, async (req, res) => {
  const { nomeKit, descricaoKit, produtos } = req.body;
  const idUsuario = req.usuario.idUsuario;
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
          quantidade: v.quantidade,
          tipo: 'vidraria'
        })),
        ...reagentes.map(r => ({
          nome: r.nomeReagente,
          quantidade: r.quantidade,
          tipo: 'reagente'
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
app.delete('/kits/excluir/:idKit', verificarToken, async (req, res) => {
  const { idKit } = req.params;
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
      sucesso: true,
      mensagem: 'Kit deletado com sucesso!'
    });
  } catch (error) {
    //se algum dos três DELETES falharem, desfaz toda operação
    await conexao.rollback();
    res.json({
      sucesso: false,
      mensagem: 'Houve um erro ao deletar o kit',
      erro: error.message
    });
  } finally {
    //libera a conexão
    if (conexao) conexao.release();
  }
})
const PORTA = 3000;
app.listen(PORTA, () => console.log(`🚀 Servidor rodando na porta ${PORTA}`));
