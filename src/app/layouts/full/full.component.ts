import { Component, OnInit,Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { SidebarComponent } from '../../navigations/sidebar/sidebar.component';
import { HeaderComponent } from '../../navigations/header/header.component';
import axios from 'axios';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { TourGuideService } from '../../services/tour-guide/tour-guide.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [RouterLink, CommonModule,RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './full.component.html',
  styleUrl: './full.component.css'
})
export class FullComponent implements OnInit, AfterViewInit, OnDestroy {
  private routerSubscription: Subscription | null = null;
  private dashboardTourCompleted = false;
  // private toursCompleted: Set<string> = new Set();

  
  constructor(private tourGuideService: TourGuideService, private router: Router, private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string) {}

  ngOnInit(): void {
    this.fetchProfileData();
  }

  
  fetchProfileData() {
    const token = this.cookieService.get('userToken');
    console.log('Token:', token);

    axios
      .get(`${this.apiUrl}/auth/my/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        if (error.response && error.response.status === 500) {
          console.log(error.response.data.message);
          
        }
      });
  }

  ngAfterViewInit() {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.handleRouteChange(event.url);
    });

    // Inisialisasi tour dashboard jika ini adalah halaman awal
    if (this.router.url === '/dashboard') {
      setTimeout(() => {
        // this.tourGuideService.initTour('dashboardTour');
        this.tourGuideService.initTour('dashboardTour'); 
        this.tourGuideService.startTour();
      }, 500);
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  handleRouteChange(url: string) {
    if (url === '/dashboard' && !this.dashboardTourCompleted) {
      this.tourGuideService.initTour('dashboardTour');
      this.tourGuideService.startTour();
    } else if (url === '/form/itcm' && this.dashboardTourCompleted) {
      this.tourGuideService.initTour('itcmTour');
      this.tourGuideService.startTour();
    }
    // Tambahkan rute lain jika diperlukan
  }

  // async handleRouteChange(url: string) {
  //   const tours = await this.tourGuideService.fetchLatestTourData();
  //   const currentTour = tours.find(tour => tour.page_url === url);
    
  //   if (currentTour) {
  //     setTimeout(() => {
  //       this.tourGuideService.initTour(this.getTourType(url));
  //       this.tourGuideService.startTour();
  //     }, 500);
  //   }
  // }

  // private getTourType(url: string): string {
  //   // Logic to determine the tour type based on the URL
  //   if (url === '/dashboard') {
  //     return 'dashboardTour';
  //   } else if (url === '/form/itcm') {
  //     return 'itcmTour';
  //   }
  //   // Add more conditions as needed for other routes
  //   return '';
  // }
  
}
