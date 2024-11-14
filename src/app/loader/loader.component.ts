import { ChangeDetectorRef ,Component, Input } from '@angular/core';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [NgxSpinnerModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  @Input() isLoading: boolean = false;

  constructor(private spinner: NgxSpinnerService) {}

  ngOnChanges() {
    if (this.isLoading) {
      this.spinner.show();
    } else {
      this.spinner.hide();
    }
  }
}
