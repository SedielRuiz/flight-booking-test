import { Body, Controller, Post } from '@nestjs/common';
import { ROUTES } from '@common/constants/routes.constant.js';
import { ProcessPaymentDto } from './dtos/process-payment.dto.js';
import { PaymentsService } from './payments.service.js';

@Controller(ROUTES.PAYMENTS.BASE)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async processPayment(@Body() dto: ProcessPaymentDto) {
    return this.paymentsService.processPayment(dto);
  }
}
