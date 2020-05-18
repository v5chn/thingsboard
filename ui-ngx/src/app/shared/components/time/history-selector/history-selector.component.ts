///
/// Copyright © 2016-2020 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { interval } from 'rxjs';
import { filter } from 'rxjs/operators';
import { HistorySelectSettings } from '@app/modules/home/components/widget/lib/maps/map-models';

@Component({
  selector: 'tb-history-selector',
  templateUrl: './history-selector.component.html',
  styleUrls: ['./history-selector.component.scss']
})
export class HistorySelectorComponent implements OnInit, OnChanges {

  @Input() settings: HistorySelectSettings
  @Input() minTime: number;
  @Input() maxTime: number;
  @Input() step = 1000;

  @Output() timeUpdated: EventEmitter<number> = new EventEmitter();

  minTimeIndex = 0;
  maxTimeIndex = 0;
  speed = 1;
  index = 0;
  playing = false;
  interval;
  speeds = [1, 5, 10, 25];
  currentTime = null;


  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.maxTimeIndex =  Math.ceil((this.maxTime - this.minTime) / this.step);
    this.currentTime = this.minTime === Infinity ? null : this.minTime;
  }

  play() {
    this.playing = true;
    if (!this.interval)
      this.interval = interval(1000 / this.speed)
        .pipe(
          filter(() => this.playing)).subscribe(() => {
            this.index++;
            this.currentTime = this.minTime + this.index * this.step;
            if (this.index <= this.maxTimeIndex) {
              this.cd.detectChanges();
              this.timeUpdated.emit(this.currentTime);
            }
            else {
              this.interval.complete();
            }
          }, err => {
            console.error(err);
          }, () => {
            this.currentTime = this.index = this.minTimeIndex;
            this.playing = false;
            this.interval = null;
            this.cd.detectChanges();
          });
  }

  reeneble() {
    if (this.playing) {
      const position = this.index;
      this.interval.complete();
      this.index = position;
      this.play();
    }
  }

  pause() {
    this.playing = false;
    this.currentTime = this.minTime + this.index * this.step;
    this.cd.detectChanges();
    this.timeUpdated.emit(this.currentTime);
  }

  moveNext() {
    if (this.index <= this.maxTimeIndex) {
      this.index++;
    }
    this.pause();
  }

  movePrev() {
    if (this.index > this.minTimeIndex) {
      this.index--;
    }
    this.pause();
  }

  moveStart() {
    this.index = this.minTimeIndex;
    this.pause();
  }

  moveEnd() {
    this.index = this.maxTimeIndex;
    this.pause();
  }

  changeIndex() {
    this.currentTime = this.minTime + this.index * this.step;
    this.timeUpdated.emit(this.currentTime);
  }
}