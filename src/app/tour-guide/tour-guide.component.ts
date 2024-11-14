import { Component, Inject, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TourGuideService } from '../services/tour-guide/tour-guide.service';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShepherdService } from 'angular-shepherd';
import Shepherd from 'shepherd.js';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from "@angular/cdk/drag-drop";


interface Tour {
  tour_uuid: string;
  tour_name: string;
  page_url: string;
  page_name: string;
  step_order: number;
  element_id: string;
  title: string;
  content: string;
  placement: string;
  buttons: string;
  completed: boolean;
  created_at: string;       // Date untuk tanggal dan waktu
  updated_at: string;       // Date untuk tanggal dan waktu
  deleted_at: string;      // Optional karena bisa null
}

interface TourGroup {
  tour_name: string;
  page_name: string;
  steps: { step_order: number; title: string }[]; // Steps yang terkait dengan tour
}

@Component({
  selector: 'app-tour-guide',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CdkDropList, CdkDrag ],
  templateUrl: './tour-guide.component.html',
  styleUrl: './tour-guide.component.css'
})
export class TourGuideComponent implements OnInit{

  tour_uuid: string = '';
  tour_name: string = '';
  page_url: string = '';
  page_name: string = '';
  step_order: string = '';
  element_id: string = '';
  title: string = '';
  content: string = '';
  placement: string = '';
  buttons: string = '';
  completed: boolean = false;
  created_at: string = '';
  updated_at: string = '';
  deleted_at: string = '';

  user_uuid: any;
  user_name: any;
  role_code: any; 

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;

  private tour: Shepherd.Tour | null = null;
  private steps: any[] = [];
  tourSteps: Array<any> = [];

  constructor(
    private cookieService: CookieService,
    public tourService: TourGuideService,
    private shepherdService: ShepherdService,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  dataListTour: any[] = [];
  groupedTours: any[] = [];

  woi: Tour[] = [];

  ngOnInit(): void {
    this.fetchDataTour();
    this.profileData();
    this.tourService.fetchAllDataTour();
    this.tourService.dataListTour$.subscribe(data => {
      if (data.length > 0) {
          this.tourService.initTour('dashboardTour'); // Panggil initTour setelah data ada
      }
  });
  }

  profileData(): void {
    const token = this.cookieService.get('userToken');

    axios
      .get(`${this.apiUrl}/auth/my/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response);
        this.user_uuid = response.data.user_uuid;
        this.user_name = response.data.user_name;
        this.role_code = response.data.role_code;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchDataTour() {
    axios
      .get(`${environment.apiUrl2}/tours`)
      .then((response) => {
        this.dataListTour = response.data;
        console.log('Data list tour:', response.data);
        this.tourService.updateDataListTour(this.dataListTour);

        // this.tour_uuid = response.data.tour_uuid
        this.woi = response.data;
        
        // Mengelompokkan data berdasarkan tour_name dan page_name
        const grouped = this.groupByTour(response.data);
        this.groupedTours = grouped; // Menyimpan hasil pengelompokan di groupedTours
        console.log(this.groupedTours); // Debug output
      })
      .catch((error) => {
        if (error.response.status === 500) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }   
      });
    }


    groupByTour(tourData: Tour[]): TourGroup[] {
      const grouped: TourGroup[] = [];
    
      // Iterasi untuk setiap step
      tourData.forEach((step) => {
        // Mencari grup yang sudah ada berdasarkan tour_name dan page_name
        let tourGroup = grouped.find(
          (item) => item.tour_name === step.tour_name && item.page_name === step.page_name
        );
    
        // Jika grup belum ada, buat grup baru
        if (!tourGroup) {
          tourGroup = {
            tour_name: step.tour_name,
            page_name: step.page_name,
            steps: [], // Array untuk menyimpan steps
          };
          grouped.push(tourGroup); // Menambahkan grup baru ke grouped
        }
    
        // Menambahkan step ke dalam grup yang sudah ada
        tourGroup.steps.push({
          step_order: step.step_order,
          title: step.title,
        });
      });
    
      // Sort steps within each group and reassign step_order
      grouped.forEach((group) => {
        group.steps.sort((a, b) => {
          return Number(a.step_order) - Number(b.step_order);
        });
    
        // Reassign step_order starting from 1
        group.steps.forEach((step, index) => {
          step.step_order = index + 1;
        });
      });
    
      return grouped;
    }

    // onDrop(event: CdkDragDrop<Tour[]>) {
    //   moveItemInArray(this.tourSteps, event.previousIndex, event.currentIndex);
    // }

    onDrop(event: CdkDragDrop<any[]>) {
      // Memindahkan item dalam array berdasarkan drag & drop
      moveItemInArray(this.tourSteps, event.previousIndex, event.currentIndex);
    
      // Update urutan step berdasarkan urutan baru
      this.tourSteps.forEach((step, index) => {
        step.step_order = index + 1; // Perbarui step_order
      });
    }    

    trackById(index: number, step: any): number {
      return step.id; // Gunakan id unik untuk melacak item
    }    

    // Array untuk menyimpan status accordion (true jika open, false jika closed)
    accordionStatus: boolean[] = this.tourSteps.map(() => true);

    // Fungsi untuk toggle status accordion
    toggleAccordion(index: number): void {
      this.accordionStatus[index] = !this.accordionStatus[index];
    }

    // Fungsi untuk memeriksa apakah accordion terbuka atau tidak
    isAccordionOpen(index: number): boolean {
      return this.accordionStatus[index];
    }


  openModalAdd() {
    this.tour_name = '';
    this.page_name = '';
    this.page_url = '';
    this.step_order = '';
    this.element_id = '';
    this.title = '';
    this.content = '';
    this.placement = '';
    this.buttons = '';
    this.tourSteps = []; // Reset tourSteps untuk modal add
    this.isModalAddOpen = true;
    this.addNewStep();
  }

  closeModalAdd() {
    this.isModalAddOpen = false;
    // Reset semua data setelah modal ditutup
    // this.tour_name = '';
    // this.page_name = '';
    // this.page_url = '';
    // this.tourSteps = [];
  }

  addTour() {
    const token = this.cookieService.get('userToken');
    
    // Mengirimkan setiap langkah (step) secara terpisah
    this.tourSteps.forEach((step, index) => {
      axios
        .post(`${environment.apiUrl2}/superadmin/tour/add`, 
          {
            tour_name: this.tour_name,
            page_name: this.page_name,
            step_order: step.step_order,
            element_id: step.element_id,
            title: step.title,
            content: step.content,
            placement: step.placement,
            buttons: step.buttons,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        .then((response) => {
          if (index === this.tourSteps.length - 1) { // terakhir step
            this.fetchDataTour(); 
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Tour dan steps baru ditambahkan',
              timer: 2000,
              timerProgressBar: true,
              showCancelButton: false,
              showConfirmButton: false,
            });
            this.isModalAddOpen = false;
          }
        })
        .catch((error) => {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        });
    });
  }

  addNewStep() {
    this.tourSteps.push({
      tour_name: this.tour_name,
      page_name: this.page_name,
      step_order: this.tourSteps.length + 1, // memberikan nomor urutan otomatis
      element_id: [''],
      title: [''],
      content: [''],
      placement: [''],
      buttons: 'Next'
    });
  }  

  removeStep(index: number) {
    if (this.tourSteps.length > 1) {
      this.tourSteps.splice(index, 1);
    } else {
      alert("At least one step is required!");
    }
  }

  removeTourStep(index: number) {
    const token = this.cookieService.get('userToken');
    const step = this.tourSteps[index];
  
    if (this.tourSteps.length > 1) {
      if (step.tour_uuid) {
        Swal.fire({
          title: 'Konfirmasi',
          text: 'Anda yakin ingin menghapus step ini?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ya',
          cancelButtonText: 'Tidak',
        }).then((result) => {
          if (result.isConfirmed) {
            // Panggil API delete step dengan UUID step
            axios({
              method: 'PUT',
              url: `${environment.apiUrl2}/superadmin/tour/step/delete/${step.tour_uuid}`,
              headers: {
                Authorization: `Bearer ${token}`, // Pastikan token dikirim dengan format yang benar
              },
            }).then((response) => {
              // Update frontend setelah penghapusan berhasil
              this.tourSteps.splice(index, 1);
              this.accordionStatus.splice(index, 1); // Hapus status juga
              this.fetchDataTour();
              Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: response.data.message,
                timer: 2000,
                timerProgressBar: true,
                showCancelButton: false,
                showConfirmButton: false,
              });
            }).catch((error) => {
              console.log(error);
              Swal.fire({
                title: 'Error',
                text: error.response ? error.response.data.message : 'Unknown error',
                icon: 'error',
              });
            });
          }
        });
      }
    } else {
      alert("At least one step is required!");
    }
  }  
  
  // openEditModal(tour_uuid: string) {
  //   this.tour_uuid = tour_uuid;
  //   axios
  //     .get(`${environment.apiUrl2}/tour/${tour_uuid}`)
  //     .then((response) => {
  //       this.isModalEditOpen = true;
  //       this.tour_name = response.data.tour_name;
  //       this.page_url = response.data.page_url;
  //       this.page_name = response.data.page_name;
  //       this.step_order = response.data.step_order;
  //       this.element_id = response.data.element_id;
  //       this.title = response.data.title;
  //       this.content = response.data.content;
  //       this.placement = response.data.placement;
  //       this.buttons = response.data.buttons;
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       if (error.response.status === 404) {
  //         Swal.fire({
  //           title: 'Error',
  //           text: error.response.data.message,
  //           icon: 'error',
  //           timer: 2000,
  //           timerProgressBar: true,
  //           showCancelButton: false,
  //           showConfirmButton: false,
  //         });
  //       }
  //     });
  //   this.isModalEditOpen = true;
  // }

  openEditModal(tour_name: string) {

    console.log('tour_name:', tour_name); // Debugging tour_name

    // Ambil data tour berdasarkan tour_name dari API
    axios
    .get(`${environment.apiUrl2}/tour/steps/${tour_name}`)
    .then((response) => {
      console.log("API Response:", response.data); // Debugging untuk cek respons
      this.isModalEditOpen = true;
      
      const tourData = response.data;
 
      if (tourData && tourData.steps) {
        this.tour_name = tourData.tour_name;
        this.page_name = tourData.page_name;
        this.tourSteps = tourData.steps.map((step: any) => ({
          tour_uuid: step.tour_uuid,
          step_order: step.step_order,
          element_id: step.element_id,
          title: step.title,
          content: step.content,
          placement: step.placement,
          buttons: step.buttons,
        }));
      } else {
        console.log("No steps found for tour:", tour_name); // Jika tidak ada langkah
      }
    })
    .catch((error) => {
      console.log("API Error:", error); // Log error
      if (error.response) {
        console.log("Error Response:", error.response.data); // Detil error response
        if (error.response.status === 404) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      }
    });
 
}

  closeModalEdit() {
    this.isModalEditOpen = false;
    // Reset semua data setelah modal ditutup
    // this.tour_name = '';
    // this.page_name = '';
    // this.page_url = '';
    // this.tourSteps = [];
  }

  // updateTour(): void {
  //   const token = this.cookieService.get('userToken');
  //   const data = {
  //     tour_name: this.tour_name,
  //     page_url: this.page_url,
  //     page_name: this.page_name,
  //     step_order: this.step_order,
  //     element_id: this.element_id,
  //     title: this.title,
  //     content: this.content,
  //     placement: this.placement,
  //     buttons: this.buttons,
  //   }
  //   console.log('tour_uuid:', this.tour_uuid);
  //   axios
  //     .put(`${environment.apiUrl2}/superadmin/tour/update/${this.tour_uuid}`, data,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }
  //   )
  //   .then((response) => {
  //     console.log(response.data);
  //     this.fetchDataTour();
  //     Swal.fire({
  //       icon: 'success',
  //       title: 'Berhasil',
  //       text: 'Tour diperbarui',
  //       timer: 2000,
  //       timerProgressBar: true,
  //       showCancelButton: false,
  //       showConfirmButton: false,
  //     });
  //   })
  //   .catch((error) => {
  //     console.log(error);{
  //       Swal.fire({
  //         title: 'Error',
  //         text: error.response.data.message,
  //         icon: 'error',
  //         timer: 2000,
  //         timerProgressBar: true,
  //         showCancelButton: false,
  //         showConfirmButton: false,
  //       });
  //     }
  //   });
  // } 

  updateTour(): void {
    const token = this.cookieService.get('userToken');
  
    // Step 1: Loop melalui langkah-langkah yang ada (tourSteps)
    this.tourSteps.forEach((step) => {
      const updatedStep = {
        tour_uuid: step.tour_uuid,           // UUID untuk langkah yang sudah ada
        tour_name: this.tour_name,           // Tour name dari modal
        page_name: this.page_name,           // Page name dari modal
        step_order: step.step_order,         // Urutan langkah
        element_id: step.element_id,         // Element ID untuk highlight
        title: step.title,                   // Judul dari langkah
        content: step.content,               // Konten dari langkah
        placement: step.placement,           // Posisi popup
        buttons: step.buttons                // Tombol pada step
      };
      
      console.log('Step UUID:', step.tour_uuid);

      // Jika step ini sudah memiliki UUID, lakukan PUT (Update step yang ada)
      if (step.tour_uuid) {
        axios
          .put(`${environment.apiUrl2}/superadmin/tour/update/${updatedStep.tour_uuid}`, updatedStep, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            console.log('Step updated:', response.data);
            this.fetchDataTour();
          })
          .catch((error) => {
            console.log(error);
            Swal.fire({
              title: 'Error',
              text: error.response.data.message,
              icon: 'error',
              timer: 2000,
              timerProgressBar: true,
              showCancelButton: false,
              showConfirmButton: false,
            });
          });
      }
      // Jika tidak ada UUID, maka ini adalah langkah baru, gunakan POST
      else {
        console.log('Adding new step:', updatedStep);
        axios
          .post(`${environment.apiUrl2}/superadmin/tour/add`, {
            tour_name: this.tour_name,         // Nama tour baru
            page_name: this.page_name,         // Nama halaman
            step_order: step.step_order,       // Urutan step baru
            element_id: step.element_id,       // Element ID dari step baru
            title: step.title,                 // Title dari step baru
            content: step.content,             // Content dari step baru
            placement: step.placement,         // Placement dari step baru
            buttons: step.buttons              // Tombol dari step baru
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            console.log('Step added:', response.data);
            this.fetchDataTour();
          })
          .catch((error) => {
            console.log(error);
            Swal.fire({
              title: 'Error',
              text: error.response.data.message,
              icon: 'error',
              timer: 2000,
              timerProgressBar: true,
              showCancelButton: false,
              showConfirmButton: false,
            });
          });
      }
    });
  
    // Setelah semua langkah diproses (baik PUT maupun POST), refresh data
    this.fetchDataTour();
    this.isModalEditOpen = false;
  
    Swal.fire({
      icon: 'success',
      title: 'Tour updated successfully',
      timer: 2000,
      showConfirmButton: false,
    });
  }
  

    onDeleteTour(tour_name: string): void {
      Swal.fire({
        title: 'Konfirmasi',
        text: 'Anda yakin ingin menghapus Tour ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya',
        cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeleteTour(tour_name);
      }
    });  
  }

  performDeleteTour(tour_name: string): void {
    const token = this.cookieService.get('userToken');

    axios
      .put(`${environment.apiUrl2}/superadmin/tour/delete/${tour_name}`, {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            tour_name: tour_name,       // Identify the tour to delete
            // page_name: page_name,       // Include the page name as well
          }
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataTour();
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: response.data.message,
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        if (error.response.status === 404 || error.response.status === 500) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      });
    }

  // performDeleteTour(tour_name: string, step_uuid?: string): void {
  //   const token = this.cookieService.get('userToken');
  
  //   // Jika `step_uuid` disediakan, berarti kita akan menghapus step
  //   if (step_uuid) {
  //     axios
  //       .put(`${environment.apiUrl2}/superadmin/tour/step/delete/${step_uuid}`, {}, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         }
  //       })
  //       .then((response) => {
  //         console.log('Step deleted:', response.data.message);
  //         this.fetchDataTour();
  //         Swal.fire({
  //           icon: 'success',
  //           title: 'Step berhasil dihapus',
  //           timer: 2000,
  //           timerProgressBar: true,
  //           showCancelButton: false,
  //           showConfirmButton: false,
  //         });
  //       })
  //       .catch((error) => {
  //         console.log('Error deleting step:', error);
  //         Swal.fire({
  //           title: 'Error',
  //           text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus step',
  //           icon: 'error',
  //           timer: 2000,
  //           timerProgressBar: true,
  //           showCancelButton: false,
  //           showConfirmButton: false,
  //         });
  //       });
  //   } 
  //   // Jika `step_uuid` tidak disediakan, kita akan menghapus tour
  //   else {
  //     axios
  //       .put(`${environment.apiUrl2}/superadmin/tour/delete/${tour_name}`, {}, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         data: {
  //           tour_name: tour_name,
  //         }
  //       })
  //       .then((response) => {
  //         console.log('Tour deleted:', response.data.message);
  //         this.fetchDataTour();
  //         Swal.fire({
  //           icon: 'success',
  //           title: 'Tour berhasil dihapus',
  //           timer: 2000,
  //           timerProgressBar: true,
  //           showCancelButton: false,
  //           showConfirmButton: false,
  //         });
  //       })
  //       .catch((error) => {
  //         console.log('Error deleting tour:', error);
  //         Swal.fire({
  //           title: 'Error',
  //           text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus tour',
  //           icon: 'error',
  //           timer: 2000,
  //           timerProgressBar: true,
  //           showCancelButton: false,
  //           showConfirmButton: false,
  //         });
  //       });
  //   }
  // }
  

}


export { Tour };