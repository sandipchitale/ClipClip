import { Component, OnInit } from '@angular/core';
import { clipboard, remote, shell, NativeImage } from 'electron';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';

import { Clip } from './clip';


@Component({
  selector: 'cc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  readonly TEXT_PLAIN = 'text/plain';
  readonly IMAGE_PNG = 'image/png';
  readonly BOTH = this.TEXT_PLAIN + this.IMAGE_PNG;
  readonly STRING = 'string';
  readonly minHistorySize = 2;
  readonly maxHistorySize = 20;
  readonly historySizes = Array(this.maxHistorySize - this.minHistorySize + 1).fill(0).map((_, i) => i + this.minHistorySize);
  filter = this.BOTH;
  historySize = 10;
  images = false;
  clips: Clip[] = [];

  ngOnInit(): void {
    Observable.timer(0, 5000).subscribe(() => {
      const formats = clipboard.availableFormats();
      let payload: string | Electron.NativeImage;
      let format: string;
      if (formats.indexOf(this.IMAGE_PNG) !== -1) {
        if (this.images) {
          payload = clipboard.readImage();
          format = this.IMAGE_PNG;
        }
      } else if (formats.indexOf(this.TEXT_PLAIN) !== -1) {
        payload = clipboard.readText();
        format = this.TEXT_PLAIN;
      } else {
        return;
      }
      if (payload) {
        let index = -1;
        let payloadDataUrl;
        if (format === this.IMAGE_PNG) {
          payloadDataUrl = payload['toDataURL']();
        }
        for (let i = 0; i < this.clips.length; i++) {
          if (format === this.TEXT_PLAIN && this.clips[i].format === this.TEXT_PLAIN && payload === this.clips[i].clip) {
            index = i;
            break;
          } else if (format === this.IMAGE_PNG && this.clips[i].format === this.IMAGE_PNG && payloadDataUrl === this.clips[i].dataURL) {
            index = i;
            break;
          }
        }
        if (index === -1) {
          this.clips.splice(0, 0, new Clip(payload, format, Date.now()));
          this.trimToHistorySize();
        } else if (index === 0) {
          // nothing to do
        } else {
          this.clips.splice(index, 1);
          this.clips.splice(0, 0, new Clip(payload, format, Date.now()));
          this.trimToHistorySize();
        }
      }
    });
    window.addEventListener('keyup', (event) => {
      if (event.key === 'Escape') {
        this.hide();
      } else if (this.clips.length > 1) {
        if (event.ctrlKey) {
          if (event.key === 'ArrowUp') {
            let clip = this.clips.shift();
            this.clips.push(clip);
            clip = this.clips[0];
            if (typeof clip.clip === this.STRING) {
              clipboard.writeText(<string>clip.clip);
            } else if (clip.format === this.IMAGE_PNG) {
              clipboard.writeImage(<NativeImage>clip.clip);
            }
          } else if (event.key === 'ArrowDown') {
            this.makeCurrent(this.clips[this.clips.length - 1]);
          }
        }
      }
    }, true);
  }

  get filtredClips() : Clip[] {
    if (this.clips.length < 2 || this.filter === this.BOTH) {
      return this.clips;
    }
    return [this.clips[0], ...(this.clips.slice(1).filter(clip => clip.format === this.filter))];
  }

  toggleFavorite(clip: Clip) {
    clip.favorite = !clip.favorite;
  }

  moveUp(clip: Clip) {
    const index = this.clips.indexOf(clip);
    if (index !== -1) {
      this.clips.splice(index, 1);
      this.clips.splice(index - 1, 0, clip);
    }
  }

  moveDown(clip: Clip) {
    const index = this.clips.indexOf(clip);
    if (index !== -1) {
      this.clips.splice(index, 1);
      this.clips.splice(index + 1, 0, clip);
    }
  }

  remove(clip: Clip) {
    const index = this.clips.indexOf(clip);
    if (index !== -1) {
      this.clips.splice(index, 1);
    }
  }

  makeCurrent(clip: Clip) {
    this.remove(clip);
    if (typeof clip.clip === this.STRING) {
      this.clips.splice(0, 0, new Clip(clip.clip, this.TEXT_PLAIN, Date.now()));
      clipboard.writeText(<string>clip.clip);
    } else if (clip.format === this.IMAGE_PNG) {
      this.clips.splice(0, 0, new Clip(clip.clip, this.IMAGE_PNG, Date.now()));
      clipboard.writeImage(<NativeImage>clip.clip);
    }
  }

  issues() {
    shell.openExternal('https://github.com/sandipchitale/ClipClip/issues');
  }

  hide() {
    remote.getCurrentWindow().hide();
  }

  get shortcut() {
    return remote.getGlobal('ShowClipClipShortcut');
  }

  trimToHistorySize() {
    while (this.clips.length > this.historySize) {
      this.clips.pop();
    }
  }

  // quit() {
  //   remote.app.quit();
  // }
}
