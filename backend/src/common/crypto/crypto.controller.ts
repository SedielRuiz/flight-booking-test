import { Controller, Get } from '@nestjs/common';
import { CryptoService } from './crypto.service.js';
import { Public } from '@common/decorators/public.decorator.js';
import { ROUTES } from '@common/constants/routes.constant.js';

@Controller(ROUTES.CRYPTO.BASE)
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Public()
  @Get(ROUTES.CRYPTO.PUBLIC_KEY)
  getPublicKey() {
    return { publicKey: this.cryptoService.getPublicKey() };
  }
}
