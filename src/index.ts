import Fastify from "fastify";
import db from "./database/index";
import { v4 as uuidv4 } from "uuid";
import hashPassword from "./utils/hashPassword";
import bcrypt from "bcryptjs";
import generateJwt from "./utils/generateJwt";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import verifyJwt from "./utils/verifyJwt";
import crypto from "crypto";
import createHmac from "./utils/createHmac";
import createAes128Cbc from "./utils/createAes128Cbc";
import decipher from "./utils/decipher";
import verifyHmac from "./utils/verifyHmac";

interface EmailPassword {
  email: string;
  password: string;
}

export interface JwtType {
  id: string;
}

const fastify = Fastify({
  logger: true,
});

fastify.register(cookie, {
  secret: "d78c3bfe-86cb-4c41-98c5-83c5a0748b40",
  parseOptions: {},
});
fastify.register(cors, {});
fastify.register(helmet, {
  contentSecurityPolicy: false,
  global: true,
});

fastify.addHook("preHandler", (req, reply, done) => {
  if (req.url !== "/login") {
    const token = req.cookies["@auth"];
    if (!token) {
      return reply.status(401).send({ message: "Token não encontrado" });
    }

    try {
      const decoded = verifyJwt(token);
      (req as any).userId = decoded.id;
    } catch (error) {
      return reply.status(401).send({ message: "Não autorizado" });
    }
  }
  done();
});

fastify.post("/register", async (request, reply) => {
  const { email, password } = request.body as EmailPassword;
  const user = {
    id: uuidv4(),
    email,
    password: await hashPassword(password),
    salt: crypto.randomBytes(16),
  };
  db.users.push(user);
  return user;
});

fastify.post("/login", async (request, reply) => {
  const { email, password } = request.body as EmailPassword;

  const user = db.users.find((user) => user.email === email);

  if (!user) {
    return reply.status(404).send({ message: "Usuário não encontrado" });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return reply.status(401).send({ message: "Senha incorreta" });
  }

  const token = generateJwt({
    id: user.id,
  });

  reply.setCookie("@auth", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return { message: "Login realizado com sucesso" };
});

fastify.delete("/logout", async (request, reply) => {
  reply.clearCookie("@auth");
  return { message: "Logout realizado com sucesso" };
});

fastify.get("/posts", async (request, reply) => {
  const posts = db.posts.filter(
    (post) => post.userId === (request as any).userId
  );
  return posts;
});

fastify.get("/posts/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const post = db.posts.find((post) => post.id === id);

  if (!post) {
    return reply.status(404).send({ message: "Post não encontrado" });
  }

  const user = db.users.find((user) => user.id === post.userId);

  const decrypted = decipher({
    cipherText: post.text,
    secret: user.password,
    salt: user.salt,
  });

  const isValid = verifyHmac({
    date: decrypted.date,
    hmac: decrypted.hmac,
    lastHash: decrypted.prevHash,
    message: decrypted.message,
    secret: user.password,
    salt: user.salt,
  });

  if (!isValid) {
    return reply.status(401).send({ message: "HMAC inválido" });
  }

  return decrypted;
});

fastify.post("/posts", async (request, reply) => {
  const userId = (request as any).userId;

  const user = db.users.find((user) => user.id === userId);
  const { text } = request.body as { text: string };

  const date = new Date();

  const dateString = date.toISOString();

  const userPosts = db.posts.map((post) => {
    if (post.userId === user.id) {
      return post;
    }
  });

  const postsSorted = userPosts.sort((a, b) => {
    if (a.createdAt > b.createdAt) return -1;
    if (a.createdAt < b.createdAt) return 1;
    return 0;
  });

  const lastRecord = postsSorted[0];

  const lastHash = lastRecord ? lastRecord.text.split(":")[2] : "null";

  const hmac = createHmac({
    date: dateString,
    lastHash,
    message: text,
    secret: user.password,
    salt: user.salt,
  });

  const criptMessage = createAes128Cbc({
    date: dateString,
    hmac,
    message: text,
    prevHash: lastHash,
    secret: user.password,
    salt: user.salt,
  });

  const post = {
    id: uuidv4(),
    text: criptMessage,
    userId: user.id,
    createdAt: date.getTime(),
  };

  db.posts.push(post);

  return post;
});

const start = async () => {
  try {
    await fastify.listen({ port: 3333 }).then(() => {
      fastify.log.info(`server listening on ${fastify.server.address()}`);
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
