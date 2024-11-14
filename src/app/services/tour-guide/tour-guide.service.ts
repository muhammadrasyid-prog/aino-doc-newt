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

  private dashboardTourSteps: Tour[] = []; // Simpan langkah-langkah dashboard tour
  private itcmTourSteps: Tour[] = []; // Simpan langkah-langkah ITCM tour

  private tour: Shepherd.Tour | null = null;
  private steps: any[] = [];
  private tours: Tour[] = [];

  constructor() { }

  updateDataListTour(dataList: Tour[]) {
    this.dataListTour.next(dataList);
  }

  updateDataListTourAdmin(dataList: Tour[]) {
    this.dataListTourAdmin.next(dataList);
  }

  fetchAllDataTour() {
    axios.get(`${environment.apiUrl2}/tours`)
      .then((response) => {
        console.log('Response data:', response.data);
        this.updateDataListTour(response.data);
        this.addDashboardTourSteps(); 
        // Simpan langkah-langkah tour berdasarkan nama tour
        this.dashboardTourSteps = response.data.filter((tour: Tour) => tour.tour_name === 'dashboardtour');
        this.itcmTourSteps = response.data.filter((tour: Tour) => tour.tour_name === 'Product Tour');

        // Panggil langkah-langkah hanya jika ada data
        if (this.dashboardTourSteps.length > 0) {
          this.addDashboardTourSteps(); // Menambahkan langkah untuk dashboard
        } else {
          console.log('Tidak ada data untuk dashboard tour.');
        }

        if (this.itcmTourSteps.length > 0) {
          this.addItcmTourSteps(); // Menambahkan langkah untuk ITCM
        } else {
          console.log('Tidak ada data untuk ITCM tour.');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

    // Inisialisasi tour berdasarkan jenis yang dipilih
    initTour(tourType: 'dashboardTour' | 'itcmTour') {
      this.steps = []; // Reset langkah-langkah sebelumnya
  
      if (this.tour) {
        this.tour.complete();
      }
  
      this.tour = new Shepherd.Tour({
        defaultStepOptions: {
          classes: 'shepherd-theme-default',
          scrollTo: { behavior: 'smooth', block: 'center' },
        },
        useModalOverlay: true,
      });
  
      // Menambahkan langkah-langkah berdasarkan jenis tour
      if (tourType === 'dashboardTour') {
        this.addDashboardTourSteps();
      } else if (tourType === 'itcmTour') {
        this.addItcmTourSteps();
      }
      // Tambahkan tour lainnya jika perlu
    }

    private addDashboardTourSteps() {
      if (!this.tour || this.dataListTour.value.length === 0) {
        console.log("Tour tidak ada atau tidak ada data tour untuk ditambahkan.");
        return;
      }
    
      // Kosongkan steps sebelum menambahkan langkah baru
      this.steps = [];
    
      // Urutkan dataListTour berdasarkan step_order sebelum menambahkannya
      const sortedTourSteps = [...this.dataListTour.value].sort((a, b) => a.step_order - b.step_order);
    
      // Iterasi dataListTour yang sudah diurutkan dan tambahkan setiap langkah ke array steps
      sortedTourSteps.forEach(tour => {
        this.steps.push({
          id: tour.tour_uuid, // Menggunakan UUID sebagai ID unik
          title: tour.title, // Menggunakan judul dari data
          text: tour.content, // Menggunakan konten dari data
          attachTo: {
            element: tour.element_id, // Menentukan elemen yang dilampirkan
            on: tour.placement, // Menentukan penempatan
          },
          buttons: [
            {
              text: 'Cancel',
              action: this.tour?.cancel, // Tombol untuk melanjutkan ke langkah berikutnya
            },
            {
              text: 'Next',
              action: this.tour?.next, // Tombol untuk melanjutkan ke langkah berikutnya
            },
          ],
        });
      });
    
      // Tambahkan semua langkah sekaligus ke tour
      this.tour?.addSteps(this.steps);
      console.log("Langkah-langkah tour berhasil ditambahkan dalam urutan.");
    
      // Langkah akhir tour
      this.tour?.addStep({
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
      });
    }    

    private addItcmTourSteps() {
      if (!this.tour || this.dataListTour.value.length === 0) {
        console.log("Tour tidak ada atau tidak ada data tour untuk ditambahkan.");
        return;
      }
    
      // Kosongkan steps sebelum menambahkan langkah baru
      this.steps = [];
    
      // Urutkan dataListTour berdasarkan step_order sebelum menambahkannya
      const sortedTourSteps = [...this.dataListTour.value].sort((a, b) => a.step_order - b.step_order);
    
      // Iterasi dataListTour yang sudah diurutkan dan tambahkan setiap langkah ke array steps
      sortedTourSteps.forEach(tour => {
        this.steps.push({
          id: tour.tour_uuid, // Menggunakan UUID sebagai ID unik
          title: tour.title, // Menggunakan judul dari data
          text: tour.content, // Menggunakan konten dari data
          attachTo: {
            element: tour.element_id, // Menentukan elemen yang dilampirkan
            on: tour.placement, // Menentukan penempatan
          },
          buttons: [
            {
              text: 'Next',
              action: this.tour?.next, // Tombol untuk melanjutkan ke langkah berikutnya
            },
          ],
        });
      });
    
      // Tambahkan semua langkah sekaligus ke tour
      this.tour?.addSteps(this.steps);
      console.log("Langkah-langkah tour berhasil ditambahkan dalam urutan.");
    
      // Langkah akhir tour
      this.tour?.addStep({
        id: 'ITCM-end',
        text: 'Ini adalah akhir dari tour ITCM.',
        buttons: [
          {
            text: 'Finish',
            action: () => {
              this.tour?.complete();
            },
          },
        ],
      });
    }
      // Tambahkan langkah-langkah untuk tour I    
  
    // Metode untuk memulai tour
    startTour() {
      console.log("Memulai tour...");
      if (this.tour) {
          console.log("Tour dimulai.");
          const element = document.querySelector('#formListDA');
          console.log("Elemen ditemukan untuk tour:", element !== null);
          this.tour.start();
      } else {
          console.log("Tour belum diinisialisasi.");
      }
  }
  

}
