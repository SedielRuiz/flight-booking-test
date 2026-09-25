import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ENDPOINTS } from '@core/constants/api-endpoints.constant';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private http = inject(HttpClient);

  async getPublicKey(): Promise<string> {
    const result = await firstValueFrom(
      this.http.get<ApiResponse<{ publicKey: string }>>(
        API_ENDPOINTS.CRYPTO.PUBLIC_KEY,
      ),
    );
    return result.data.publicKey;
  }

  async encryptRSA(pem: string, data: string): Promise<string> {
    // 1. Clean the PEM string
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = pem
      .substring(
        pem.indexOf(pemHeader) + pemHeader.length,
        pem.indexOf(pemFooter),
      )
      .replace(/\s/g, '');

    // 2. Base64 decode to binary
    const binaryDerString = window.atob(pemContents);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    // 3. Import Key into Web Crypto API
    const key = await window.crypto.subtle.importKey(
      'spki',
      binaryDer.buffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt'],
    );

    // 4. Encrypt the data
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      key,
      encoded,
    );

    // 5. Convert encrypted ArrayBuffer back to Base64 string for the backend
    const encryptedArray = new Uint8Array(ciphertext);
    let binaryStr = '';
    for (let i = 0; i < encryptedArray.byteLength; i++) {
      binaryStr += String.fromCharCode(encryptedArray[i]);
    }
    return window.btoa(binaryStr);
  }
}
