import { Component, Inject, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TourGuideService } from '../services/tour-guide/tour-guide.service';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShepherdService } from 'angular-shepherd';
import Shepherd from 'shepherd.js';

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

@Component({
  selector: 'app-tour-guide',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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

  constructor(
    private cookieService: CookieService,
    public tourService: TourGuideService,
    private shepherdService: ShepherdService,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  dataListTour: any[] = [];

  ngOnInit(): void {
    this.fetchDataTour();
    this.profileData();
    // this.tourService.getTourData()
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
        this.tourService.updateDataListTour(this.dataListTour);
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

  openModalAdd() {
    this.isModalAddOpen = true;
    this.tour_name = '';
    this.page_name = '';
    this.page_url = '';
    this.step_order = '';
    this.element_id = '';
    this.title = '';
    this.content = '';
    this.placement = '';
    this.buttons = '';
  }

  closeModalAdd() {
    this.isModalAddOpen = false;
  }

  addTour() {
    const token = this.cookieService.get('userToken');

    axios
      .post(`${environment.apiUrl2}/superadmin/tour/add`,
        {
          tour_name: this.tour_name,
          page_url: this.page_url,
          page_name: this.page_name,
          step_order: this.step_order,
          element_id: this.element_id,
          title: this.title,
          content: this.content,
          placement: this.placement,
          buttons: this.buttons,
        },
        {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        this.fetchDataTour();
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Tour baru ditambahkan',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.fetchDataTour();
        this.isModalAddOpen = false;
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
  }

  // Tambahkan metode untuk menentukan tourType dari URL
  getTourType(page_url: string): 'dashboardTour' | 'itcmTour' | 'daTour' | 'baTour' {
    if (page_url.includes('dashboard')) {
      return 'dashboardTour';
    } else if (page_url.includes('itcm')) {
      return 'itcmTour';
    }
    // Tambahkan logika tambahan untuk jenis tour lainnya
    return 'baTour'; // Default
  }

  openEditModal(tour_uuid: string) {
    this.tour_uuid = tour_uuid;
    axios
      .get(`${environment.apiUrl2}/tour/${tour_uuid}`)
      .then((response) => {
        this.isModalEditOpen = true;
        this.tour_name = response.data.tour_name;
        this.page_url = response.data.page_url;
        this.page_name = response.data.page_name;
        this.step_order = response.data.step_order;
        this.element_id = response.data.element_id;
        this.title = response.data.title;
        this.content = response.data.content;
        this.placement = response.data.placement;
        this.buttons = response.data.buttons;
      })
      .catch((error) => {
        console.log(error);
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
      });
    this.isModalEditOpen = true;
  }

  closeModalEdit() {
    this.isModalEditOpen = false;
  }

  updateTour(): void {
    const token = this.cookieService.get('userToken');
    const data = {
      tour_name: this.tour_name,
      page_url: this.page_url,
      page_name: this.page_name,
      step_order: this.step_order,
      element_id: this.element_id,
      title: this.title,
      content: this.content,
      placement: this.placement,
      buttons: this.buttons,
    }
    console.log('tour_uuid:', this.tour_uuid);
    axios
      .put(`${environment.apiUrl2}/superadmin/tour/update/${this.tour_uuid}`, data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      console.log(response.data);
      this.fetchDataTour();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Tour diperbarui',
        timer: 2000,
        timerProgressBar: true,
        showCancelButton: false,
        showConfirmButton: false,
      });
    })
    .catch((error) => {
      console.log(error);{
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

    onDeleteTour(tour_uuid: string): void {
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
        this.performDeleteTour(tour_uuid);
      }
    });  
  }

  performDeleteTour(tour_uuid: string): void {
    const token = this.cookieService.get('userToken');

    axios
      .put(`${environment.apiUrl2}/superadmin/tour/delete/${tour_uuid}`, {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

}


export { Tour };