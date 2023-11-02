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
import createAes128Ctr from "./utils/createAes128Ctr";

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
  // file deepcode ignore HardcodedNonCryptoSecret: Fake data
  secret: "d78c3bfe-86cb-4c41-98c5-83c5a0748b40",
  parseOptions: {},
});
fastify.register(cors, {
  origin: ["http://localhost:3000"],
  credentials: true,
});
fastify.register(helmet, {
  contentSecurityPolicy: false,
  global: true,
});

fastify.addHook("preHandler", (req, reply, done) => {
  if (req.url !== "/login" && req.url !== "/register" && req.url !== "/hack") {
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
  const { email, password, hmac_type, cipher_type } =
    request.body as EmailPassword & {
      hmac_type: 256 | 512;
      cipher_type: "aes-128-cbc" | "aes-128-ctr";
    };
  const user = {
    id: uuidv4(),
    email,
    password: await hashPassword(password),
    salt: crypto.randomBytes(16),
    hmac_type: hmac_type ?? 256,
    cipher_type: cipher_type ?? "aes-128-cbc",
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

fastify.get("/hack", async (request, reply) => {
  // change 1 bit on the post.text
  db.posts[db.posts.length - 1].text = db.posts[
    db.posts.length - 1
  ].text.replace("a", "b");
  return { message: "Hack realizado com sucesso" };
});

fastify.delete("/logout", async (request, reply) => {
  reply.clearCookie("@auth");
  return { message: "Logout realizado com sucesso" };
});

fastify.get("/posts", async (request, reply) => {
  const posts = db.posts.filter(
    (post) => post.userId === (request as any).userId
  );

  const user = db.users.find((user) => user.id === (request as any).userId);

  posts.forEach((post) => {
    // verify the hmac if is invalid add a flag invalid:true to the post
    const decrypted = decipher({
      cipherText: post.text,
      secret: user.password,
      salt: user.salt,
      cipher_type: user.cipher_type,
    });

    const isValid = verifyHmac({
      date: decrypted.date,
      hmac: decrypted.hmac,
      lastHash: decrypted.prevHash ?? "null",
      message: decrypted.message,
      secret: user.password,
      salt: user.salt,
      hmac_type: user.hmac_type,
    });

    if (!isValid) {
      (post as any).invalid = true;
    }

    return post;
  });

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
    cipher_type: user.cipher_type,
  });

  const isValid = verifyHmac({
    date: decrypted.date,
    hmac: decrypted.hmac,
    lastHash: decrypted.prevHash ?? "null",
    message: decrypted.message,
    secret: user.password,
    salt: user.salt,
    hmac_type: user.hmac_type,
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

  console.log(1111, lastHash);

  const hmac = createHmac({
    date: dateString,
    lastHash,
    message: text,
    secret: user.password,
    salt: user.salt,
    type: user.hmac_type,
  });

  let criptMessage;

  if (user.cipher_type === "aes-128-cbc") {
    criptMessage = createAes128Cbc({
      date: dateString,
      hmac,
      message: text,
      prevHash: lastHash,
      secret: user.password,
      salt: user.salt,
    });
  } else {
    criptMessage = createAes128Ctr({
      date: dateString,
      hmac,
      message: text,
      prevHash: lastHash,
      secret: user.password,
      salt: user.salt,
    });
  }

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
