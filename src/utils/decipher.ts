import crypto from "crypto";
import derivate from "./derivate";

function clean(text: string) {
  return text.replace(/(\r\n|\n|\r)/gm, "").trim();
}

export default function decipher({
  cipherText,
  secret,
  salt,
}: {
  cipherText: string;
  secret: string;
  salt: Buffer;
}) {
  const [ciphertext, iv] = cipherText.split(":");

  const ivBuffer = Buffer.from(iv, "hex");

  const ciphertextBuffer = Buffer.from(ciphertext, "hex");

  const derivedKey = derivate({ secret, salt });

  const decipher = crypto.createDecipheriv("aes-128-cbc", derivedKey, ivBuffer);

  const decryptedBuffer = decipher.update(ciphertextBuffer);
  let decrypted = decryptedBuffer.toString("utf-8");
  decrypted += decipher.final("utf-8");

  const [prevHash, date, message, hmac] = decrypted.split("$");

  const cleanPrevHash = clean(prevHash);
  const cleanDate = clean(date);
  const cleanMessage = clean(message);
  const cleanHmac = clean(hmac);

  return {
    prevHash: cleanPrevHash,
    date: cleanDate,
    message: cleanMessage,
    hmac: cleanHmac,
  };
}
