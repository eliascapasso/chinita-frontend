import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../../account/shared/auth.service';
import { OffcanvasService } from '../shared/offcanvas.service';

import { User } from '../../models/user.model';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authSubscription: Subscription;
  public user: User;
  public showSearch;
  public logoImage: string;
  public imagesLoaded: string[];

  constructor(
    private authService: AuthService,
    private router: Router,
    private offcanvasService: OffcanvasService,
    private sharedService: SharedService,
  ) {}

  ngOnInit() {
    this.imagesLoaded = [];

    this.sharedService.getObject("LOGO").subscribe((result) => {
      this.logoImage = result.imageURLs;
    });

    this.authSubscription = this.authService.user.subscribe((user) => {
      this.user = user;
    });
  }

  goHome(){
    this.router.navigateByUrl('inicio')
  }

  public onImageLoad(e: any) {
    this.imagesLoaded.push(e.target.src);
  }

  updateLogo(event) {
    this.sharedService.updateObjectWithFile({
      type: "LOGO",
      file: event.target.files[0],
    });
  }

  public onLogOut(e: Event) {
    this.authService.signOut();
    this.router.navigate(['/register-login']);
    e.preventDefault();
  }

  public onMenuToggle(e: Event) {
    this.offcanvasService.openOffcanvasNavigation();
    e.preventDefault();
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }
}
