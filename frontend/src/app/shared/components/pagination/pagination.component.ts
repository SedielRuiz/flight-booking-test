import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationMeta } from '@core/interfaces/api-response.interface';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: []
})
export class PaginationComponent {
  @Input() meta!: PaginationMeta | null | undefined;
  @Output() pageChange = new EventEmitter<number>();
  @Output() limitChange = new EventEmitter<number>();

  onPageChange(page: number): void {
    if (this.meta && page >= 1 && page <= this.meta.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onLimitChange(event: any): void {
    const limit = parseInt(event.target.value, 10);
    this.limitChange.emit(limit);
  }
}
