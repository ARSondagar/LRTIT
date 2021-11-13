import { EditVideoComponent } from './../edit-video/edit-video.component';
import {
  User,
  InstagramAccount,
} from "src/app/com/annaniks/lift/core/models/user";
import {
  currentInstagramSelector,
  currentUserSelector,
} from "../../../auth/store/selectors";
import { Component, OnInit, Inject, OnDestroy } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AutoPostingService } from "../autoposting.service";
import { takeUntil, finalize } from "rxjs/operators";
import { Subject } from "rxjs";
import { AuthService } from "../../../../core/services/auth.service";
import {
  CreatePostData,
  PostOrStory,
  CreateStoryData,
} from "../../../../core/models/autoposting";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { HashtagsCount } from "../../../../core/utilities/hashtags-count";
import { LoadingService } from "../../../../core/services";
import { select, Store } from "@ngrx/store";

@Component({
  templateUrl: "./add-story.component.html",
  styleUrls: ["./add-story.component.scss"],
})
export class AddStoryComponent implements OnInit, OnDestroy {
  private _unsubscribe$: Subject<void> = new Subject<void>();
  private _editable: boolean = false;
  private _type: "story" | "post" = "post";
  public title: string;

  public showEmojies = false;
  public showCalendar = false;
  public showComment = true;
  public localImages: string[] = [];
  public files: File[] = [];
  public loading: boolean = false;
  public errorMessage: string;
  public selectedDate = "Сейчас";
  public userImage = "/assets/images/user.png";

  public addStoryForm: FormGroup;

  currentUser: User;
  currentUserInstagram: InstagramAccount;

  constructor(
    private _dialogRef: MatDialogRef<AddStoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    @Inject("FILE_URL") private _fileUrl: string,
    private _formBuilder: FormBuilder,
    private _toastrService: ToastrService,
    private _autopostingService: AutoPostingService,
    private _authService: AuthService,
    private _datePipe: DatePipe,
    private _dialog: MatDialog,
    private store: Store,
    private _loadingService: LoadingService
  ) {
    console.log("THIS IS DATA: ", data);
    this.title = `Добавить новую историю`;
    this._type = this.data.type;
  }

  ngOnInit() {
    this.store
      .pipe(select(currentInstagramSelector))
      .subscribe((userInstagram) => {
        this.currentUserInstagram = userInstagram;
        if (userInstagram.avatar) {
          this.userImage = userInstagram.avatar;
        }
      });
    this.store.pipe(select(currentUserSelector)).subscribe((user) => {
      this.currentUser = user;
    });

    this._initForm();
    this._setFormValues();
  }

  private _initForm(): void {
    this.addStoryForm = this._formBuilder.group({
      life: this._formBuilder.group({
        status: [false],
        count: [{ value: null, disabled: true }],
      }),
      time: [null],
    });

    this.addStoryForm.get("time").valueChanges.subscribe((value) => {
      if (value) {
        console.log(value);
        this.selectedDate = this._datePipe.transform(
          value,
          "dd/MM/yyyy HH:mm:ss"
        );
      }
    });
    this.addStoryForm
      .get("life")
      .get("status")
      .valueChanges.subscribe((value) => {
        if (value) {
          this.addStoryForm.get("life").get("count").enable();
        } else {
          this.addStoryForm.get("life").get("count").disable();
        }
      });
  }

  private _createStory(): void {
    this.loading = true;

    let timeDate: string = this.addStoryForm.get("time").value;
    let time: number = null;
    if (timeDate) {
      time = new Date(timeDate).getTime();
    } else {
      time = Date.now();
    }

    const storyInfo: CreateStoryData = {
      accountId: this.currentUserInstagram.id,
      time: String(time),
      removeAt: this.addStoryForm.get("life").value.status
        ? this.addStoryForm.get("life").value.count
        : "",
      photo: this.files[0],
    };
    this._autopostingService
      .createStory(storyInfo)
      .pipe(
        takeUntil(this._unsubscribe$),
        finalize(() => (this.loading = false))
      )
      .subscribe(
        (response) => {
          this._toastrService.success("Сохранено");
          this._dialogRef.close({ changed: true });
        },
        (err) => {
          const error = err.error;
          const message = error.message || "Ошибка";
          this.errorMessage = message;
          this._toastrService.error(message);
        }
      );
  }

  private _setFormValues(): void {
    this._editable = this.data.editable;
    if (this._editable) {
      const postOrStory: PostOrStory = this.data.event;
      if (postOrStory) {
        if (postOrStory.date.file) {
          this.localImages.push(
            `${this._fileUrl}/${postOrStory.date.file.filename}`
          );
        }
        if (postOrStory.type == "post") {
          let time: string = postOrStory.time;

          if (time) {
            time = this._datePipe.transform(time, "yyyy-MM-dd HH:mm:ss", "+4");
          }

          this.title = `История ${postOrStory.date.caption}`;
          this.addStoryForm.patchValue({
            time: time,
          });
        }
        if (postOrStory.type == "story") {
          let time: string = postOrStory.time;
          if (time) {
            time = this._datePipe.transform(time, "yyyy-MM-dd HH:mm:ss");
          }
          this.addStoryForm.patchValue({
            time: time,
          });
        }
        if (postOrStory.date.removeAt) {
          try {
            const count: number = +JSON.parse(postOrStory.date.removeAt);
            if (count) {
              this.addStoryForm.get("life").patchValue({
                count: count,
                status: true,
              });
              this.addStoryForm.get("life").get("count").enable();
            }
          } catch (error) {}
        }
      }
    }
  }

  public onSelectFiles($event): void {
    this.files = [];
    if ($event) {
      const fileList: FileList = $event.target.files;
      if (fileList) {
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          this.files.push(file);
          console.log(this.files);

          const reader: FileReader = new FileReader();
          reader.onload = (e: any) => {
            this.localImages.push(e.target.result.toString());
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  private _urltoFile(url, filename, mimeType) {
    return fetch(url)
      .then((res) => {
        return res.arrayBuffer();
      })
      .then((buf) => {
        return new File([buf], filename, { type: mimeType });
      });
  }

  public onClickShowCalendar(): void {
    this.showCalendar = !this.showCalendar;
  }

  public onClickRemove(): void {
    this.localImages = [];
    this.files = [];
  }

  public onClickCreate(): void {
    console.log(this._type);

    if (
      !this.loading &&
      this.addStoryForm.valid &&
      this.files &&
      this.files.length > 0
    ) {
      if (this._type == "story") this._createStory();
    }
  }

  public toggleShowEmojies(): void {
    this.showEmojies = !this.showEmojies;
  }

  public onClickCancel(): void {
    this._dialogRef.close({ changed: false });
  }

  public openEditPic(): void {
    const dialogRef = this._dialog.open(EditVideoComponent, {
      width: "100%",
      maxWidth: "100%",
      height: "100%",
      // maxHeight: "calc(100vh - 100px)",
      // position: {
      //   top: "105px",
      // },
      panelClass: "add-ps-container",
    });

    dialogRef.afterClosed().subscribe((data: string) => {
      console.log(data, this.files);

      if (data) {
        this.localImages = [];
        this.files = [];
        this.localImages.push(data);
        console.log(data);
        this.scaleDataURL(data, 1080, 1080).then((canvas) => {
          this._urltoFile(canvas, "edited-image.png", "image/png").then(
            (file) => {
              console.log(file);
              this.files.push(file);
            }
          );
        });
      }
    });
  }

  scaleDataURL(dataURL, maxWidth, maxHeight) {
    return new Promise((done) => {
      var img = new Image();
      img.onload = () => {
        var scale, newWidth, newHeight, canvas, ctx;

        if (img.width > img.height) {
          img.height = img.width / 1.91;
        } else {
          img.height = (img.width / 4) * 5;
        }
        if (img.width < maxWidth) {
          scale = maxWidth / img.width;
        } else {
          scale = maxHeight / img.height;
        }
        console.log(img.width, img.height);

        newWidth = img.width * scale;
        newHeight = img.height * scale;
        canvas = document.createElement("canvas");
        canvas.height = newHeight;
        canvas.width = newWidth;
        ctx = canvas.getContext("2d");
        console.log(newWidth, newHeight);

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          0,
          0,
          newWidth,
          newHeight
        );
        done(canvas.toDataURL());
      };
      img.src = dataURL;
    });
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
