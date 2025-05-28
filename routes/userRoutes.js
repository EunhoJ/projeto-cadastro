import express from 'express';
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
const usersFile = path.join(__dirname, "../data/users.json");

// Garante que o arquivo existe
function ensureUserFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, "[]");
  }
}

router.post("/", async (request, response) => {
  // Desestruturação dos dados enviados na requisição (request / post)
  const { name, email, password } = request.body;

  ensureUserFile();
  
  // Verifica os campos em branco
  if (!name || !email || !password) {
    return response.status(400).json({
      error: 'Nome, email e senha são obrigatórios.'
    });
  }

  try {
    // Busca os usuários existentes
    const data = fs.readFileSync(usersFile, "utf-8");
    const users = JSON.parse(data || "[]");

    // Verifica se o E-mail já existe
    const isEmail = users.find((user) => user.email === email);

    if (isEmail) {
      return response.status(409).json({
        error: "E-mail já cadastrado"
      });
    }

    // Gera o Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o ID único
    const id = uuidv4();

    // Cria um novo usuário
    const newUser = {
      uid: id,
      name: name,
      email: email,
      password: hashedPassword,
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString()
    };

    // Adiciona o novo usuário no array (lista de usuários)
    users.push(newUser);

    // Salva o arquivo
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    // Remove a senha do retorno (Não mostra a senha na tela)
    const { senha: _, ...userWithoutPassword } = newUser;

    response.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    response.status(500).json({
      erro: "Erro ao criar usuário."
    })
  }
});

export default router;