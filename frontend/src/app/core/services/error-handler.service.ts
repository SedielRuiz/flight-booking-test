import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor() {}

  public handleHttpError(error: HttpErrorResponse): void {
    let errorMessage = 'Ha ocurrido un error inesperado. Por favor, intenta más tarde.';
    let errorTitle = 'Error';

    if (error.error instanceof ErrorEvent) {
      // Network or client-side error
      errorMessage = error.error.message;
    } else {
      // The backend returned an unsuccessful response code
      if (error.status === 401) {
        errorTitle = 'Authentication Required';
        errorMessage = 'Your session has expired or you are not authorized to perform this action.';
      } else if (error.error && error.error.message) {
        // Use the standardized message from the backend ({ data, message })
        errorMessage = error.error.message;
      }
    }

    this.showErrorModal(errorTitle, errorMessage);
  }

  private showErrorModal(title: string, message: string): void {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonColor: '#E20025', // Davivienda Red for rich aesthetics
      confirmButtonText: 'Accept',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-xl shadow-lg',
      }
    });
  }
}
