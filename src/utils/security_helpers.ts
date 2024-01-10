import crypto from "crypto";

export const encription = (key: string) => {
  const ENCRYPTION_KEY: string = key; // Should be securely managed
  const IV_LENGTH = 16;

  function encrypt(string: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let encrypted = cipher.update(string);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  }

  function decrypt(string: string) {
    const [ivHex, encryptedHex] = string.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  const encryptCredentials = (username: string, password: string) => {
    return encrypt(`${encrypt(username)}*${encrypt(password)}`);
  };

  const dencryptCredentials = (creads: string) => {
    return decrypt(creads).split("*").map(decrypt);
  };

  return {
    encrypt,
    decrypt,
    encryptCredentials,
    dencryptCredentials,
  };
};
