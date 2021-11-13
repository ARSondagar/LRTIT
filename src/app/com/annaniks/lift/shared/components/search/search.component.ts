import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef, ViewChild
} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnChanges {
  search: '';
  throttlingInput: any;
  isActive = true;
  form: FormGroup = new FormGroup({
    search: new FormControl('')
  });
  showResult = false;
  public showPreviewBlock$: Observable<number>;

  @Output() ngChanged = new EventEmitter();
  @Input() options = [];
  @ViewChild('wrap', {static: true}) wrap: ElementRef;
  @ViewChild('searchField', {static: true}) searchField: ElementRef;
  @ViewChild('scrollbarContent', {static: true}) scrollbarContent: ElementRef;

  constructor(
    private _appSvc: AppService,
    private elementRef: ElementRef,
    private router: Router
  ) {
    this.showPreviewBlock$ = _appSvc.headerIsVisible$;
    this.router.events.pipe(
      filter(evt => evt instanceof NavigationStart)
    ).subscribe(() => {
      _appSvc.setHeaderFlag(0);
    });
}

  @HostListener('document:click', ['$event.target'])
  clickOut(event) {
    if (!this.elementRef.nativeElement.contains(event) && this.isActive) {
      this.isActive = false;
    }
    if (event === this.searchField.nativeElement && !this.isActive) {
      this.isActive = true;
    }
  }
  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.isActive) {
      setTimeout(() => {
        const scrollbarContent = this.scrollbarContent.nativeElement;
        const scrollbarContentHeight = scrollbarContent.offsetHeight;
        const scrollbar = this.wrap.nativeElement.querySelector('.scrollbar');
        if (scrollbarContentHeight > 0 && scrollbarContentHeight < 300) {
          scrollbar.style.height = (scrollbarContentHeight + 2)  + 'px';
        } else {
          scrollbar.style.height = null;
        }
      }, 10)
    }
    this.showResult = !!this.options.length;
    this.isActive = true;
  }
  reset() {
    this.isActive = false;
    this.showResult = false;
    this.options = [];
    this.form.reset();
  }
  onInput() {
    clearTimeout(this.throttlingInput);
    this.throttlingInput = setTimeout(() => {
      this.submit();
    }, 300);
  }
  submit() {
    this.ngChanged.emit(this.form.value.search)
  }
}
