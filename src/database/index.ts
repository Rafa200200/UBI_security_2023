interface User {
  id: string;
  email: string;
  password: string;
  salt: Buffer;
  hmac_type: 256 | 512;
  cipher_type: "aes-128-cbc" | "aes-128-ctr";
}

interface Posts {
  id: string;
  text: string;
  userId: string;
  createdAt: number;
}

interface DB {
  users: User[];
  posts: Posts[];
}

const db: DB = {
  users: [],
  posts: [],
};

export default db;
