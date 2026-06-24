import { describe, expect, it } from 'vitest'
import { decrypt, encrypt } from './crypto-fns'

describe('crypto-fns utilities', () => {
  const SECRET_KEY = 'my-super-secret-key-that-is-32-chars-long-or-more'
  const TEXT = 'Hello, this is a secret message!'

  it('should encrypt and decrypt correctly with the same key', () => {
    const encrypted = encrypt(TEXT, SECRET_KEY)
    expect(encrypted).toBeDefined()
    expect(typeof encrypted).toBe('string')
    expect(encrypted.split(':')).toHaveLength(4)

    const decrypted = decrypt(encrypted, SECRET_KEY)
    expect(decrypted).toBe(TEXT)
  })

  it('should throw an error during decryption if the format is invalid', () => {
    expect(() => decrypt('invalid-format', SECRET_KEY)).toThrow('Invalid encrypted format')
    expect(() => decrypt('part1:part2:part3', SECRET_KEY)).toThrow('Invalid encrypted format')
    expect(() => decrypt('part1:part2:part3:part4:part5', SECRET_KEY)).toThrow(
      'Invalid encrypted format',
    )
  })

  it('should throw an error if decrypting with the wrong key', () => {
    const encrypted = encrypt(TEXT, SECRET_KEY)
    const WRONG_KEY = 'wrong-key-secret-that-does-not-match'
    expect(() => decrypt(encrypted, WRONG_KEY)).toThrow()
  })

  it('should throw an error if the encrypted text has been tampered with', () => {
    const encrypted = encrypt(TEXT, SECRET_KEY)
    const parts = encrypted.split(':')
    // Tamper with the encrypted text part
    parts[3] = 'deadbeef'
    const tampered = parts.join(':')
    expect(() => decrypt(tampered, SECRET_KEY)).toThrow()
  })
})
