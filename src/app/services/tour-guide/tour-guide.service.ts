import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Tour } from '../../tour-guide/tour-guide.component';
import Shepherd from 'shepherd.js';
import axios from 'axios'; // Import Axios
import { environment } from '../../../environments/environment'; // Import environment jika ada baseURL

@Injectable({
  providedIn: 'root'
})
export class TourGuideService {
  private dataListTour = new BehaviorSubject<Tour[]>([]);
  dataListTour$ = this.dataListTour.asObservable();

  private dataListTourAdmin = new BehaviorSubject<Tour[]>([]);
  dataListTourAdmin$ = this.dataListTourAdmin.asObservable();

  private tour: Shepherd.Tour | null = null;
  private steps: any[] = [];

  constructor() { }

  updateDataListTour(dataList: Tour[]) {
    this.dataListTour.next(dataList);
  }

  updateDataListTourAdmin(dataList: Tour[]) {
    this.dataListTourAdmin.next(dataList);
  }

  fetchDataFormTour() {
    axios
      .get(`${environment.apiUrl2}/tours`)
      .then((response) => {
        const tours: Tour[] = response.data; // Assuming response.data is of type Tour[]
        console.log('Tours:', response.data);
        this.updateDataListTour(tours);
      })
      .catch((error) => {
        if (error.response) {
          console.log('Error response:', error.response);
          if (error.response.status === 500) {
            console.log('Error data:', error.response.data); // Log the error data for debugging
            // Handle the error as needed, e.g., display a message in the UI or set an error state
            alert(error.response.data.Message || 'Terjadi kesalahan'); // Simple alert as an alternative
          }
        } else {
          console.error('Unexpected error:', error); // Handle unexpected errors
        }
      });
  }

    initTour(tourType: string) {
      this.tour = new Shepherd.Tour({
        defaultStepOptions: {
          classes: 'shepherd-theme-default',
          scrollTo: { behavior: 'smooth', block: 'center' }
        },
        useModalOverlay: true
      });
  
      switch (tourType) {
        case 'dashboardTour':
          this.addDashboardTourSteps();
          break;
        case 'itcmTour':
          this.addItcmTourSteps();
          break;
        case 'daTour':
          this.addDaTourSteps();
          break;
        case 'baTour':
          this.addBaTourSteps();
          break;
        default:
          console.warn(`Unknown tour type: ${tourType}`);
      }
    }
  
    private addDashboardTourSteps() {
      if (!this.tour) return;
  
      this.tour.addSteps([
        {
          id: 'dashboard-welcome', // ini diisi variabel tour_name
          text: 'Selamat datang di Dashboard. Mari kita mulai tour!',
          attachTo: {
            element: '#formListITCM',
            on: 'bottom',
          },
          buttons: [
            {
              text: 'Next',
              action: this.tour.next,
            },
          ],
        },
        // Tambahkan langkah-langkah lain untuk tour dashboard
        {
          id: 'dashboard-end',
          text: 'Ini adalah akhir dari tour dashboard.',
          buttons: [
            {
              text: 'Finish',
              action: () => {
                this.tour?.complete();
              },
            },
          ],
        },
      ]);
    }

  private addItcmTourSteps() {
    if (!this.tour) return;

    this.tour.addSteps([
      {
        id: 'itcm-welcome',
        text: 'Selamat datang di Form ITCM. Mari kita mulai tour!',
        attachTo: {
          element: '#header-itcm',
          on: 'bottom',
        },
        buttons: [
          {
            text: 'Next',
            action: this.tour.next,
          },
        ],
      },
      {
        id: 'itcm-end',
        text: 'Ini adalah akhir dari tour ITCM.',
        buttons: [
          {
            text: 'Finish',
            action: () => {
              this.tour?.complete();
            },
          },
        ],
      },
    ]);
  }

  private addDaTourSteps() {
    if (!this.tour) return;

    this.tour.addSteps([
      {
        id: 'da-welcome',
        text: 'Selamat datang di Tour DA. Mari kita mulai!',
        attachTo: {
          element: '#header-da', // Adjust the element ID based on your HTML
          on: 'bottom',
        },
        buttons: [
          {
            text: 'Next',
            action: this.tour.next,
          },
        ],
      },
      {
        id: 'da-end',
        text: 'Ini adalah akhir dari tour DA.',
        buttons: [
          {
            text: 'Finish',
            action: () => {
              this.tour?.complete();
            },
          },
        ],
      },
    ]);
  }

  private addBaTourSteps() {
    if (!this.tour) return;

    this.tour.addSteps([
      {
        id: 'ba-welcome',
        text: 'Selamat datang di Tour BA. Mari kita mulai!',
        attachTo: {
          element: '#header-ba', // Adjust the element ID based on your HTML
          on: 'bottom',
        },
        buttons: [
          {
            text: 'Next',
            action: this.tour.next,
          },
        ],
      },
      {
        id: 'ba-end',
        text: 'Ini adalah akhir dari tour BA.',
        buttons: [
          {
            text: 'Finish',
            action: () => {
              this.tour?.complete();
            },
          },
        ],
      },
    ]);
  }

  // Metode untuk memulai tour
  startTour() {
    if (this.tour) {
      this.tour.start();
    }
  }
}
