import crypto from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const SALT_LENGTH = 16

/**
 * Encrypt a plain-text string using AES-256-GCM with a PBKDF2 derived key.
 * Format: salt:iv:authTag:encryptedText
 */
export function encrypt(text: string, secretKey: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const salt = crypto.randomBytes(SALT_LENGTH)
  // Derive key from the secret key and the salt
  const key = crypto.pbkdf2Sync(secretKey, salt, 100000, 32, 'sha256')
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag().toString('hex')
  return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag}:${encrypted}`
}

/**
 * Decrypt a cipher-text string formatted as salt:iv:authTag:encryptedText
 */
export function decrypt(encryptedText: string, secretKey: string): string {
  const parts = encryptedText.split(':')
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted format')
  }

  const salt = Buffer.from(parts[0], 'hex')
  const iv = Buffer.from(parts[1], 'hex')
  const authTag = Buffer.from(parts[2], 'hex')
  const encrypted = parts[3]

  const key = crypto.pbkdf2Sync(secretKey, salt, 100000, 32, 'sha256')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
