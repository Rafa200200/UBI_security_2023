import bcrypt from "bcryptjs";

export default async function hashPassword(password: string) {
  try {
    const salt = bcrypt.genSaltSync(14);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  } catch (error) {
    throw new Error("Erro ao criar o hash da senha");
  }
}
