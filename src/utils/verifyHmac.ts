import crypto from "crypto";
import derivate from "./derivate";

export default function verifyHmac({
  hmac,
  secret,
  message,
  lastHash,
  date,
  salt,
}: {
  hmac: string;
  secret: string;
  message: string;
  lastHash: string;
  date: string;
  salt: Buffer;
}) {
  try {
    const derivated = derivate({
      secret,
      salt,
    });

    const hmacToVerify = crypto
      .createHmac("sha256", derivated)
      .update(`${lastHash}$${date}$${message}`)
      .digest("hex");

    return hmac === hmacToVerify;
  } catch (error) {
    throw new Error("Erro ao criar o HMAC");
  }
}
