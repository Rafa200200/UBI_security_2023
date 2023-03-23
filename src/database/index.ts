interface User {
  id: string;
  email: string;
  password: string;
  salt: Buffer;
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
