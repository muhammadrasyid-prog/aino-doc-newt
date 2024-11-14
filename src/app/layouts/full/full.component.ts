import { Component, OnInit,Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError  } from '@angular/router';
import { SidebarComponent } from '../../navigations/sidebar/sidebar.component';
import { HeaderComponent } from '../../navigations/header/header.component';
import { LoaderComponent } from '../../loader/loader.component';
import axios from 'axios';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { TourGuideService } from '../../services/tour-guide/tour-guide.service';
import { filter, Subscription } from 'rxjs';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';


@Component({
  selector: 'app-full',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, LoaderComponent, BreadcrumbComponent], // Add LoaderComponent here
  templateUrl: './full.component.html',
  styleUrl: './full.component.css'
})
export class FullComponent implements OnInit, AfterViewInit, OnDestroy {
  private routerSubscription: Subscription | null = null;
  private dashboardTourCompleted = false;
  isLoading: boolean = true; // Set to true initially to display loader

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
      .then(() => {
        this.isLoading = false; // Hide loader after data is fetched
      })
      .catch((error) => {
        if (error.response && error.response.status === 500) {
          console.log(error.response.data.message);
        }
        this.isLoading = false; // Hide loader on error as well
      });
  }

  ngAfterViewInit() {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.handleRouteChange(event.url);
    });

    if (this.router.url === '/dashboard') {
      setTimeout(() => {
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
  }

}
