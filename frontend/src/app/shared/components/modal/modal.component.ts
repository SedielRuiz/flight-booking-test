import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  @Input() isVisible = false;
  @Input() title = '';
  @Input() message = '';
  @Input() messageHtml = '';
  @Input() iconClass = 'bi-info-circle-fill';
  @Input() iconColor = 'text-primary';
  @Input() confirmText = 'Entendido';
  @Input() confirmBtnClass = 'btn-primary';
  @Input() showCloseHeaderBtn = true;

  @Output() closeEvent = new EventEmitter<void>();

  onClose() {
    this.closeEvent.emit();
  }
}
