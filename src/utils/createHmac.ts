import * as crypto from "crypto";
import derivate from "./derivate";

export default function createHmac({
  secret,
  message,
  lastHash,
  date = new Date().toISOString(),
  salt,
  type,
}: {
  secret: string;
  message: string;
  lastHash: string;
  date: string;
  salt: Buffer;
  type: 256 | 512;
}) {
  try {
    const derivated = derivate({
      secret,
      salt,
    });

    const hmac = crypto
      .createHmac(`sha${type}`, derivated)
      .update(`${lastHash}$${date}$${message}`)
      .digest("hex");

    return hmac;
  } catch (error) {
    throw new Error("Erro ao criar o HMAC");
  }
}
