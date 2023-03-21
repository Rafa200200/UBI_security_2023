import jwt from "jsonwebtoken";
import { JwtType } from "../index";
import { JWT_SECRET } from "./generateJwt";

export default function verifyJwt(token: string): JwtType {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtType;

    return payload;
  } catch (error) {
    throw new Error("Erro ao verificar o token JWT");
  }
}
