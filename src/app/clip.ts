// Epochs
const epochs: any = [
  ['year', 31536000],
  ['month', 2592000],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1]
];

export class Clip {
  private _favorite = false;
  private _dataURL: string;
  private _width: number;
  private _height: number;

  constructor(private _clip: string | Electron.NativeImage, private _format: string, private _timestamp: number) {
    if (_format === 'image/png') {
      this._dataURL = _clip['toDataURL']();
      this._width = _clip['getSize']().width;
      this._height = _clip['getSize']().height;
    }
  }

  get favorite() {
    return this._favorite;
  }

  set favorite(favorite: boolean) {
    this._favorite = favorite;
  }

  get clip(): string | Electron.NativeImage {
    return this._clip;
  }

  get clipLines(): Array<string> {
    if (this._format === 'text/plain') {
      return (<string>this._clip).split('\n');
    }
    return [];
  }

  get dataURL(): string | Electron.NativeImage {
    return this._dataURL;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get format(): string {
    return this._format;
  }

  get timestamp(): number {
    return this._timestamp;
  }

  private getDuration(timeAgoInSeconds: number) {
    for (const [name, seconds] of epochs) {
        const interval = Math.floor(timeAgoInSeconds / seconds);

        if (interval >= 1) {
            return {
                interval: interval,
                epoch: name
            };
        }
    }
    return {
        interval: 0,
        epoch: 'seconds'
    };
  }

  get relativeTimestamp(): string {
      const timeAgoInSeconds = Math.floor((new Date().getTime() - new Date(this._timestamp).getTime()) / 1000);
      const {interval, epoch} = this.getDuration(timeAgoInSeconds);
      const suffix = interval === 1 ? '' : 's';

      return `${interval} ${epoch}${suffix} ago`;
  }
}
