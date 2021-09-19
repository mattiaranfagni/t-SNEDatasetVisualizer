import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { EngineService } from './engine.service';

@Component({
  selector: 'app-root',
  template: "<div #host></div>"
})
export class AppComponent implements OnInit {
  @ViewChild('host',{static: true}) hostRef!: ElementRef<HTMLElement>;

  constructor(
    private engineService: EngineService,
  ) { }

  ngOnInit(): void {
    console.log(this.hostRef);
    this.engineService.init(this.hostRef.nativeElement);
  }

  @HostListener('window:resize')
  onResize(): void {
    // Update renderer layout on window resize.
    this.engineService.update();
  }
}
