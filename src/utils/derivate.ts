import crypto from "crypto";

export default function derivate({
  secret,
  salt,
}: {
  secret: string;
  salt: Buffer;
}) {
  const iterations = 10000;
  const keylen = 16;
  const digest = "sha256";

  const derivedKey = crypto.pbkdf2Sync(
    secret,
    salt,
    iterations,
    keylen,
    digest
  );

  return derivedKey;
}
