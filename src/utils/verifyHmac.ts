import crypto from "crypto";
import derivate from "./derivate";

export default function verifyHmac({
  hmac,
  secret,
  message,
  lastHash,
  date,
  salt,
  hmac_type,
}: {
  hmac: string;
  secret: string;
  message: string;
  lastHash: string;
  date: string;
  salt: Buffer;
  hmac_type: 256 | 512;
}) {
  try {
    const derivated = derivate({
      secret,
      salt,
    });

    const hmacToVerify = crypto
      .createHmac(`sha${hmac_type}`, derivated)
      .update(`${lastHash}$${date}$${message}`)
      .digest("hex");

    return hmac === hmacToVerify;
  } catch (error) {
    throw new Error("Erro ao criar o HMAC");
  }
}
