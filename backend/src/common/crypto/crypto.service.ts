import { Injectable, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService implements OnModuleInit {
  private privateKey!: string;
  private publicKey!: string;

  onModuleInit() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  decryptRSA(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );
    return decrypted.toString('utf8');
  }
}
