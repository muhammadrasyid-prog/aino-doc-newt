import { Component } from '@angular/core';
import { BreadcrumbService } from '../services/breadcrumb/breadcrumb.service';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [ RouterLink, CommonModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  breadcrumbs: Array<{ label: string, url: string }> = [];

  constructor(private breadcrumbService: BreadcrumbService, private router: Router) {}

  ngOnInit(): void {
    this.breadcrumbs = this.breadcrumbService.breadcrumbs;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd) // Hanya tangkap event NavigationEnd
    ).subscribe(() => {
      this.breadcrumbs = this.breadcrumbService.breadcrumbs; // Update breadcrumbs
    });
  }

}
