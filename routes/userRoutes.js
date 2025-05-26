import express from 'express';
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import uid from "uuid";

const router = express.Router();
const usersFile = path.join(__dirname, "../data/user.json");

// Garante que o arquivo existe
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]");
}

router.post("/", async (request, response) => {
  // Desestruturação dos dados enviados na requisição (request / post)
  const { name, email, password } = request.body;

  // Verifica os campos em branco
  if (!name || !email || !password) {
    return response.status(400).json({
      error: 'Nome, email e senha são obrigatórios.'
    });
  }

  try {
    // Busca os usuários existentes
    const data = fs.readFileSync(usersFile, "utf-8");
    const users = JSON.parse(data);

    // Verifica se o E-mail já existe
    const isEmail = users.find((user) => user.email === email);

    if (isEmail) {
      return response.status(409).json({
        error: "E-mail já cadastrado"
      });
    }

    // Gera o Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria um novo usuário
    const newUser = {
      id: uid(),
      name: name,
      email: email,
      password: hashedPassword,
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString()
    };

    // Adiciona o novo usuário no array (lista de usuários)
    users.push(newUser);
    
  } catch (error) { }
});
