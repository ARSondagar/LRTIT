import { EmojiService } from "./../../../../shared/services/emoji.service";
import { ClickbleStickerInterface } from "../types/clickble-sticker.interface";
import { StickerInterface } from "./../types/sticker.interface";
import { BackgroundInterface } from "./../types/background.interface";
import { Observable } from "rxjs";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { fabric } from "fabric";
import { DynamicStickerInterface } from "../types/dynamic-stiker.interface";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { EmojiInterface } from "../../../../shared/types/emoji.interface";
import { Canvas2Video } from "canvas2video";
import { SelectInterface } from "../types/select.interface";

// test
declare var window: any;
@Component({
  selector: "app-edit-video",
  templateUrl: "./edit-video.component.html",
  styleUrls: ["./edit-video.component.scss"],
})
export class EditVideoComponent implements OnInit {
  myFiles: string[] = [];
  myVideos: Observable<any[]>;

  index: number = 0;

  @ViewChild("videoPlayer", { static: false }) videoplayer: ElementRef;

  public isVideo: boolean = false;
  public videoUrl: any;

  canvas: any;
  video: any;
  video1: fabric.Image = null;
  linkHref: { href: any; download: any };
  recordedChunks: any[] = [];

  public imagePath;
  imgURL: any;
  public message: string;

  public emojis: EmojiInterface[] = [];

  public fontWeightItems: SelectInterface[] = [
    {
      title: "500",
      value: 500,
    },
    {
      title: "600",
      value: 600,
    },
    {
      title: "700",
      value: 700,
    },
    {
      title: "800",
      value: 800,
    },
    {
      title: "900",
      value: 900,
    },
  ];

  public fontSizeItems: SelectInterface[] = [
    {
      value: 8,
      title: "8",
    },
    {
      value: 9,
      title: "9",
    },
    {
      value: 10,
      title: "10",
    },
    {
      value: 11,
      title: "11",
    },
    {
      value: 12,
      title: "12",
    },
    {
      value: 13,
      title: "13",
    },
    {
      value: 14,
      title: "14",
    },
    {
      value: 15,
      title: "15",
    },
    {
      value: 16,
      title: "16",
    },
    {
      value: 17,
      title: "17",
    },
    {
      value: 18,
      title: "18",
    },
    {
      value: 19,
      title: "19",
    },
    {
      value: 20,
      title: "20",
    },
    {
      value: 21,
      title: "21",
    },
    {
      value: 22,
      title: "22",
    },
    {
      value: 23,
      title: "23",
    },
    {
      value: 24,
      title: "24",
    },
  ];

  public fontItems: SelectInterface[] = [
    {
      value: "Arial",
      title: "Arial",
    },
    {
      value: "Times New Roman",
      title: "Times New Roman",
    },
    {
      value: "Sequel Sans Headline Heavy",
      title: "Sequel Sans Headline Heavy",
    },
    {
      value: "Gineso Soft Condensed Bold",
      title: "Gineso Soft Condensed Bold",
    },
    {
      value: "Audrey Script Regular",
      title: "Audrey Script Regular",
    },
    {
      value: "Modica Ultra Italic",
      title: "Modica Ultra Italic",
    },
    {
      value: "Courier PS Pro Cyrillic Bold",
      title: "Courier PS Pro Cyrillic Bold",
    },
    {
      value: "Yummy Foodies Regular",
      title: "Yummy Foodies Regular",
    },
    {
      value: "Linotype Didot Pro Italic",
      title: "Linotype Didot Pro Italic",
    },
    {
      value: "DIN 1451 Pro MittelSchrift",
      title: "DIN 1451 Pro MittelSchrift",
    },
    {
      value: "Neoneon Cyrillic",
      title: "Neoneon Cyrillic",
    },
  ];

  public alignItems: SelectInterface[] = [
    {
      value: "center",
      title: "По центру",
    },
    {
      value: "left",
      title: "Слева",
    },
    {
      value: "right",
      title: "Справа",
    },
  ];

  public textEffects: {
    textAlign: string;
    shadow: boolean;
    fontSize: number;
    fontFamily: string;
    color: string;
    fontWeight: number;
  } = {
    textAlign: "center",
    shadow: true,
    fontSize: 14,
    fontFamily: "Arial",
    color: "#000000",
    fontWeight: 700,
  };

  public backgrounds: BackgroundInterface[] = [
    {
      url:
        "../../../../../../../../assets/images/story-editor/backgrounds/1.jpg",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/backgrounds/2.jpg",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/backgrounds/3.jpg",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/backgrounds/4.jpg",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/backgrounds/5.jpg",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/backgrounds/6.jpg",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/backgrounds/7.jpg",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/backgrounds/8.jpg",
    },
  ];

  // this will send on API
  public clickbleStikers: any[] = [];

  public isStickerEdit: boolean;
  public currentSticker: DynamicStickerInterface = null;

  public isTextEdit: boolean = false;
  public currentTextObject: any;

  // Dynamic Sticker Forms
  public frmHashtag: FormGroup;
  public frmPoll: FormGroup;
  public frmSlider: FormGroup;
  public frmQuestion: FormGroup;

  public dynamicStickers: DynamicStickerInterface[] = [
    {
      index: 0,
      url:
        "../../../../../../../../assets/images/story-editor/dynamicStickers/countdown_sticker.png",
      disable: true,
      size: "lg",
      type: "countdown",
      title: "Обратный отсчет",
    },
    {
      index: 1,
      url:
        "../../../../../../../../assets/images/story-editor/dynamicStickers/feed_media_sticker.svg",
      disable: true,
      size: "lg",
      type: "feed",
      title: "Пост",
    },
    {
      index: 2,
      url:
        "../../../../../../../../assets/images/story-editor/dynamicStickers/hashtag_sticker.png",
      disable: false,
      size: "lg",
      type: "hashtag",
      title: "Хэштэг",
    },
    {
      index: 4,
      url:
        "../../../../../../../../assets/images/story-editor/dynamicStickers/location_sticker.png",
      disable: true,
      size: "xl",
      type: "location",
      title: "Геоданные",
    },
    {
      index: 5,
      url:
        "../../../../../../../../assets/images/story-editor/dynamicStickers/mention_sticker.png",
      disable: true,
      size: "xl",
      type: "mention",
      title: "Упоминание",
    },
    {
      index: 6,
      url:
        "../../../../../../../../assets/images/story-editor/dynamicStickers/poll_sticker.png",
      disable: false,
      size: "xl",
      type: "poll",
      title: "Опрос",
    },
    {
      index: 7,
      url:
        "../../../../../../../../assets/images/story-editor/dynamicStickers/question_sticker.png",
      disable: false,
      size: "xl",
      type: "question",
      title: "Вопрос",
    },
    {
      index: 8,
      url:
        "../../../../../../../../assets/images/story-editor/dynamicStickers/quiz_sticker.png",
      disable: true,
      size: "lg",
      type: "quiz",
      title: "Викторина",
    },
    {
      index: 9,
      url:
        "../../../../../../../../assets/images/story-editor/dynamicStickers/slider_sticker.png",
      disable: false,
      size: "xl",
      type: "slider",
      title: "Слайдер",
    },
  ];

  //TODO: REMOVE THIS
  public clickbleStickersCurrent: ClickbleStickerInterface[] = [
    {
      url:
        "../../../../../../../../assets/images/story-editor/clickbleStickers/poll.png",
      options: {
        question: "",
        tallies: [
          {
            text: "",
          },
          {
            text: "",
          },
        ],
      },
      type: "poll",
      title: "Голосование с двумя ответами",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/clickbleStickers/quiz.png",
      options: {
        question: "",
        options: ["1", "2"],
        correctAnswer: 1,
      },
      type: "quiz",
      title: "Тест",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/clickbleStickers/slider.png",
      options: {
        question: "",
        emoji: "❤",
      },
      type: "slider",
      title: "Слайдер",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/clickbleStickers/question.png",
      options: {
        question: "",
      },
      type: "question",
      title: "Вопрос",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/clickbleStickers/hashtag.png",
      options: {
        tagName: "",
      },
      type: "hashtag",
      title: "Хэштег",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/clickbleStickers/mention.png",
      options: {
        userId: "",
      },
      type: "mention",
      title: "(в работе) Упоминание человека",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/clickbleStickers/location.png",
      options: {
        locationId: "",
      },
      type: "location",
      title: "(в работе) Локация",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/clickbleStickers/countdown.png",
      options: {
        text: "",
        endTs: new Date(),
      },
      type: "countdown",
      title: "(в работе) Обратный отсчет",
    },
    {
      url:
        "../../../../../../../../assets/images/story-editor/clickbleStickers/linstory.png",
      options: {
        userName: "",
        currentStoryNumber: 0,
      },
      type: "linkstory",
      title: "(в работе) Ссылка на сторис",
    },
  ];
  public staticStickers: StickerInterface[] = [
    {
      url: "../../../../../../../../assets/images/story-editor/stickers/1.png",
    },
    {
      url: "../../../../../../../../assets/images/story-editor/stickers/2.png",
    },
    {
      url: "../../../../../../../../assets/images/story-editor/stickers/3.png",
    },
    {
      url: "../../../../../../../../assets/images/story-editor/stickers/4.png",
    },
  ];
  public emojiStickers: StickerInterface[] = [
    {
      url: "../../../../../../../../assets/images/story-editor/emoji/1.png",
    },
    {
      url: "../../../../../../../../assets/images/story-editor/emoji/2.png",
    },
    {
      url: "../../../../../../../../assets/images/story-editor/emoji/3.png",
    },
  ];
  capturer: any;

  constructor(
    private fb: FormBuilder,
    private _dialogRef: MatDialogRef<EditVideoComponent>,
    private emojiService: EmojiService
  ) {}

  ngOnInit() {
    this.initCanvasTemplate();
    this.initForms();

    this.emojis = this.emojiService.getEmojis().slice(0, 100);
    console.log(this.emojis);
  }

  initForms() {
    let canvas = this.canvas;

    // Hashtag
    this.frmHashtag = this.fb.group({
      hashtag: ["hashtag"],
    });
    this.frmHashtag.get("hashtag").valueChanges.subscribe((value) => {
      if (value) {
        let objects = canvas.getObjects();
        let cObj = objects.find((x) => x.id === "hashtag");
        if (cObj) {
          canvas.setActiveObject(cObj);
          console.log(cObj);

          let text = cObj._objects.find((x) => x.id === "hashtagText");
          text.set({
            text: `#${value.toUpperCase()}`,
          });

          cObj.set({
            width: text.width + 20,
          });
          let rect = cObj._objects.find((x) => x.id === "rect");
          rect.set({
            width: text.width + 20,
          });

          canvas.renderAll();
        }
      }
    });

    // Poll
    this.frmPoll = this.fb.group({
      question: ["Да или нет?"],
      pAnswer: ["Да"],
      nAnswer: ["Нет"],
    });
    this.frmPoll.get("question").valueChanges.subscribe((value) => {
      if (value) {
        let objects = canvas.getObjects();
        let cObj = objects.find((x) => x.id === "poll");
        if (cObj) {
          canvas.setActiveObject(cObj);
          console.log(cObj);
          let text = cObj._objects.find((x) => x.id === "questionText");

          if (text.width > text.fixedWidth) {
            text.fontSize *= text.fixedWidth / (text.width + 1);
            text.width = text.fixedWidth;
          }

          text.set({
            text: value,
          });

          canvas.renderAll();
        }
      }
    });
    this.frmPoll.get("pAnswer").valueChanges.subscribe((value) => {
      if (value) {
        let objects = canvas.getObjects();
        let cObj = objects.find((x) => x.id === "poll");
        if (cObj) {
          canvas.setActiveObject(cObj);
          console.log(cObj);
          let text = cObj._objects.find((x) => x.id === "pAnswerText");

          if (text.width > text.fixedWidth) {
            text.fontSize *= text.fixedWidth / (text.width + 1);
            text.width = text.fixedWidth;
          }

          text.set({
            text: value,
          });

          canvas.renderAll();
        }
      }
    });
    this.frmPoll.get("nAnswer").valueChanges.subscribe((value) => {
      if (value) {
        let objects = canvas.getObjects();
        let cObj = objects.find((x) => x.id === "poll");
        if (cObj) {
          canvas.setActiveObject(cObj);
          console.log(cObj);
          let text = cObj._objects.find((x) => x.id === "nAnswerText");

          if (text.width > text.fixedWidth) {
            text.fontSize *= text.fixedWidth / (text.width + 1);
            text.width = text.fixedWidth;
          }

          text.set({
            text: value,
          });

          canvas.renderAll();
        }
      }
    });

    // Slider
    this.frmSlider = this.fb.group({
      question: ["Задайте вопрос..."],
      emoji: ["😀"],
    });
    this.frmSlider.get("question").valueChanges.subscribe((value) => {
      if (value) {
        let objects = canvas.getObjects();
        let cObj = objects.find((x) => x.id === "slider");
        if (cObj) {
          canvas.setActiveObject(cObj);
          console.log(cObj);
          let text = cObj._objects.find((x) => x.id === "questionText");

          text.set({
            text: value,
          });

          canvas.renderAll();
        }
      }
    });
    this.frmSlider.get("emoji").valueChanges.subscribe((value) => {
      if (value) {
        let objects = canvas.getObjects();
        let cObj = objects.find((x) => x.id === "slider");
        if (cObj) {
          canvas.setActiveObject(cObj);
          console.log(cObj);
          let text = cObj._objects.find((x) => x.id === "emojiText");

          text.set({
            text: value,
          });

          canvas.renderAll();
        }
      }
    });

    // Question
    this.frmQuestion = this.fb.group({
      question: ["Задайте мне вопрос"],
    });
    this.frmQuestion.get("question").valueChanges.subscribe((value) => {
      if (value) {
        let objects = canvas.getObjects();
        let cObj = objects.find((x) => x.id === "question");
        if (cObj) {
          canvas.setActiveObject(cObj);
          console.log(cObj);
          let text = cObj._objects.find((x) => x.id === "questionText");

          text.set({
            text: value,
          });

          canvas.renderAll();
        }
      }
    });
  }

  closeDialog(confirm: boolean): void {
    if (confirm) {
      this._dialogRef.close(this.getImgData());
    } else {
      this._dialogRef.close();
    }
  }

  addSticker(url: string) {
    let ca = this.canvas;

    fabric.Image.fromURL(url, function (myImg) {
      ca.add(myImg);
    });
  }

  initCanvasTemplate() {
    this.canvas = new fabric.Canvas("c", {
      preserveObjectStacking: true,
    });
    this.canvas.backgroundColor = "rgb(140,140,140)";

    // Clip to 360 x 640 section in middle of 800 x 800 canvas - 360 x 640 with multiplier 3 in export gives 1080 x 1920
    this.canvas.clipTo = function (ctx) {
      ctx.rect(220, 80, 360, 640);
    };
    this.canvas.controlsAboveOverlay = true;

    // Loading image onto canvas
    var tempImg =
      "../../../../../../../../assets/images/story-editor/backgrounds/2.jpg";

    this.setBackgroundImage(tempImg);
  }

  setBackgroundImage(data: any) {
    let canvas = this.canvas;

    if (this.video1) {
      this.removeVideo();
    }

    fabric.Image.fromURL(data, function (img) {
      // add background image
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width / img.width,
        scaleY: canvas.height / img.height,
      });
    });
    // fabric.Image.fromURL(
    //   "https://media2.giphy.com/media/xUNd9OEvMmHdI2Upgs/giphy.gif?cid=4b9df2c3iopkwg5o4gyfbchzyb8717v3hgdktbco2k7tussi&rid=giphy.gif",
    //   function (img) {
    //     canvas.add(img);
    //     canvas.renderAll();
    //   }
    // );
  }

  onFileChanged(event) {
    if (event.target.files.length === 0) return;

    let file = event.target.files[0];
    let canvas = this.canvas;

    if (this.video1) {
      this.removeVideo();
    }

    const fileReader: FileReader = new FileReader();

    this.videoUrl = null;

    if (file.type.indexOf("image") > -1) {
      this.isVideo = false;
    } else if (file.type.indexOf("video") > -1) {
      this.isVideo = true;
    }

    fileReader.readAsDataURL(file);
    fileReader.onload = (file) => {
      if (this.isVideo) {
        this.videoUrl = fileReader.result;
        var video1El: any = document.getElementById("video1");
        this.video1 = new fabric.Image(video1El, {
          left: 0,
          top: 0,
          scaleX: canvas.width / video1El.width,
          scaleY: canvas.height / video1El.height,
          selectable: false,
          // lockMovementY: true,
          // lockRotation: true,
          // lockScalingFlip: true,
          hasControls: false,
        });

        canvas.add(this.video1);
        this.video1.moveTo(-1);

        video1El.load();
        this.playVideo();
      } else {
        this.setBackgroundImage(fileReader.result);
      }
    };
  }

  //#region text
  addText() {
    var shadow = new fabric.Shadow({
      color: "black",
      blur: 5,
    });

    var textbox: any = new fabric.Textbox("Текст", {
      // shadow: shadow,
      width: 320,
      fontSize: 28,
      fill: "#fff",
      fontFamily: "Open Sans",
      fontWeight: 800,
      textAlign: "center",
      cornerSize: 12,
      transparentCorners: false,
    });
    textbox.id = `text-${this.generateUID()}`;

    this.canvas.add(textbox);
    this.canvas.centerObject(textbox);
  }

  updateTextEffects() {
    let obj = this.currentTextObject;
    obj.color = this.textEffects.color;
    obj.fill = this.textEffects.color;
    obj.fontFamily = this.textEffects.fontFamily;
    obj.textAlign = this.textEffects.textAlign;
    obj.fontSize = this.textEffects.fontSize;
    obj.fontWeight = this.textEffects.fontWeight;

    obj.set("dirty", true);
    console.log("updated", obj);
    this.canvas.requestRenderAll();

    this.isTextEdit = false;
    this.currentTextObject = null;
  }
  //#endregion

  //#region dynamic stikers
  openAddDynamicSticker(index: number) {
    console.log(index);
    let selectedSticker = this.dynamicStickers.find((x) => x.index === index);

    if (selectedSticker.disable && this.isStickerEdit === false) {
      return;
    } else {
      let canvas = this.canvas;
      let index = this.dynamicStickers.indexOf(selectedSticker);

      this.isStickerEdit = true;
      this.dynamicStickers[index].disable = true;
      this.currentSticker = selectedSticker;

      console.log("is sticker edit", this.isStickerEdit);
      console.log("current", this.currentSticker);

      switch (this.currentSticker.type) {
        case "hashtag":
          var rect: any = new fabric.Rect({
            fill: "#fff",
            width: 160,
            height: 100,
            scaleY: 0.5,
            stroke: "#fff",
            strokeWidth: 5,
            rx: 5,
            ry: 5,
            originX: "center",
            originY: "center",
          });
          rect.id = "rect";

          var gradient = new fabric.Gradient({
            type: "linear",
            gradientUnits: "pixels", // or 'percentage'
            coords: { x1: 0, y1: 0, x2: rect.width, y2: 0 },
            colorStops: [
              { offset: "0", color: "red" },
              { offset: "1", color: "blue" },
            ],
          });
          var text: any = new fabric.Text(
            `#${this.frmHashtag.value.hashtag.toUpperCase()}`,
            {
              fontSize: 30,
              originX: "center",
              originY: "center",
              fill: gradient,
              fontFamily: "Neue Helvetica",
            }
          );
          text.id = "hashtagText";

          var group: any = new fabric.Group([rect, text], {
            left: 20,
            top: 250,
          });
          group.id = "hashtag";

          canvas.add(group);
          break;
        case "poll":
          var rect: any = new fabric.Rect({
            fill: "#fff",
            width: 120,
            height: 80,
            scaleY: 0.5,
            stroke: "#fff",
            strokeWidth: 5,
            rx: 5,
            ry: 5,
            originX: "center",
            originY: "center",
          });
          rect.id = "rect";

          var border: any = new fabric.Rect({
            fill: "#d5d5d5",
            width: 1,
            height: 85,
            scaleY: 0.5,
            originX: "center",
            originY: "center",
          });
          border.id = "border";

          var greenGradient = new fabric.Gradient({
            type: "linear",
            gradientUnits: "pixels", // or 'percentage'
            coords: { x1: 0, y1: 0, x2: rect.width, y2: 0 },
            colorStops: [
              { offset: "0", color: "green" },
              { offset: "1", color: "green" },
            ],
          });
          var redGradient = new fabric.Gradient({
            type: "linear",
            gradientUnits: "pixels", // or 'percentage'
            coords: { x1: 0, y1: 0, x2: rect.width, y2: 0 },
            colorStops: [
              { offset: "0", color: "red" },
              { offset: "1", color: "blue" },
            ],
          });
          var question: any = new fabric.Text(
            `${this.frmPoll.value.question}`,
            {
              fontSize: 20,
              originX: "center",
              top: -40,
              originY: "center",
              fill: "#fff",
              fontFamily: "Neue Helvetica",
            }
          );
          question.id = "questionText";
          question.fixedWidth = 100;

          var pAnswer: any = new fabric.Text(`${this.frmPoll.value.pAnswer}`, {
            fontSize: 20,
            originX: "center",
            originY: "center",
            width: 40,
            left: -30,
            fill: greenGradient,
            fontFamily: "Neue Helvetica",
          });
          pAnswer.id = "pAnswerText";
          pAnswer.fixedWidth = 40;

          var nAnswer: any = new fabric.Text(`${this.frmPoll.value.nAnswer}`, {
            fontSize: 20,
            originX: "center",
            originY: "center",
            width: 40,
            left: 30,
            fill: redGradient,
            fontFamily: "Neue Helvetica",
          });
          nAnswer.id = "nAnswerText";
          nAnswer.fixedWidth = 40;

          var group: any = new fabric.Group(
            [rect, border, question, pAnswer, nAnswer],
            {
              left: 20,
              top: 250,
            }
          );
          group.id = "poll";

          canvas.add(group);
          break;
        case "slider":
          var rect: any = new fabric.Rect({
            fill: "#fff",
            width: 320,
            height: 250,
            scaleY: 0.5,
            stroke: "#fff",
            strokeWidth: 5,
            rx: 2,
            ry: 2,
            originX: "center",
            originY: "center",
          });
          rect.id = "rect";

          var sliderBar: any = new fabric.Rect({
            fill: "#d9d9d9",
            width: 200,
            height: 10,
            scaleY: 0.5,
            stroke: "#d9d9d9",
            strokeWidth: 5,
            top: 20,
            rx: 2,
            ry: 2,
            originX: "center",
            originY: "center",
          });
          sliderBar.id = "slider";

          var question: any = new fabric.Text(
            `${this.frmSlider.value.question}`,
            {
              fontSize: 20,
              originX: "center",
              top: -30,
              originY: "center",
              fill: "#333333",
              fontFamily: "Neue Helvetica",
            }
          );
          question.id = "questionText";
          question.fixedWidth = 100;

          var emojiText: any = new fabric.Text(
            `${this.frmSlider.value.emoji}`,
            {
              fontSize: 24,
              originX: "center",
              originY: "center",
              top: 20,
              left: -40,
              fill: "#333333",
              fontFamily: "Neue Helvetica",
            }
          );
          emojiText.id = "emojiText";

          var group: any = new fabric.Group(
            [rect, sliderBar, question, emojiText],
            {
              left: 20,
              top: 250,
            }
          );
          group.id = "slider";

          canvas.add(group);
          break;
        case "question":
          var rect: any = new fabric.Rect({
            fill: "#83be5f",
            width: 320,
            height: 250,
            scaleY: 0.5,
            stroke: "#83be5f",
            strokeWidth: 5,
            rx: 2,
            ry: 2,
            originX: "center",
            originY: "center",
          });
          rect.id = "rect";

          var textBar: any = new fabric.Rect({
            fill: "#76ab55",
            width: 260,
            height: 80,
            scaleY: 0.5,
            stroke: "#76ab55",
            strokeWidth: 5,
            top: 30,
            rx: 2,
            ry: 2,
            originX: "center",
            originY: "center",
          });
          textBar.id = "textBar";

          var textBarText: any = new fabric.Text("Напишите что-нибудь...", {
            fontSize: 18,
            originX: "center",
            originY: "center",
            top: 30,
            fill: "#95be7c",
            fontFamily: "Neue Helvetica",
          });
          textBarText.id = "textBarText";

          var question: any = new fabric.Text(
            `${this.frmSlider.value.question}`,
            {
              fontSize: 20,
              originX: "center",
              top: -30,
              originY: "center",
              fill: "#fff",
              fontFamily: "Neue Helvetica",
            }
          );
          question.id = "questionText";

          var group: any = new fabric.Group(
            [rect, textBar, question, textBarText],
            {
              left: 20,
              top: 250,
            }
          );
          group.id = "question";

          canvas.add(group);
          break;
      }
    }
  }

  closeAddDynamicSticker() {
    this.isStickerEdit = false;
    this.currentSticker = null;
  }

  addPoll() {
    let canvas = this.canvas;

    let objects = canvas.getObjects();
    let cObj = objects.find((x) => x.id === "poll");

    let x = cObj.left;
    let y = cObj.top;

    let clickbleSticker = this.clickbleStikers.find((x) => x.id === cObj.id);

    let question = this.frmPoll.get("question").value;
    let pAnswer = this.frmPoll.get("pAnswer").value;
    let nAnswer = this.frmPoll.get("nAnswer").value;

    const poll = {
      id: cObj.id,
      x: x,
      y: y,
      question: question,
      tallies: [{ text: pAnswer }, { text: nAnswer }],
    };

    if (clickbleSticker) {
      let index = this.clickbleStikers.indexOf(clickbleSticker);
      this.clickbleStikers[index] = poll;
    } else {
      this.clickbleStikers.push(poll);
    }

    console.log(this.clickbleStikers);

    this.closeAddDynamicSticker();
  }

  addQuiz(index) {
    let stick = this.clickbleStickersCurrent[index].options;

    let question = stick.question;
    let options = stick.options;
    let correctAnswer = stick.correctAnswer;

    let activeStick = this.canvas.getActiveObject();

    let x = activeStick.left;
    let y = activeStick.top;

    const quiz = {
      id: activeStick.cacheKey,
      x: x,
      y: y,
      question: question,
      options: options,
      correctAnswer: correctAnswer,
    };

    this.clickbleStikers.push(quiz);
  }

  addSlider() {
    let canvas = this.canvas;

    let objects = canvas.getObjects();
    let cObj = objects.find((x) => x.id === "slider");

    let x = cObj.left;
    let y = cObj.top;

    let clickbleSticker = this.clickbleStikers.find((x) => x.id === cObj.id);

    let question = this.frmSlider.get("question").value;
    let emoji = this.frmSlider.get("emoji").value;

    const slider = {
      x: x,
      y: y,
      question: question,
      emoji: emoji,
    };

    if (clickbleSticker) {
      let index = this.clickbleStikers.indexOf(clickbleSticker);
      this.clickbleStikers[index] = slider;
    } else {
      this.clickbleStikers.push(slider);
    }

    console.log(this.clickbleStikers);

    this.closeAddDynamicSticker();
  }

  addQuestion() {
    let canvas = this.canvas;

    let objects = canvas.getObjects();
    let cObj = objects.find((x) => x.id === "question");

    let x = cObj.left;
    let y = cObj.top;

    let clickbleSticker = this.clickbleStikers.find((x) => x.id === cObj.id);

    let questionText = this.frmQuestion.get("question").value;

    const question = {
      x: x,
      y: y,
      question: questionText,
    };

    if (clickbleSticker) {
      let index = this.clickbleStikers.indexOf(clickbleSticker);
      this.clickbleStikers[index] = question;
    } else {
      this.clickbleStikers.push(question);
    }

    console.log(this.clickbleStikers);

    this.closeAddDynamicSticker();
  }

  addHashtag() {
    let canvas = this.canvas;

    let objects = canvas.getObjects();
    let cObj = objects.find((x) => x.id === "hashtag");

    let x = cObj.left;
    let y = cObj.top;

    let clickbleSticker = this.clickbleStikers.find((x) => x.id === cObj.id);

    let tagField = this.frmHashtag.get("hashtag").value;

    const hashtag = {
      id: cObj.id,
      x: x,
      y: y,
      tagName: tagField,
    };

    if (clickbleSticker) {
      let index = this.clickbleStikers.indexOf(clickbleSticker);
      this.clickbleStikers[index] = hashtag;
    } else {
      this.clickbleStikers.push(hashtag);
    }

    console.log(this.clickbleStikers);

    this.closeAddDynamicSticker();
  }

  addMention(index) {
    // упоминание человека, работает также как и хештег
    const mention = {
      x: 0.5,
      y: 0.5,
      userId: "client.state.cookieUserId",
    };

    this.clickbleStikers.push(mention);
  }

  addLocation(index) {
    // локация (гео-тег) работыет также как и хештег
    const location = {
      x: 0.5,
      y: 0.5,
      locationId:
        "(await client.locationSearch.index(13, 37)).venues[0].external_id",
    };

    this.clickbleStikers.push(location);
  }

  addCountDown(index) {
    // не смогу проверить этот стикеры - выпадает ошибка на результат работы либы luxon
    // которая подставляет дату в поле endTs
    // const countdown = StickerBuilder.countdown({
    // 	x: 0.5,
    // 	y: 0.5,
    // 	text: 'My Countdown',
    // 	// @ts-ignore
    // 	endTs: DateTime.local().plus(Duration.fromObject({ hours: 1 })) // таймер закончится через 1 час
    // });
    // stickerConfig.add(countdown);
  }

  addLinkStory(index) {
    // ссылка на сториз на котром нас отметили
    // нужно рисовать для телефона и веба самостоятельно на холсте
    // const userId = await getIdByUsername('liftmepro');
    // const stories = await getStoriesByUserdId(userId);
    // const mentionReel = StickerBuilder.mentionReel(stories[0]).center();
    // stickerConfig.add(mentionReel);
  }

  addLinkPost(index) {
    // ссылка на пост
    // создает кликабельную область
    // нужно рисовать для телефона и веба самостоятельно на холсте
    // const attachment = StickerBuilder.attachmentFromMedia((await client.feed.timeline().items())[0]).center(); // метод цент устанавливает элемент по середине (вместо width, height = 0.5)
    // stickerConfig.add(attachment);
  }
  //#endregion

  //#region Common
  resetForms() {
    this.frmHashtag.patchValue({
      hashtag: "hashtag",
    });
  }

  @HostListener("click", ["$event"]) onClick($event) {
    let canvas = this.canvas;
    let cObj = canvas.getActiveObject();
    console.log(cObj);

    let selectedSticker = null;
    if (cObj) {
      if (cObj.id.indexOf("text-") >= 0) {
        this.isTextEdit = true;
        this.currentTextObject = cObj;
        this.index = 3;
      } else {
        switch (cObj.id) {
          case "hashtag":
            this.index = 2;
            this.isStickerEdit = true;
            selectedSticker = this.dynamicStickers.find((x) => x.index === 2);
            this.currentSticker = selectedSticker;
            break;
          case "poll":
            this.index = 2;
            this.isStickerEdit = true;
            selectedSticker = this.dynamicStickers.find((x) => x.index === 6);
            this.currentSticker = selectedSticker;
            break;
          case "slider":
            this.index = 2;
            this.isStickerEdit = true;
            selectedSticker = this.dynamicStickers.find((x) => x.index === 9);
            this.currentSticker = selectedSticker;
            break;
          case "question":
            this.index = 2;
            this.isStickerEdit = true;
            selectedSticker = this.dynamicStickers.find((x) => x.index === 7);
            this.currentSticker = selectedSticker;
            break;
          default:
            break;
        }
      }
    } else {
      this.isStickerEdit = false;
      this.currentSticker = null;
      this.isTextEdit = false;
      this.currentTextObject = null;
    }
  }

  @HostListener("document:keydown.delete", ["$event"])
  removeObject() {
    let canvas = this.canvas;
    let cObj = canvas.getActiveObject();
    this.canvas.remove(cObj);

    let clickbleSticker = this.clickbleStikers.indexOf((x) => x.id === cObj.id);
    if (clickbleSticker) {
      let index = this.dynamicStickers.indexOf(
        this.dynamicStickers.find((x) => x.type === cObj.id)
      );
      this.dynamicStickers[index].disable = false;
      this.clickbleStikers.splice(clickbleSticker, 1);

      this.resetForms();
      this.closeAddDynamicSticker();
    }
    console.log(this.clickbleStikers);
  }

  indexTracker(index: number, value: any) {
    return index;
  }

  // dataURLtoBlob function for saving
  dataURLtoBlob(dataurl) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  public download() {
    this.capturer.save();
    // Save image
    // var link = document.getElementById("saveimage");

    // // Remove overlay image
    // this.canvas.overlayImage = null;
    // this.canvas.renderAll.bind(this.canvas);
    // // Remove canvas clipping so export the image
    // this.canvas.clipTo = null;
    // // Export the canvas to dataurl at 3 times the size and crop to the active area
    // var imgData = this.getImgData();

    // var blob = this.dataURLtoBlob(imgData);

    // var a = document.createElement("a");
    // a.href = URL.createObjectURL(blob);
    // a.download = "post.gif";
    // // start download
    // a.click();
  }

  getImgData() {
    let canv = this.canvas;
    let result = canv.toDataURL({
      format: "gif",
      quality: 1,
      multiplier: 3,
      // left: 220,
      // top: 80,
      width: 360,
      height: 640,
    });

    return result;
  }

  //#endregion

  //#region video
  removeVideo() {
    var video1El: any = document.getElementById("video1");
    video1El.pause();

    this.canvas.remove(this.video1);
    this.videoUrl = null;
  }

  onVideoFileChanged(event) {
    if (event.target.files.length === 0) return;

    let file = event.target.files[0];
    let canvas = this.canvas;

    const fileReader: FileReader = new FileReader();

    fileReader.readAsDataURL(file);
    fileReader.onload = (file) => {
      var video1El: any = document.getElementById("video1");
      var video1 = new fabric.Image(video1El, {
        left: 0,
        top: 0,
        scaleX: canvas.width / video1El.width,
        scaleY: canvas.height / video1El.height,
        selectable: false,
      });

      canvas.add(video1);
      video1El.load();
    };
  }

  playVideo() {
    var video1El: any = document.getElementById("video1");
    var playpause = document.getElementById("playpause");
    var progress: any = document.getElementById("progress");
    var progressBar: any = document.getElementById("progress-bar");

    if (video1El.paused || video1El.ended) {
      video1El.play();

      // As the video is playing, update the progress bar
      video1El.addEventListener("timeupdate", function () {
        // For mobile browsers, ensure that the progress element's max attribute is set
        if (!progress.getAttribute("max"))
          progress.setAttribute("max", video1El.duration);
        progress.value = video1El.currentTime;
        progressBar.style.width =
          Math.floor((video1El.currentTime / video1El.duration) * 100) + "%";
      });
    } else {
      video1El.pause();
    }

    let canvas = this.canvas;

    // filter
    // var filter = new fabric.Image.filters.BlendColor({
    //     color:'red',
    //     mode: 'tint',
    //     alpha: 0.5
    // });

    fabric.util.requestAnimFrame(function render() {
      var image = canvas.item(0);
      var backend = fabric.filterBackend;
      if (backend && backend.evictCachesForKey) {
        backend.evictCachesForKey(image.cacheKey);
        backend.evictCachesForKey(image.cacheKey + "_filtered");
      }

      // filter
      // canvas.item(0).applyFilters();
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });

    if (video1El.paused || video1El.ended) {
      playpause.setAttribute("data-state", "play");
    } else {
      playpause.setAttribute("data-state", "pause");
    }

    progress.setAttribute("max", video1El.duration);
  }

  muteMusic() {
    var video1El: any = document.getElementById("video1");
    var mute = document.getElementById("mute");

    video1El.muted = !video1El.muted;
    mute.setAttribute("data-state", video1El.muted ? "unmute" : "mute");
  }

  public startRecording() {
    this.test();

    // let canvas = this.canvas;
    // const chunks = [];

    // let rCanvas: any = document.getElementById("c");
    // const stream = rCanvas.captureStream();
    // const rec = new MediaRecorder(stream);

    // rec.ondataavailable = (e) => chunks.push(e.data);

    // rec.onstop = (e) =>
    //   this.exportVid(new Blob(chunks, { type: "video/webm" }));

    // rec.start();
    // setTimeout(() => rec.stop(), 3000); // stop recording in 3s
  }

  public exportVid(blob) {
    console.log("im comming");
    const vid = document.createElement("video");
    vid.src = URL.createObjectURL(blob);
    vid.controls = true;
    document.body.appendChild(vid);
    const a = document.createElement("a");
    a.download = "myvid.webm";
    a.href = vid.src;
    a.textContent = "download the video";
    document.body.appendChild(a);
  }
  //#endregion

  test() {
    const canvas2videoInstance = new Canvas2Video({
      canvas: document.querySelector("c"),
      outVideoType: "mp4",
      workerOptions: {
        // corePath: 'https://unpkg.com/@ffmpeg/core@0.6.0/ffmpeg-core.js'
      },
    });
    canvas2videoInstance.startRecord();

    setTimeout(() => {
      canvas2videoInstance.stopRecord();
    }, 3000);
    canvas2videoInstance
      .getStreamURL()
      .then((url) => {
        console.log("url", url);
        let videoContainer: any = document.querySelector("#videoContainer");
        videoContainer.style.display = "block";
        document.querySelector("video").src = url;
      })
      .catch((err) => console.error(err));
  }

  generateUID(): string {
    return Math.random().toString(36).slice(-6);
  }

  openCanva() {
    (async function () {
      if (window.Canva && window.Canva.DesignButton) {
        const api = await window.Canva.DesignButton.initialize({
          apiKey: 's6ObZh0JT3K9jEB_0qVNx0XF',
        });
        // Use "api" object or save for later

        api.createDesign({
          design: {
            type: 'InstagramStory',
          },
          onDesignOpen: ({ designId }) => {
            // Triggered when editor finishes loading and opens a new design.
            // You can save designId for future use.
          },
          onDesignPublish: ({ exportUrl, designId }) => {
            // Triggered when design is published to an image.
            // Save the image to your server as the exportUrl will expire shortly.
          },
          onDesignClose: () => {
            // Triggered when editor is closed.
          },
        });
      }
    })();
  }
}

//TODO: GET THIS CODE FOR EXPORT VIDEO
// function clickHandler() {

//   this.textContent = 'stop recording';
//   cStream = canvas.captureStream(30);
//   cStream.addTrack(aStream.getAudioTracks()[0]);

//   recorder = new MediaRecorder(cStream);
//   recorder.start();

//   recorder.ondataavailable = saveChunks;

//   recorder.onstop = exportStream;

//   this.onclick = stopRecording;

// };

// function exportStream(e) {

//   if (chunks.length) {

//     var blob = new Blob(chunks)
//     var vidURL = URL.createObjectURL(blob);
//     var vid = document.createElement('video');
//     vid.controls = true;
//     vid.src = vidURL;
//     vid.onend = function() {
//       URL.revokeObjectURL(vidURL);
//     }
//     document.body.insertBefore(vid, canvas);

//   } else {

//     document.body.insertBefore(document.createTextNode('no data saved'), canvas);

//   }
// }

// function saveChunks(e) {

//   e.data.size && chunks.push(e.data);

// }

// function stopRecording() {

//   vid.pause();
//   this.parentNode.removeChild(this);
//   recorder.stop();

// }

// function initAudioStream(evt) {

//   var audioCtx = new AudioContext();
//   // create a stream from our AudioContext
//   var dest = audioCtx.createMediaStreamDestination();
//   aStream = dest.stream;
//   // connect our video element's output to the stream
//   var sourceNode = audioCtx.createMediaElementSource(this);
//   sourceNode.connect(dest)
//     // start the video
//   this.play();

//   // just for the fancy canvas drawings
//   analyser = audioCtx.createAnalyser();
//   sourceNode.connect(analyser);

//   analyser.fftSize = 2048;
//   bufferLength = analyser.frequencyBinCount;
//   dataArray = new Uint8Array(bufferLength);
//   analyser.getByteTimeDomainData(dataArray);

//   // output to our headphones
//   sourceNode.connect(audioCtx.destination)

//   startCanvasAnim();

//   rec.onclick = clickHandler;
//   rec.disabled = false;
// };

// var loadVideo = function() {

//   vid = document.createElement('video');
//   vid.crossOrigin = 'anonymous';
//   vid.oncanplay = initAudioStream;
//   vid.src = 'https://dl.dropboxusercontent.com/s/bch2j17v6ny4ako/movie720p.mp4';

// }

// function startCanvasAnim() {
//   // from MDN https://developer.mozilla.org/en/docs/Web/API/AnalyserNode#Examples
//   var canvasCtx = canvas.getContext('2d');

//   canvasCtx.fillStyle = 'rgb(200, 200, 200)';
//   canvasCtx.lineWidth = 2;
//   canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

//   var draw = function() {

//     var drawVisual = requestAnimationFrame(draw);

//     analyser.getByteTimeDomainData(dataArray);

//     canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
//     canvasCtx.beginPath();

//     var sliceWidth = canvas.width * 1.0 / bufferLength;
//     var x = 0;

//     for (var i = 0; i < bufferLength; i++) {

//       var v = dataArray[i] / 128.0;
//       var y = v * canvas.height / 2;

//       if (i === 0) {
//         canvasCtx.moveTo(x, y);
//       } else {
//         canvasCtx.lineTo(x, y);
//       }

//       x += sliceWidth;
//     }

//     canvasCtx.lineTo(canvas.width, canvas.height / 2);
//     canvasCtx.stroke();

//   };

//   draw();

// }

// loadVideo();
