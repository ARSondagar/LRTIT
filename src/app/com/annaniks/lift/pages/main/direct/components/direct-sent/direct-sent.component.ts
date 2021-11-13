import { Component, OnInit, Input } from "@angular/core";

@Component({
    selector: "app-direct-sent",
    templateUrl: "direct-sent.component.html",
    styleUrls: ["direct-sent.component.scss"]
})

export class DirectSentComponent implements OnInit {
    @Input() texts: string[];

    constructor() { }

    ngOnInit() { }
}