import jwt from "jsonwebtoken";

export const JWT_SECRET =
  // file deepcode ignore HardcodedSecret: Fake data
  process.env.JWT_SECRET || "1a40d3ed-e37c-4300-a9a9-a8120e61ed11";

export default function generateJwt(payload: object) {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1d",
    });

    return token;
  } catch (error) {
    throw new Error("Erro ao criar o token JWT");
  }
}
