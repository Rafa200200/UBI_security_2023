import crypto from "crypto";
import derivate from "./derivate";

export default function createAes128Cbc({
  prevHash,
  date = new Date().toISOString(),
  message,
  hmac,
  secret,
  salt,
}: {
  prevHash: string;
  date?: string;
  message: string;
  hmac: string;
  secret: string;
  salt: Buffer;
}) {
  const iv = crypto.randomBytes(16);

  const derivatedSecret = derivate({ secret, salt });

  const cipher = crypto.createCipheriv("aes-128-cbc", derivatedSecret, iv);
  let cipherText = cipher.update(
    `
    ${prevHash}$
    ${date}$
    ${message}$
    ${hmac}
  `,
    "utf8",
    "hex"
  );
  cipherText += cipher.final("hex");
  const cipherTextWithIv = `${cipherText}:${iv.toString("hex")}`;

  return cipherTextWithIv;
}
