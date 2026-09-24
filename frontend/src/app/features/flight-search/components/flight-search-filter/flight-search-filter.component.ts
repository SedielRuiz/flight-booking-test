import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { City } from '@core/interfaces/city.interface';
import { CitiesService } from '@core/services/api/cities.service';
import Choices from 'choices.js';
import flatpickr from 'flatpickr';
import { SearchFlightsParams } from '@core/interfaces/search-flights-params.interface';

@Component({
  selector: 'app-flight-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flight-search-filter.component.html',
})
export class FlightSearchFilterComponent implements OnInit, AfterViewInit {
  @Input() isLoading = false;
  @Output() search = new EventEmitter<SearchFlightsParams>();

  @ViewChild('datePicker') datePickerElement!: ElementRef;
  @ViewChild('originSelect') originSelectElement!: ElementRef;
  @ViewChild('destinationSelect') destSelectElement!: ElementRef;

  private fb = inject(FormBuilder);
  private citiesService = inject(CitiesService);

  searchForm!: FormGroup;
  cities: City[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadCities();
  }

  ngAfterViewInit(): void {
    if (this.datePickerElement) {
      flatpickr(this.datePickerElement.nativeElement, {
        mode: 'range',
        dateFormat: 'Y-m-d',
        defaultDate: [
          this.searchForm.get('startDate')?.value,
          this.searchForm.get('endDate')?.value,
        ],
        onChange: (selectedDates) => {
          if (selectedDates.length === 2) {
            const startStr = selectedDates[0].toISOString().split('T')[0];
            const endStr = selectedDates[1].toISOString().split('T')[0];
            this.searchForm.patchValue({
              startDate: startStr,
              endDate: endStr,
            });
          } else {
            this.searchForm.patchValue({ startDate: '', endDate: '' });
          }
        },
      });
    }
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    this.searchForm = this.fb.group({
      originId: [''],
      destinationId: [''],
      startDate: [today],
      endDate: [nextWeekStr],
      date: ['']
    });
  }

  private loadCities(): void {
    this.citiesService.getCities().subscribe({
      next: (res) => {
        this.cities = res.data;
        setTimeout(() => this.initChoices(), 0);
      },
    });
  }

  private initChoices(): void {
    const choicesConfig = {
      searchEnabled: true,
      searchPlaceholderValue: 'Search city...',
      itemSelectText: '',
      shouldSort: false,
    };

    if (this.originSelectElement) {
      const originChoices = new Choices(
        this.originSelectElement.nativeElement,
        choicesConfig,
      );
      this.originSelectElement.nativeElement.addEventListener(
        'change',
        (e: any) => {
          this.searchForm.patchValue({ originId: e.target.value });
        },
      );
    }

    if (this.destSelectElement) {
      const destChoices = new Choices(
        this.destSelectElement.nativeElement,
        choicesConfig,
      );
      this.destSelectElement.nativeElement.addEventListener(
        'change',
        (e: any) => {
          this.searchForm.patchValue({ destinationId: e.target.value });
        },
      );
    }
  }

  onSearchSubmit(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const { originId, destinationId, startDate, endDate } = this.searchForm.value;
    this.search.emit({ originId, destinationId, startDate, endDate });
  }
}
