interface User {
  id: string;
  email: string;
  password: string;
  cipher_Key: string;
}

interface Posts {
  id: string;
  text: string;
  userId: string;
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
