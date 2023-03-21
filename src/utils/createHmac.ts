import * as crypto from "crypto";

export default function createHmac(secret: string, message: string) {
  try {
    const hmac = crypto
      .createHmac("sha256", secret)
      .update(message)
      .digest("hex");

    return hmac;
  } catch (error) {
    throw new Error("Erro ao criar o HMAC");
  }
}
