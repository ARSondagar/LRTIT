import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Chart } from 'chart.js';

import { LineChartData } from '../../../core/models/statistics';

@Component({
  selector: 'app-simple-line-chart',
  templateUrl: './simple-line-chart.component.html',
  styleUrls: ['./simple-line-chart.component.scss'],
})
export class SimpleLineChartComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @Input() big = false;
  @Input() padding = 0;
  @Input() set labels(val: string[]) {
    this.labels$.next(val);
  }
  @Input()
  set dataSets(lines: LineChartData[]) {
    this.datasets$.next(
      lines.map((line) => {
        return {
          data: line.data,
          label: line.label,
          pointRadius: false ? 7 : 4,
          borderColor: line.borderColor,
          backgroundColor: line.backgroundColor,
          borderWidth: false ? 4 : 2,
          fill: true,
          pointBorderColor: line.borderColor,
          pointBackgroundColor: 'white',
          pointBorderWidth: false ? 3 : 1,
        };
      })
    );
  }

  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  private datasets$ = new BehaviorSubject<LineChartData[]>([]);
  private labels$ = new BehaviorSubject<any[]>([]);
  private lineChart: Chart;
  private $sub = new Subscription();

  constructor() {}

  ngOnInit() {
    this.initLineChart();
  }

  ngOnDestroy() {
    this.$sub.unsubscribe();
  }

  ngAfterViewInit() {
    this.$sub.add(
      combineLatest([this.datasets$, this.labels$])
        .pipe(
          filter(([datasets, labels]) => {
            return (
              datasets.length &&
              datasets.every((dataset) => dataset.data.length === labels.length)
            );
          }),
          map(([datasets, labels]) => {
            return {
              datasets,
              labels,
            };
          })
        )
        .subscribe((data) => {
          this.lineChart.data = data;
          this.lineChart.update();
        })
    );
  }

  private initLineChart() {
    this.lineChart = new Chart(this.canvas.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        aspectRatio: 1.5,
        layout: { padding: this.padding },
        scales: {
          yAxes: [{
            ticks: {
              precision: 0
            }
          }]
        },
        legend: {
          display: false,
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
              return '';
            },
            label: (tooltipItem, { datasets }) => {
              const dataIndex: number = tooltipItem.index
                ? tooltipItem.index - 1
                : 0;
              const prevTooltipItemValue =
                datasets[tooltipItem.datasetIndex].data[dataIndex];
              const progress: number = tooltipItem.value - prevTooltipItemValue;
              const symbol = progress >= 0 ? '+' : '';
              return this.big
                ? [
                    `${tooltipItem.value} ${
                      datasets[tooltipItem.datasetIndex].label
                    }`,
                    `${symbol}${progress}`,
                  ]
                : `${tooltipItem.value} | ${tooltipItem.xLabel}`;
            },
          },
        },
      },
    });
  }
}
