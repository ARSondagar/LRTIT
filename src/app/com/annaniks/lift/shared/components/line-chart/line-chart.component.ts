import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js';
import { LineChartData } from '../../../core/models/statistics';
@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit, AfterViewInit {
  private _dataSets = [];
  private _data: Array<number> = [];
  @Input() padding = 0;
  @Input()
  size: { width: string, height: string } = { width: '100%', height: '111px' }
  @Input()
  customId: string
  @Input()
  big = false;
  @Input()
  labels: string[] = [];
  @Input()
  set dataSets($event) {
    const dataSets: LineChartData[] = $event;
    this._dataSets = [];
    dataSets.map((element) => {
      this._data = element.data;
      this._dataSets.push({
        data: element.data,
        label: element.label,
        pointRadius: this.big ? 7 : 4,
        borderColor: element.borderColor,
        backgroundColor: element.backgroundColor,
        borderWidth: this.big ? 4 : 2,
        fill: true,
        pointBorderColor: element.borderColor,
        pointBackgroundColor: "white",
        pointBorderWidth: this.big ? 3 : 1,
      })
    })
  }

  constructor() {
    this._dataSets = [];
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this._initLineChart()
  }

  private _initLineChart(): void {
    const ctx = document.getElementById(this.customId);
    const max = this._data.length ? Math.max(...this._data) + 10 : 10;
    // let min = this._data.length <= 10 ? Math.min(...this._data) : 0;
    let min = 0;
    min = min ? min - 1 : min;
    const gridDisplay = !!this._dataSets[0].data.length;
    const myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: this._dataSets
      },
      options: {
        responsive: true,
        aspectRatio: 1,
        layout: {padding: this.padding},
        legend: {
          display: false
        },
        tooltips: {
          intersect: false,
          mode: 'nearest',
          displayColors: false,
          backgroundColor: 'white',
          bodyFontFamily: 'SF UI Display Regular',
          bodyFontColor: '#ababab',
          callbacks: {
            title: () => {
              return ''
            },
            label: (tooltipItem, { datasets }) => {
              const dataIndex: number = tooltipItem.index ? tooltipItem.index - 1 : 0;
              const prevTooltipItemValue = datasets[tooltipItem.datasetIndex].data[dataIndex];
              const progress: number = tooltipItem.value - prevTooltipItemValue;
              const symbol = (progress >= 0) ? '+' : '';
              return (this.big)
                ? [`${tooltipItem.value} ${datasets[tooltipItem.datasetIndex].label}`,
                  `${symbol}${progress}`]
                : `${tooltipItem.value} | ${tooltipItem.xLabel}`
            },
          }
        },
        scales: {
          // yAxes: [{
          //   ticks: {
          //     display: this.big ? true : false,
          //     stepSize: 10,
          //     min,
          //     max,
          //     beginAtZero: true
          //   },
          //   gridLines: {
          //     drawTicks: this.big ? true : false,
          //     display: gridDisplay
          //   }
          // }],
          // xAxes: [{
          //   gridLines: {
          //     drawTicks: this.big ? true : false,
          //     display: this.big ? true : false
          //   },
          //   ticks: {
          //     display: this.big ? true : false,
          //     beginAtZero: false
          //   }
          // }]
        }
      }
    });
  }
}
