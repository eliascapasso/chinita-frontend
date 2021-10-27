import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { NgxSiemaOptions, NgxSiemaService } from "ngx-siema";

import { Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AuthService } from "../../../account/shared/auth.service";
import { User } from "../../../models/user.model";
import { SharedService } from "../../../shared/shared.service";

@Component({
  selector: "app-main-slider",
  templateUrl: "./main-slider.component.html",
  styleUrls: ["./main-slider.component.scss"],
})
export class MainSliderComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  @Input() public items: any[];
  public currentSlide: number;
  public imagesLoaded: string[];
  public backgroundImage: string;
  private userSubscription: Subscription;
  public user: User;

  public options: NgxSiemaOptions = {
    selector: ".siema",
    duration: 200,
    easing: "ease-out",
    perPage: 1,
    startIndex: 0,
    draggable: true,
    threshold: 20,
    loop: false,
    onInit: () => {
      // runs immediately after first initialization
    },
    onChange: () => {
      // runs after slide change
    },
  };

  constructor(
    private ngxSiemaService: NgxSiemaService,
    private sharedService: SharedService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentSlide = 0;
    this.imagesLoaded = [];
    this.sharedService.getObject("FONDO").subscribe((result) => {
      this.backgroundImage = result.imageURLs;
      console.log(this.items);
    });

    this.userSubscription = this.authService.user.subscribe((user) => {
      this.user = user;
    });
  }

  updateBackground(event) {
    this.sharedService.updateObjectWithFile({
      type: "FONDO",
      file: event.target.files[0],
    });
  }

  public prev() {
    if (this.currentSlide > 0) {
      this.ngxSiemaService
        .prev(1)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((data: any) => {
          this.currentSlide = data.currentSlide;
        });
    }
  }

  public next() {
    if (this.currentSlide < this.items.length - 1) {
      this.ngxSiemaService
        .next(1)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((data: any) => {
          this.currentSlide = data.currentSlide;
        });
    }
  }

  public goTo(index: number) {
    this.ngxSiemaService
      .goTo(index)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: any) => {
        this.currentSlide = data.currentSlide;
      });
  }

  public onImageLoad(e: any) {
    this.imagesLoaded.push(e.target.src);
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
