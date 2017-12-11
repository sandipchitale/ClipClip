const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const postcssUrl = require('postcss-url');
const cssnano = require('cssnano');
const customProperties = require('postcss-custom-properties');

const { NoEmitOnErrorsPlugin, SourceMapDevToolPlugin, NamedModulesPlugin } = require('webpack');
const { NamedLazyChunksWebpackPlugin, BaseHrefWebpackPlugin } = require('@angular/cli/plugins/webpack');
const { CommonsChunkPlugin } = require('webpack').optimize;
const { AngularCompilerPlugin } = require('@ngtools/webpack');

const nodeModules = path.join(process.cwd(), 'node_modules');
const realNodeModules = fs.realpathSync(nodeModules);
const genDirNodeModules = path.join(process.cwd(), 'src', '$$_gendir', 'node_modules');
const entryPoints = ["inline","polyfills","sw-register","styles","vendor","main"];
const minimizeCss = false;
const baseHref = "";
const deployUrl = "";
const postcssPlugins = function () {
        // safe settings based on: https://github.com/ben-eb/cssnano/issues/358#issuecomment-283696193
        const importantCommentRe = /@preserve|@license|[@#]\s*source(?:Mapping)?URL|^!/i;
        const minimizeOptions = {
            autoprefixer: false,
            safe: true,
            mergeLonghand: false,
            discardComments: { remove: (comment) => !importantCommentRe.test(comment) }
        };
        return [
            postcssUrl({
                url: (URL) => {
                    // Only convert root relative URLs, which CSS-Loader won't process into require().
                    if (!URL.startsWith('/') || URL.startsWith('//')) {
                        return URL;
                    }
                    if (deployUrl.match(/:\/\//)) {
                        // If deployUrl contains a scheme, ignore baseHref use deployUrl as is.
                        return `${deployUrl.replace(/\/$/, '')}${URL}`;
                    }
                    else if (baseHref.match(/:\/\//)) {
                        // If baseHref contains a scheme, include it as is.
                        return baseHref.replace(/\/$/, '') +
                            `/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
                    }
                    else {
                        // Join together base-href, deploy-url and the original URL.
                        // Also dedupe multiple slashes into single ones.
                        return `/${baseHref}/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
                    }
                }
            }),
            autoprefixer(),
            customProperties({ preserve: true })
        ].concat(minimizeCss ? [cssnano(minimizeOptions)] : []);
    };

module.exports = [
  {
    "target": "electron-main",
    "entry": {
      "main": [
        "./electron/main.ts"
      ],
    },
    "output": {
      "path": path.join(process.cwd(), "dist"),
      "filename": "[name].js"
    },
    "module": {
      "rules": [
        {
          "test": /\.ts$/,
          "loader": "ts-loader"
        }
      ]
    },
    "plugins": [
      new CopyWebpackPlugin([
        {
          "context": "electron",
          "to": "",
          "from": {
            "glob": "package.json",
            "dot": true
          }
        }
      ])
    ],
    node: {
      __dirname: false,
      __filename: false
    }
  },
  {
    "target": "electron-renderer",
    "resolve": {
      "extensions": [
        ".ts",
        ".js"
      ],
      "modules": [
        "./node_modules",
        "./node_modules"
      ],
      "symlinks": true,
      "alias": {
        "rxjs/util/tryCatch": process.cwd() + "/node_modules/rxjs/_esm5/util/tryCatch.js",
        "rxjs/util/toSubscriber": process.cwd() + "/node_modules/rxjs/_esm5/util/toSubscriber.js",
        "rxjs/util/subscribeToResult": process.cwd() + "/node_modules/rxjs/_esm5/util/subscribeToResult.js",
        "rxjs/util/root": process.cwd() + "/node_modules/rxjs/_esm5/util/root.js",
        "rxjs/util/pipe": process.cwd() + "/node_modules/rxjs/_esm5/util/pipe.js",
        "rxjs/util/not": process.cwd() + "/node_modules/rxjs/_esm5/util/not.js",
        "rxjs/util/noop": process.cwd() + "/node_modules/rxjs/_esm5/util/noop.js",
        "rxjs/util/isScheduler": process.cwd() + "/node_modules/rxjs/_esm5/util/isScheduler.js",
        "rxjs/util/isPromise": process.cwd() + "/node_modules/rxjs/_esm5/util/isPromise.js",
        "rxjs/util/isObject": process.cwd() + "/node_modules/rxjs/_esm5/util/isObject.js",
        "rxjs/util/isNumeric": process.cwd() + "/node_modules/rxjs/_esm5/util/isNumeric.js",
        "rxjs/util/isFunction": process.cwd() + "/node_modules/rxjs/_esm5/util/isFunction.js",
        "rxjs/util/isDate": process.cwd() + "/node_modules/rxjs/_esm5/util/isDate.js",
        "rxjs/util/isArrayLike": process.cwd() + "/node_modules/rxjs/_esm5/util/isArrayLike.js",
        "rxjs/util/isArray": process.cwd() + "/node_modules/rxjs/_esm5/util/isArray.js",
        "rxjs/util/identity": process.cwd() + "/node_modules/rxjs/_esm5/util/identity.js",
        "rxjs/util/errorObject": process.cwd() + "/node_modules/rxjs/_esm5/util/errorObject.js",
        "rxjs/util/assign": process.cwd() + "/node_modules/rxjs/_esm5/util/assign.js",
        "rxjs/util/applyMixins": process.cwd() + "/node_modules/rxjs/_esm5/util/applyMixins.js",
        "rxjs/util/UnsubscriptionError": process.cwd() + "/node_modules/rxjs/_esm5/util/UnsubscriptionError.js",
        "rxjs/util/TimeoutError": process.cwd() + "/node_modules/rxjs/_esm5/util/TimeoutError.js",
        "rxjs/util/Set": process.cwd() + "/node_modules/rxjs/_esm5/util/Set.js",
        "rxjs/util/ObjectUnsubscribedError": process.cwd() + "/node_modules/rxjs/_esm5/util/ObjectUnsubscribedError.js",
        "rxjs/util/MapPolyfill": process.cwd() + "/node_modules/rxjs/_esm5/util/MapPolyfill.js",
        "rxjs/util/Map": process.cwd() + "/node_modules/rxjs/_esm5/util/Map.js",
        "rxjs/util/Immediate": process.cwd() + "/node_modules/rxjs/_esm5/util/Immediate.js",
        "rxjs/util/FastMap": process.cwd() + "/node_modules/rxjs/_esm5/util/FastMap.js",
        "rxjs/util/EmptyError": process.cwd() + "/node_modules/rxjs/_esm5/util/EmptyError.js",
        "rxjs/util/ArgumentOutOfRangeError": process.cwd() + "/node_modules/rxjs/_esm5/util/ArgumentOutOfRangeError.js",
        "rxjs/util/AnimationFrame": process.cwd() + "/node_modules/rxjs/_esm5/util/AnimationFrame.js",
        "rxjs/testing/TestScheduler": process.cwd() + "/node_modules/rxjs/_esm5/testing/TestScheduler.js",
        "rxjs/testing/TestMessage": process.cwd() + "/node_modules/rxjs/_esm5/testing/TestMessage.js",
        "rxjs/testing/SubscriptionLoggable": process.cwd() + "/node_modules/rxjs/_esm5/testing/SubscriptionLoggable.js",
        "rxjs/testing/SubscriptionLog": process.cwd() + "/node_modules/rxjs/_esm5/testing/SubscriptionLog.js",
        "rxjs/testing/HotObservable": process.cwd() + "/node_modules/rxjs/_esm5/testing/HotObservable.js",
        "rxjs/testing/ColdObservable": process.cwd() + "/node_modules/rxjs/_esm5/testing/ColdObservable.js",
        "rxjs/symbol/rxSubscriber": process.cwd() + "/node_modules/rxjs/_esm5/symbol/rxSubscriber.js",
        "rxjs/symbol/observable": process.cwd() + "/node_modules/rxjs/_esm5/symbol/observable.js",
        "rxjs/symbol/iterator": process.cwd() + "/node_modules/rxjs/_esm5/symbol/iterator.js",
        "rxjs/scheduler/queue": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/queue.js",
        "rxjs/scheduler/async": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/async.js",
        "rxjs/scheduler/asap": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/asap.js",
        "rxjs/scheduler/animationFrame": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/animationFrame.js",
        "rxjs/scheduler/VirtualTimeScheduler": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/VirtualTimeScheduler.js",
        "rxjs/scheduler/QueueScheduler": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/QueueScheduler.js",
        "rxjs/scheduler/QueueAction": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/QueueAction.js",
        "rxjs/scheduler/AsyncScheduler": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/AsyncScheduler.js",
        "rxjs/scheduler/AsyncAction": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/AsyncAction.js",
        "rxjs/scheduler/AsapScheduler": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/AsapScheduler.js",
        "rxjs/scheduler/AsapAction": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/AsapAction.js",
        "rxjs/scheduler/AnimationFrameScheduler": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/AnimationFrameScheduler.js",
        "rxjs/scheduler/AnimationFrameAction": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/AnimationFrameAction.js",
        "rxjs/scheduler/Action": process.cwd() + "/node_modules/rxjs/_esm5/scheduler/Action.js",
        "rxjs/operators/zipAll": process.cwd() + "/node_modules/rxjs/_esm5/operators/zipAll.js",
        "rxjs/operators/zip": process.cwd() + "/node_modules/rxjs/_esm5/operators/zip.js",
        "rxjs/operators/withLatestFrom": process.cwd() + "/node_modules/rxjs/_esm5/operators/withLatestFrom.js",
        "rxjs/operators/windowWhen": process.cwd() + "/node_modules/rxjs/_esm5/operators/windowWhen.js",
        "rxjs/operators/windowToggle": process.cwd() + "/node_modules/rxjs/_esm5/operators/windowToggle.js",
        "rxjs/operators/windowTime": process.cwd() + "/node_modules/rxjs/_esm5/operators/windowTime.js",
        "rxjs/operators/windowCount": process.cwd() + "/node_modules/rxjs/_esm5/operators/windowCount.js",
        "rxjs/operators/window": process.cwd() + "/node_modules/rxjs/_esm5/operators/window.js",
        "rxjs/operators/toArray": process.cwd() + "/node_modules/rxjs/_esm5/operators/toArray.js",
        "rxjs/operators/timestamp": process.cwd() + "/node_modules/rxjs/_esm5/operators/timestamp.js",
        "rxjs/operators/timeoutWith": process.cwd() + "/node_modules/rxjs/_esm5/operators/timeoutWith.js",
        "rxjs/operators/timeout": process.cwd() + "/node_modules/rxjs/_esm5/operators/timeout.js",
        "rxjs/operators/timeInterval": process.cwd() + "/node_modules/rxjs/_esm5/operators/timeInterval.js",
        "rxjs/operators/throttleTime": process.cwd() + "/node_modules/rxjs/_esm5/operators/throttleTime.js",
        "rxjs/operators/throttle": process.cwd() + "/node_modules/rxjs/_esm5/operators/throttle.js",
        "rxjs/operators/tap": process.cwd() + "/node_modules/rxjs/_esm5/operators/tap.js",
        "rxjs/operators/takeWhile": process.cwd() + "/node_modules/rxjs/_esm5/operators/takeWhile.js",
        "rxjs/operators/takeUntil": process.cwd() + "/node_modules/rxjs/_esm5/operators/takeUntil.js",
        "rxjs/operators/takeLast": process.cwd() + "/node_modules/rxjs/_esm5/operators/takeLast.js",
        "rxjs/operators/take": process.cwd() + "/node_modules/rxjs/_esm5/operators/take.js",
        "rxjs/operators/switchMapTo": process.cwd() + "/node_modules/rxjs/_esm5/operators/switchMapTo.js",
        "rxjs/operators/switchMap": process.cwd() + "/node_modules/rxjs/_esm5/operators/switchMap.js",
        "rxjs/operators/switchAll": process.cwd() + "/node_modules/rxjs/_esm5/operators/switchAll.js",
        "rxjs/operators/subscribeOn": process.cwd() + "/node_modules/rxjs/_esm5/operators/subscribeOn.js",
        "rxjs/operators/startWith": process.cwd() + "/node_modules/rxjs/_esm5/operators/startWith.js",
        "rxjs/operators/skipWhile": process.cwd() + "/node_modules/rxjs/_esm5/operators/skipWhile.js",
        "rxjs/operators/skipUntil": process.cwd() + "/node_modules/rxjs/_esm5/operators/skipUntil.js",
        "rxjs/operators/skipLast": process.cwd() + "/node_modules/rxjs/_esm5/operators/skipLast.js",
        "rxjs/operators/skip": process.cwd() + "/node_modules/rxjs/_esm5/operators/skip.js",
        "rxjs/operators/single": process.cwd() + "/node_modules/rxjs/_esm5/operators/single.js",
        "rxjs/operators/shareReplay": process.cwd() + "/node_modules/rxjs/_esm5/operators/shareReplay.js",
        "rxjs/operators/share": process.cwd() + "/node_modules/rxjs/_esm5/operators/share.js",
        "rxjs/operators/sequenceEqual": process.cwd() + "/node_modules/rxjs/_esm5/operators/sequenceEqual.js",
        "rxjs/operators/scan": process.cwd() + "/node_modules/rxjs/_esm5/operators/scan.js",
        "rxjs/operators/sampleTime": process.cwd() + "/node_modules/rxjs/_esm5/operators/sampleTime.js",
        "rxjs/operators/sample": process.cwd() + "/node_modules/rxjs/_esm5/operators/sample.js",
        "rxjs/operators/retryWhen": process.cwd() + "/node_modules/rxjs/_esm5/operators/retryWhen.js",
        "rxjs/operators/retry": process.cwd() + "/node_modules/rxjs/_esm5/operators/retry.js",
        "rxjs/operators/repeatWhen": process.cwd() + "/node_modules/rxjs/_esm5/operators/repeatWhen.js",
        "rxjs/operators/repeat": process.cwd() + "/node_modules/rxjs/_esm5/operators/repeat.js",
        "rxjs/operators/refCount": process.cwd() + "/node_modules/rxjs/_esm5/operators/refCount.js",
        "rxjs/operators/reduce": process.cwd() + "/node_modules/rxjs/_esm5/operators/reduce.js",
        "rxjs/operators/race": process.cwd() + "/node_modules/rxjs/_esm5/operators/race.js",
        "rxjs/operators/publishReplay": process.cwd() + "/node_modules/rxjs/_esm5/operators/publishReplay.js",
        "rxjs/operators/publishLast": process.cwd() + "/node_modules/rxjs/_esm5/operators/publishLast.js",
        "rxjs/operators/publishBehavior": process.cwd() + "/node_modules/rxjs/_esm5/operators/publishBehavior.js",
        "rxjs/operators/publish": process.cwd() + "/node_modules/rxjs/_esm5/operators/publish.js",
        "rxjs/operators/pluck": process.cwd() + "/node_modules/rxjs/_esm5/operators/pluck.js",
        "rxjs/operators/partition": process.cwd() + "/node_modules/rxjs/_esm5/operators/partition.js",
        "rxjs/operators/pairwise": process.cwd() + "/node_modules/rxjs/_esm5/operators/pairwise.js",
        "rxjs/operators/onErrorResumeNext": process.cwd() + "/node_modules/rxjs/_esm5/operators/onErrorResumeNext.js",
        "rxjs/operators/observeOn": process.cwd() + "/node_modules/rxjs/_esm5/operators/observeOn.js",
        "rxjs/operators/multicast": process.cwd() + "/node_modules/rxjs/_esm5/operators/multicast.js",
        "rxjs/operators/min": process.cwd() + "/node_modules/rxjs/_esm5/operators/min.js",
        "rxjs/operators/mergeScan": process.cwd() + "/node_modules/rxjs/_esm5/operators/mergeScan.js",
        "rxjs/operators/mergeMapTo": process.cwd() + "/node_modules/rxjs/_esm5/operators/mergeMapTo.js",
        "rxjs/operators/mergeMap": process.cwd() + "/node_modules/rxjs/_esm5/operators/mergeMap.js",
        "rxjs/operators/mergeAll": process.cwd() + "/node_modules/rxjs/_esm5/operators/mergeAll.js",
        "rxjs/operators/merge": process.cwd() + "/node_modules/rxjs/_esm5/operators/merge.js",
        "rxjs/operators/max": process.cwd() + "/node_modules/rxjs/_esm5/operators/max.js",
        "rxjs/operators/materialize": process.cwd() + "/node_modules/rxjs/_esm5/operators/materialize.js",
        "rxjs/operators/mapTo": process.cwd() + "/node_modules/rxjs/_esm5/operators/mapTo.js",
        "rxjs/operators/map": process.cwd() + "/node_modules/rxjs/_esm5/operators/map.js",
        "rxjs/operators/last": process.cwd() + "/node_modules/rxjs/_esm5/operators/last.js",
        "rxjs/operators/isEmpty": process.cwd() + "/node_modules/rxjs/_esm5/operators/isEmpty.js",
        "rxjs/operators/ignoreElements": process.cwd() + "/node_modules/rxjs/_esm5/operators/ignoreElements.js",
        "rxjs/operators/groupBy": process.cwd() + "/node_modules/rxjs/_esm5/operators/groupBy.js",
        "rxjs/operators/first": process.cwd() + "/node_modules/rxjs/_esm5/operators/first.js",
        "rxjs/operators/findIndex": process.cwd() + "/node_modules/rxjs/_esm5/operators/findIndex.js",
        "rxjs/operators/find": process.cwd() + "/node_modules/rxjs/_esm5/operators/find.js",
        "rxjs/operators/finalize": process.cwd() + "/node_modules/rxjs/_esm5/operators/finalize.js",
        "rxjs/operators/filter": process.cwd() + "/node_modules/rxjs/_esm5/operators/filter.js",
        "rxjs/operators/expand": process.cwd() + "/node_modules/rxjs/_esm5/operators/expand.js",
        "rxjs/operators/exhaustMap": process.cwd() + "/node_modules/rxjs/_esm5/operators/exhaustMap.js",
        "rxjs/operators/exhaust": process.cwd() + "/node_modules/rxjs/_esm5/operators/exhaust.js",
        "rxjs/operators/every": process.cwd() + "/node_modules/rxjs/_esm5/operators/every.js",
        "rxjs/operators/elementAt": process.cwd() + "/node_modules/rxjs/_esm5/operators/elementAt.js",
        "rxjs/operators/distinctUntilKeyChanged": process.cwd() + "/node_modules/rxjs/_esm5/operators/distinctUntilKeyChanged.js",
        "rxjs/operators/distinctUntilChanged": process.cwd() + "/node_modules/rxjs/_esm5/operators/distinctUntilChanged.js",
        "rxjs/operators/distinct": process.cwd() + "/node_modules/rxjs/_esm5/operators/distinct.js",
        "rxjs/operators/dematerialize": process.cwd() + "/node_modules/rxjs/_esm5/operators/dematerialize.js",
        "rxjs/operators/delayWhen": process.cwd() + "/node_modules/rxjs/_esm5/operators/delayWhen.js",
        "rxjs/operators/delay": process.cwd() + "/node_modules/rxjs/_esm5/operators/delay.js",
        "rxjs/operators/defaultIfEmpty": process.cwd() + "/node_modules/rxjs/_esm5/operators/defaultIfEmpty.js",
        "rxjs/operators/debounceTime": process.cwd() + "/node_modules/rxjs/_esm5/operators/debounceTime.js",
        "rxjs/operators/debounce": process.cwd() + "/node_modules/rxjs/_esm5/operators/debounce.js",
        "rxjs/operators/count": process.cwd() + "/node_modules/rxjs/_esm5/operators/count.js",
        "rxjs/operators/concatMapTo": process.cwd() + "/node_modules/rxjs/_esm5/operators/concatMapTo.js",
        "rxjs/operators/concatMap": process.cwd() + "/node_modules/rxjs/_esm5/operators/concatMap.js",
        "rxjs/operators/concatAll": process.cwd() + "/node_modules/rxjs/_esm5/operators/concatAll.js",
        "rxjs/operators/concat": process.cwd() + "/node_modules/rxjs/_esm5/operators/concat.js",
        "rxjs/operators/combineLatest": process.cwd() + "/node_modules/rxjs/_esm5/operators/combineLatest.js",
        "rxjs/operators/combineAll": process.cwd() + "/node_modules/rxjs/_esm5/operators/combineAll.js",
        "rxjs/operators/catchError": process.cwd() + "/node_modules/rxjs/_esm5/operators/catchError.js",
        "rxjs/operators/bufferWhen": process.cwd() + "/node_modules/rxjs/_esm5/operators/bufferWhen.js",
        "rxjs/operators/bufferToggle": process.cwd() + "/node_modules/rxjs/_esm5/operators/bufferToggle.js",
        "rxjs/operators/bufferTime": process.cwd() + "/node_modules/rxjs/_esm5/operators/bufferTime.js",
        "rxjs/operators/bufferCount": process.cwd() + "/node_modules/rxjs/_esm5/operators/bufferCount.js",
        "rxjs/operators/buffer": process.cwd() + "/node_modules/rxjs/_esm5/operators/buffer.js",
        "rxjs/operators/auditTime": process.cwd() + "/node_modules/rxjs/_esm5/operators/auditTime.js",
        "rxjs/operators/audit": process.cwd() + "/node_modules/rxjs/_esm5/operators/audit.js",
        "rxjs/operators": process.cwd() + "/node_modules/rxjs/_esm5/operators.js",
        "rxjs/operator/zipAll": process.cwd() + "/node_modules/rxjs/_esm5/operator/zipAll.js",
        "rxjs/operator/zip": process.cwd() + "/node_modules/rxjs/_esm5/operator/zip.js",
        "rxjs/operator/withLatestFrom": process.cwd() + "/node_modules/rxjs/_esm5/operator/withLatestFrom.js",
        "rxjs/operator/windowWhen": process.cwd() + "/node_modules/rxjs/_esm5/operator/windowWhen.js",
        "rxjs/operator/windowToggle": process.cwd() + "/node_modules/rxjs/_esm5/operator/windowToggle.js",
        "rxjs/operator/windowTime": process.cwd() + "/node_modules/rxjs/_esm5/operator/windowTime.js",
        "rxjs/operator/windowCount": process.cwd() + "/node_modules/rxjs/_esm5/operator/windowCount.js",
        "rxjs/operator/window": process.cwd() + "/node_modules/rxjs/_esm5/operator/window.js",
        "rxjs/operator/toPromise": process.cwd() + "/node_modules/rxjs/_esm5/operator/toPromise.js",
        "rxjs/operator/toArray": process.cwd() + "/node_modules/rxjs/_esm5/operator/toArray.js",
        "rxjs/operator/timestamp": process.cwd() + "/node_modules/rxjs/_esm5/operator/timestamp.js",
        "rxjs/operator/timeoutWith": process.cwd() + "/node_modules/rxjs/_esm5/operator/timeoutWith.js",
        "rxjs/operator/timeout": process.cwd() + "/node_modules/rxjs/_esm5/operator/timeout.js",
        "rxjs/operator/timeInterval": process.cwd() + "/node_modules/rxjs/_esm5/operator/timeInterval.js",
        "rxjs/operator/throttleTime": process.cwd() + "/node_modules/rxjs/_esm5/operator/throttleTime.js",
        "rxjs/operator/throttle": process.cwd() + "/node_modules/rxjs/_esm5/operator/throttle.js",
        "rxjs/operator/takeWhile": process.cwd() + "/node_modules/rxjs/_esm5/operator/takeWhile.js",
        "rxjs/operator/takeUntil": process.cwd() + "/node_modules/rxjs/_esm5/operator/takeUntil.js",
        "rxjs/operator/takeLast": process.cwd() + "/node_modules/rxjs/_esm5/operator/takeLast.js",
        "rxjs/operator/take": process.cwd() + "/node_modules/rxjs/_esm5/operator/take.js",
        "rxjs/operator/switchMapTo": process.cwd() + "/node_modules/rxjs/_esm5/operator/switchMapTo.js",
        "rxjs/operator/switchMap": process.cwd() + "/node_modules/rxjs/_esm5/operator/switchMap.js",
        "rxjs/operator/switch": process.cwd() + "/node_modules/rxjs/_esm5/operator/switch.js",
        "rxjs/operator/subscribeOn": process.cwd() + "/node_modules/rxjs/_esm5/operator/subscribeOn.js",
        "rxjs/operator/startWith": process.cwd() + "/node_modules/rxjs/_esm5/operator/startWith.js",
        "rxjs/operator/skipWhile": process.cwd() + "/node_modules/rxjs/_esm5/operator/skipWhile.js",
        "rxjs/operator/skipUntil": process.cwd() + "/node_modules/rxjs/_esm5/operator/skipUntil.js",
        "rxjs/operator/skipLast": process.cwd() + "/node_modules/rxjs/_esm5/operator/skipLast.js",
        "rxjs/operator/skip": process.cwd() + "/node_modules/rxjs/_esm5/operator/skip.js",
        "rxjs/operator/single": process.cwd() + "/node_modules/rxjs/_esm5/operator/single.js",
        "rxjs/operator/shareReplay": process.cwd() + "/node_modules/rxjs/_esm5/operator/shareReplay.js",
        "rxjs/operator/share": process.cwd() + "/node_modules/rxjs/_esm5/operator/share.js",
        "rxjs/operator/sequenceEqual": process.cwd() + "/node_modules/rxjs/_esm5/operator/sequenceEqual.js",
        "rxjs/operator/scan": process.cwd() + "/node_modules/rxjs/_esm5/operator/scan.js",
        "rxjs/operator/sampleTime": process.cwd() + "/node_modules/rxjs/_esm5/operator/sampleTime.js",
        "rxjs/operator/sample": process.cwd() + "/node_modules/rxjs/_esm5/operator/sample.js",
        "rxjs/operator/retryWhen": process.cwd() + "/node_modules/rxjs/_esm5/operator/retryWhen.js",
        "rxjs/operator/retry": process.cwd() + "/node_modules/rxjs/_esm5/operator/retry.js",
        "rxjs/operator/repeatWhen": process.cwd() + "/node_modules/rxjs/_esm5/operator/repeatWhen.js",
        "rxjs/operator/repeat": process.cwd() + "/node_modules/rxjs/_esm5/operator/repeat.js",
        "rxjs/operator/reduce": process.cwd() + "/node_modules/rxjs/_esm5/operator/reduce.js",
        "rxjs/operator/race": process.cwd() + "/node_modules/rxjs/_esm5/operator/race.js",
        "rxjs/operator/publishReplay": process.cwd() + "/node_modules/rxjs/_esm5/operator/publishReplay.js",
        "rxjs/operator/publishLast": process.cwd() + "/node_modules/rxjs/_esm5/operator/publishLast.js",
        "rxjs/operator/publishBehavior": process.cwd() + "/node_modules/rxjs/_esm5/operator/publishBehavior.js",
        "rxjs/operator/publish": process.cwd() + "/node_modules/rxjs/_esm5/operator/publish.js",
        "rxjs/operator/pluck": process.cwd() + "/node_modules/rxjs/_esm5/operator/pluck.js",
        "rxjs/operator/partition": process.cwd() + "/node_modules/rxjs/_esm5/operator/partition.js",
        "rxjs/operator/pairwise": process.cwd() + "/node_modules/rxjs/_esm5/operator/pairwise.js",
        "rxjs/operator/onErrorResumeNext": process.cwd() + "/node_modules/rxjs/_esm5/operator/onErrorResumeNext.js",
        "rxjs/operator/observeOn": process.cwd() + "/node_modules/rxjs/_esm5/operator/observeOn.js",
        "rxjs/operator/multicast": process.cwd() + "/node_modules/rxjs/_esm5/operator/multicast.js",
        "rxjs/operator/min": process.cwd() + "/node_modules/rxjs/_esm5/operator/min.js",
        "rxjs/operator/mergeScan": process.cwd() + "/node_modules/rxjs/_esm5/operator/mergeScan.js",
        "rxjs/operator/mergeMapTo": process.cwd() + "/node_modules/rxjs/_esm5/operator/mergeMapTo.js",
        "rxjs/operator/mergeMap": process.cwd() + "/node_modules/rxjs/_esm5/operator/mergeMap.js",
        "rxjs/operator/mergeAll": process.cwd() + "/node_modules/rxjs/_esm5/operator/mergeAll.js",
        "rxjs/operator/merge": process.cwd() + "/node_modules/rxjs/_esm5/operator/merge.js",
        "rxjs/operator/max": process.cwd() + "/node_modules/rxjs/_esm5/operator/max.js",
        "rxjs/operator/materialize": process.cwd() + "/node_modules/rxjs/_esm5/operator/materialize.js",
        "rxjs/operator/mapTo": process.cwd() + "/node_modules/rxjs/_esm5/operator/mapTo.js",
        "rxjs/operator/map": process.cwd() + "/node_modules/rxjs/_esm5/operator/map.js",
        "rxjs/operator/let": process.cwd() + "/node_modules/rxjs/_esm5/operator/let.js",
        "rxjs/operator/last": process.cwd() + "/node_modules/rxjs/_esm5/operator/last.js",
        "rxjs/operator/isEmpty": process.cwd() + "/node_modules/rxjs/_esm5/operator/isEmpty.js",
        "rxjs/operator/ignoreElements": process.cwd() + "/node_modules/rxjs/_esm5/operator/ignoreElements.js",
        "rxjs/operator/groupBy": process.cwd() + "/node_modules/rxjs/_esm5/operator/groupBy.js",
        "rxjs/operator/first": process.cwd() + "/node_modules/rxjs/_esm5/operator/first.js",
        "rxjs/operator/findIndex": process.cwd() + "/node_modules/rxjs/_esm5/operator/findIndex.js",
        "rxjs/operator/find": process.cwd() + "/node_modules/rxjs/_esm5/operator/find.js",
        "rxjs/operator/finally": process.cwd() + "/node_modules/rxjs/_esm5/operator/finally.js",
        "rxjs/operator/filter": process.cwd() + "/node_modules/rxjs/_esm5/operator/filter.js",
        "rxjs/operator/expand": process.cwd() + "/node_modules/rxjs/_esm5/operator/expand.js",
        "rxjs/operator/exhaustMap": process.cwd() + "/node_modules/rxjs/_esm5/operator/exhaustMap.js",
        "rxjs/operator/exhaust": process.cwd() + "/node_modules/rxjs/_esm5/operator/exhaust.js",
        "rxjs/operator/every": process.cwd() + "/node_modules/rxjs/_esm5/operator/every.js",
        "rxjs/operator/elementAt": process.cwd() + "/node_modules/rxjs/_esm5/operator/elementAt.js",
        "rxjs/operator/do": process.cwd() + "/node_modules/rxjs/_esm5/operator/do.js",
        "rxjs/operator/distinctUntilKeyChanged": process.cwd() + "/node_modules/rxjs/_esm5/operator/distinctUntilKeyChanged.js",
        "rxjs/operator/distinctUntilChanged": process.cwd() + "/node_modules/rxjs/_esm5/operator/distinctUntilChanged.js",
        "rxjs/operator/distinct": process.cwd() + "/node_modules/rxjs/_esm5/operator/distinct.js",
        "rxjs/operator/dematerialize": process.cwd() + "/node_modules/rxjs/_esm5/operator/dematerialize.js",
        "rxjs/operator/delayWhen": process.cwd() + "/node_modules/rxjs/_esm5/operator/delayWhen.js",
        "rxjs/operator/delay": process.cwd() + "/node_modules/rxjs/_esm5/operator/delay.js",
        "rxjs/operator/defaultIfEmpty": process.cwd() + "/node_modules/rxjs/_esm5/operator/defaultIfEmpty.js",
        "rxjs/operator/debounceTime": process.cwd() + "/node_modules/rxjs/_esm5/operator/debounceTime.js",
        "rxjs/operator/debounce": process.cwd() + "/node_modules/rxjs/_esm5/operator/debounce.js",
        "rxjs/operator/count": process.cwd() + "/node_modules/rxjs/_esm5/operator/count.js",
        "rxjs/operator/concatMapTo": process.cwd() + "/node_modules/rxjs/_esm5/operator/concatMapTo.js",
        "rxjs/operator/concatMap": process.cwd() + "/node_modules/rxjs/_esm5/operator/concatMap.js",
        "rxjs/operator/concatAll": process.cwd() + "/node_modules/rxjs/_esm5/operator/concatAll.js",
        "rxjs/operator/concat": process.cwd() + "/node_modules/rxjs/_esm5/operator/concat.js",
        "rxjs/operator/combineLatest": process.cwd() + "/node_modules/rxjs/_esm5/operator/combineLatest.js",
        "rxjs/operator/combineAll": process.cwd() + "/node_modules/rxjs/_esm5/operator/combineAll.js",
        "rxjs/operator/catch": process.cwd() + "/node_modules/rxjs/_esm5/operator/catch.js",
        "rxjs/operator/bufferWhen": process.cwd() + "/node_modules/rxjs/_esm5/operator/bufferWhen.js",
        "rxjs/operator/bufferToggle": process.cwd() + "/node_modules/rxjs/_esm5/operator/bufferToggle.js",
        "rxjs/operator/bufferTime": process.cwd() + "/node_modules/rxjs/_esm5/operator/bufferTime.js",
        "rxjs/operator/bufferCount": process.cwd() + "/node_modules/rxjs/_esm5/operator/bufferCount.js",
        "rxjs/operator/buffer": process.cwd() + "/node_modules/rxjs/_esm5/operator/buffer.js",
        "rxjs/operator/auditTime": process.cwd() + "/node_modules/rxjs/_esm5/operator/auditTime.js",
        "rxjs/operator/audit": process.cwd() + "/node_modules/rxjs/_esm5/operator/audit.js",
        "rxjs/observable/zip": process.cwd() + "/node_modules/rxjs/_esm5/observable/zip.js",
        "rxjs/observable/using": process.cwd() + "/node_modules/rxjs/_esm5/observable/using.js",
        "rxjs/observable/timer": process.cwd() + "/node_modules/rxjs/_esm5/observable/timer.js",
        "rxjs/observable/throw": process.cwd() + "/node_modules/rxjs/_esm5/observable/throw.js",
        "rxjs/observable/range": process.cwd() + "/node_modules/rxjs/_esm5/observable/range.js",
        "rxjs/observable/race": process.cwd() + "/node_modules/rxjs/_esm5/observable/race.js",
        "rxjs/observable/pairs": process.cwd() + "/node_modules/rxjs/_esm5/observable/pairs.js",
        "rxjs/observable/onErrorResumeNext": process.cwd() + "/node_modules/rxjs/_esm5/observable/onErrorResumeNext.js",
        "rxjs/observable/of": process.cwd() + "/node_modules/rxjs/_esm5/observable/of.js",
        "rxjs/observable/never": process.cwd() + "/node_modules/rxjs/_esm5/observable/never.js",
        "rxjs/observable/merge": process.cwd() + "/node_modules/rxjs/_esm5/observable/merge.js",
        "rxjs/observable/interval": process.cwd() + "/node_modules/rxjs/_esm5/observable/interval.js",
        "rxjs/observable/if": process.cwd() + "/node_modules/rxjs/_esm5/observable/if.js",
        "rxjs/observable/generate": process.cwd() + "/node_modules/rxjs/_esm5/observable/generate.js",
        "rxjs/observable/fromPromise": process.cwd() + "/node_modules/rxjs/_esm5/observable/fromPromise.js",
        "rxjs/observable/fromEventPattern": process.cwd() + "/node_modules/rxjs/_esm5/observable/fromEventPattern.js",
        "rxjs/observable/fromEvent": process.cwd() + "/node_modules/rxjs/_esm5/observable/fromEvent.js",
        "rxjs/observable/from": process.cwd() + "/node_modules/rxjs/_esm5/observable/from.js",
        "rxjs/observable/forkJoin": process.cwd() + "/node_modules/rxjs/_esm5/observable/forkJoin.js",
        "rxjs/observable/empty": process.cwd() + "/node_modules/rxjs/_esm5/observable/empty.js",
        "rxjs/observable/dom/webSocket": process.cwd() + "/node_modules/rxjs/_esm5/observable/dom/webSocket.js",
        "rxjs/observable/dom/ajax": process.cwd() + "/node_modules/rxjs/_esm5/observable/dom/ajax.js",
        "rxjs/observable/dom/WebSocketSubject": process.cwd() + "/node_modules/rxjs/_esm5/observable/dom/WebSocketSubject.js",
        "rxjs/observable/dom/AjaxObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/dom/AjaxObservable.js",
        "rxjs/observable/defer": process.cwd() + "/node_modules/rxjs/_esm5/observable/defer.js",
        "rxjs/observable/concat": process.cwd() + "/node_modules/rxjs/_esm5/observable/concat.js",
        "rxjs/observable/combineLatest": process.cwd() + "/node_modules/rxjs/_esm5/observable/combineLatest.js",
        "rxjs/observable/bindNodeCallback": process.cwd() + "/node_modules/rxjs/_esm5/observable/bindNodeCallback.js",
        "rxjs/observable/bindCallback": process.cwd() + "/node_modules/rxjs/_esm5/observable/bindCallback.js",
        "rxjs/observable/UsingObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/UsingObservable.js",
        "rxjs/observable/TimerObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/TimerObservable.js",
        "rxjs/observable/SubscribeOnObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/SubscribeOnObservable.js",
        "rxjs/observable/ScalarObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/ScalarObservable.js",
        "rxjs/observable/RangeObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/RangeObservable.js",
        "rxjs/observable/PromiseObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/PromiseObservable.js",
        "rxjs/observable/PairsObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/PairsObservable.js",
        "rxjs/observable/NeverObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/NeverObservable.js",
        "rxjs/observable/IteratorObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/IteratorObservable.js",
        "rxjs/observable/IntervalObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/IntervalObservable.js",
        "rxjs/observable/IfObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/IfObservable.js",
        "rxjs/observable/GenerateObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/GenerateObservable.js",
        "rxjs/observable/FromObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/FromObservable.js",
        "rxjs/observable/FromEventPatternObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/FromEventPatternObservable.js",
        "rxjs/observable/FromEventObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/FromEventObservable.js",
        "rxjs/observable/ForkJoinObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/ForkJoinObservable.js",
        "rxjs/observable/ErrorObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/ErrorObservable.js",
        "rxjs/observable/EmptyObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/EmptyObservable.js",
        "rxjs/observable/DeferObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/DeferObservable.js",
        "rxjs/observable/ConnectableObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/ConnectableObservable.js",
        "rxjs/observable/BoundNodeCallbackObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/BoundNodeCallbackObservable.js",
        "rxjs/observable/BoundCallbackObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/BoundCallbackObservable.js",
        "rxjs/observable/ArrayObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/ArrayObservable.js",
        "rxjs/observable/ArrayLikeObservable": process.cwd() + "/node_modules/rxjs/_esm5/observable/ArrayLikeObservable.js",
        "rxjs/interfaces": process.cwd() + "/node_modules/rxjs/_esm5/interfaces.js",
        "rxjs/add/operator/zipAll": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/zipAll.js",
        "rxjs/add/operator/zip": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/zip.js",
        "rxjs/add/operator/withLatestFrom": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/withLatestFrom.js",
        "rxjs/add/operator/windowWhen": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/windowWhen.js",
        "rxjs/add/operator/windowToggle": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/windowToggle.js",
        "rxjs/add/operator/windowTime": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/windowTime.js",
        "rxjs/add/operator/windowCount": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/windowCount.js",
        "rxjs/add/operator/window": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/window.js",
        "rxjs/add/operator/toPromise": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/toPromise.js",
        "rxjs/add/operator/toArray": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/toArray.js",
        "rxjs/add/operator/timestamp": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/timestamp.js",
        "rxjs/add/operator/timeoutWith": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/timeoutWith.js",
        "rxjs/add/operator/timeout": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/timeout.js",
        "rxjs/add/operator/timeInterval": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/timeInterval.js",
        "rxjs/add/operator/throttleTime": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/throttleTime.js",
        "rxjs/add/operator/throttle": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/throttle.js",
        "rxjs/add/operator/takeWhile": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/takeWhile.js",
        "rxjs/add/operator/takeUntil": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/takeUntil.js",
        "rxjs/add/operator/takeLast": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/takeLast.js",
        "rxjs/add/operator/take": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/take.js",
        "rxjs/add/operator/switchMapTo": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/switchMapTo.js",
        "rxjs/add/operator/switchMap": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/switchMap.js",
        "rxjs/add/operator/switch": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/switch.js",
        "rxjs/add/operator/subscribeOn": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/subscribeOn.js",
        "rxjs/add/operator/startWith": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/startWith.js",
        "rxjs/add/operator/skipWhile": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/skipWhile.js",
        "rxjs/add/operator/skipUntil": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/skipUntil.js",
        "rxjs/add/operator/skipLast": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/skipLast.js",
        "rxjs/add/operator/skip": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/skip.js",
        "rxjs/add/operator/single": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/single.js",
        "rxjs/add/operator/shareReplay": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/shareReplay.js",
        "rxjs/add/operator/share": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/share.js",
        "rxjs/add/operator/sequenceEqual": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/sequenceEqual.js",
        "rxjs/add/operator/scan": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/scan.js",
        "rxjs/add/operator/sampleTime": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/sampleTime.js",
        "rxjs/add/operator/sample": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/sample.js",
        "rxjs/add/operator/retryWhen": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/retryWhen.js",
        "rxjs/add/operator/retry": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/retry.js",
        "rxjs/add/operator/repeatWhen": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/repeatWhen.js",
        "rxjs/add/operator/repeat": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/repeat.js",
        "rxjs/add/operator/reduce": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/reduce.js",
        "rxjs/add/operator/race": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/race.js",
        "rxjs/add/operator/publishReplay": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/publishReplay.js",
        "rxjs/add/operator/publishLast": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/publishLast.js",
        "rxjs/add/operator/publishBehavior": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/publishBehavior.js",
        "rxjs/add/operator/publish": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/publish.js",
        "rxjs/add/operator/pluck": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/pluck.js",
        "rxjs/add/operator/partition": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/partition.js",
        "rxjs/add/operator/pairwise": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/pairwise.js",
        "rxjs/add/operator/onErrorResumeNext": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/onErrorResumeNext.js",
        "rxjs/add/operator/observeOn": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/observeOn.js",
        "rxjs/add/operator/multicast": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/multicast.js",
        "rxjs/add/operator/min": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/min.js",
        "rxjs/add/operator/mergeScan": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/mergeScan.js",
        "rxjs/add/operator/mergeMapTo": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/mergeMapTo.js",
        "rxjs/add/operator/mergeMap": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/mergeMap.js",
        "rxjs/add/operator/mergeAll": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/mergeAll.js",
        "rxjs/add/operator/merge": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/merge.js",
        "rxjs/add/operator/max": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/max.js",
        "rxjs/add/operator/materialize": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/materialize.js",
        "rxjs/add/operator/mapTo": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/mapTo.js",
        "rxjs/add/operator/map": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/map.js",
        "rxjs/add/operator/let": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/let.js",
        "rxjs/add/operator/last": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/last.js",
        "rxjs/add/operator/isEmpty": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/isEmpty.js",
        "rxjs/add/operator/ignoreElements": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/ignoreElements.js",
        "rxjs/add/operator/groupBy": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/groupBy.js",
        "rxjs/add/operator/first": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/first.js",
        "rxjs/add/operator/findIndex": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/findIndex.js",
        "rxjs/add/operator/find": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/find.js",
        "rxjs/add/operator/finally": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/finally.js",
        "rxjs/add/operator/filter": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/filter.js",
        "rxjs/add/operator/expand": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/expand.js",
        "rxjs/add/operator/exhaustMap": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/exhaustMap.js",
        "rxjs/add/operator/exhaust": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/exhaust.js",
        "rxjs/add/operator/every": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/every.js",
        "rxjs/add/operator/elementAt": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/elementAt.js",
        "rxjs/add/operator/do": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/do.js",
        "rxjs/add/operator/distinctUntilKeyChanged": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/distinctUntilKeyChanged.js",
        "rxjs/add/operator/distinctUntilChanged": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/distinctUntilChanged.js",
        "rxjs/add/operator/distinct": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/distinct.js",
        "rxjs/add/operator/dematerialize": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/dematerialize.js",
        "rxjs/add/operator/delayWhen": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/delayWhen.js",
        "rxjs/add/operator/delay": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/delay.js",
        "rxjs/add/operator/defaultIfEmpty": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/defaultIfEmpty.js",
        "rxjs/add/operator/debounceTime": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/debounceTime.js",
        "rxjs/add/operator/debounce": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/debounce.js",
        "rxjs/add/operator/count": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/count.js",
        "rxjs/add/operator/concatMapTo": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/concatMapTo.js",
        "rxjs/add/operator/concatMap": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/concatMap.js",
        "rxjs/add/operator/concatAll": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/concatAll.js",
        "rxjs/add/operator/concat": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/concat.js",
        "rxjs/add/operator/combineLatest": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/combineLatest.js",
        "rxjs/add/operator/combineAll": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/combineAll.js",
        "rxjs/add/operator/catch": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/catch.js",
        "rxjs/add/operator/bufferWhen": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/bufferWhen.js",
        "rxjs/add/operator/bufferToggle": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/bufferToggle.js",
        "rxjs/add/operator/bufferTime": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/bufferTime.js",
        "rxjs/add/operator/bufferCount": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/bufferCount.js",
        "rxjs/add/operator/buffer": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/buffer.js",
        "rxjs/add/operator/auditTime": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/auditTime.js",
        "rxjs/add/operator/audit": process.cwd() + "/node_modules/rxjs/_esm5/add/operator/audit.js",
        "rxjs/add/observable/zip": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/zip.js",
        "rxjs/add/observable/using": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/using.js",
        "rxjs/add/observable/timer": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/timer.js",
        "rxjs/add/observable/throw": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/throw.js",
        "rxjs/add/observable/range": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/range.js",
        "rxjs/add/observable/race": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/race.js",
        "rxjs/add/observable/pairs": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/pairs.js",
        "rxjs/add/observable/onErrorResumeNext": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/onErrorResumeNext.js",
        "rxjs/add/observable/of": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/of.js",
        "rxjs/add/observable/never": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/never.js",
        "rxjs/add/observable/merge": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/merge.js",
        "rxjs/add/observable/interval": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/interval.js",
        "rxjs/add/observable/if": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/if.js",
        "rxjs/add/observable/generate": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/generate.js",
        "rxjs/add/observable/fromPromise": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/fromPromise.js",
        "rxjs/add/observable/fromEventPattern": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/fromEventPattern.js",
        "rxjs/add/observable/fromEvent": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/fromEvent.js",
        "rxjs/add/observable/from": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/from.js",
        "rxjs/add/observable/forkJoin": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/forkJoin.js",
        "rxjs/add/observable/empty": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/empty.js",
        "rxjs/add/observable/dom/webSocket": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/dom/webSocket.js",
        "rxjs/add/observable/dom/ajax": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/dom/ajax.js",
        "rxjs/add/observable/defer": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/defer.js",
        "rxjs/add/observable/concat": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/concat.js",
        "rxjs/add/observable/combineLatest": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/combineLatest.js",
        "rxjs/add/observable/bindNodeCallback": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/bindNodeCallback.js",
        "rxjs/add/observable/bindCallback": process.cwd() + "/node_modules/rxjs/_esm5/add/observable/bindCallback.js",
        "rxjs/Subscription": process.cwd() + "/node_modules/rxjs/_esm5/Subscription.js",
        "rxjs/Subscriber": process.cwd() + "/node_modules/rxjs/_esm5/Subscriber.js",
        "rxjs/SubjectSubscription": process.cwd() + "/node_modules/rxjs/_esm5/SubjectSubscription.js",
        "rxjs/Subject": process.cwd() + "/node_modules/rxjs/_esm5/Subject.js",
        "rxjs/Scheduler": process.cwd() + "/node_modules/rxjs/_esm5/Scheduler.js",
        "rxjs/Rx": process.cwd() + "/node_modules/rxjs/_esm5/Rx.js",
        "rxjs/ReplaySubject": process.cwd() + "/node_modules/rxjs/_esm5/ReplaySubject.js",
        "rxjs/OuterSubscriber": process.cwd() + "/node_modules/rxjs/_esm5/OuterSubscriber.js",
        "rxjs/Operator": process.cwd() + "/node_modules/rxjs/_esm5/Operator.js",
        "rxjs/Observer": process.cwd() + "/node_modules/rxjs/_esm5/Observer.js",
        "rxjs/Observable": process.cwd() + "/node_modules/rxjs/_esm5/Observable.js",
        "rxjs/Notification": process.cwd() + "/node_modules/rxjs/_esm5/Notification.js",
        "rxjs/InnerSubscriber": process.cwd() + "/node_modules/rxjs/_esm5/InnerSubscriber.js",
        "rxjs/BehaviorSubject": process.cwd() + "/node_modules/rxjs/_esm5/BehaviorSubject.js",
        "rxjs/AsyncSubject": process.cwd() + "/node_modules/rxjs/_esm5/AsyncSubject.js"
      },
      "mainFields": [
        "browser",
        "module",
        "main"
      ]
    },
    "resolveLoader": {
      "modules": [
        "./node_modules",
        "./node_modules"
      ]
    },
    "entry": {
      "main": [
        "./src/main.ts"
      ],
      "polyfills": [
        "./src/polyfills.ts"
      ],
      "styles": [
        "./src/styles.css"
      ]
    },
    "output": {
      "path": path.join(process.cwd(), "dist"),
      "filename": "[name].bundle.js",
      "chunkFilename": "[id].chunk.js",
      "crossOriginLoading": false
    },
    "module": {
      "rules": [
        {
          "test": /\.html$/,
          "loader": "raw-loader"
        },
        {
          "test": /\.(eot|svg|cur)$/,
          "loader": "file-loader",
          "options": {
            "name": "[name].[hash:20].[ext]",
            "limit": 10000
          }
        },
        {
          "test": /\.(jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
          "loader": "url-loader",
          "options": {
            "name": "[name].[hash:20].[ext]",
            "limit": 10000
          }
        },
        {
          "exclude": [
            path.join(process.cwd(), "src/styles.css")
          ],
          "test": /\.css$/,
          "use": [
            "exports-loader?module.exports.toString()",
            {
              "loader": "css-loader",
              "options": {
                "sourceMap": false,
                "importLoaders": 1
              }
            },
            {
              "loader": "postcss-loader",
              "options": {
                "ident": "postcss",
                "plugins": postcssPlugins
              }
            }
          ]
        },
        {
          "exclude": [
            path.join(process.cwd(), "src/styles.css")
          ],
          "test": /\.scss$|\.sass$/,
          "use": [
            "exports-loader?module.exports.toString()",
            {
              "loader": "css-loader",
              "options": {
                "sourceMap": false,
                "importLoaders": 1
              }
            },
            {
              "loader": "postcss-loader",
              "options": {
                "ident": "postcss",
                "plugins": postcssPlugins
              }
            },
            {
              "loader": "sass-loader",
              "options": {
                "sourceMap": false,
                "precision": 8,
                "includePaths": []
              }
            }
          ]
        },
        {
          "exclude": [
            path.join(process.cwd(), "src/styles.css")
          ],
          "test": /\.less$/,
          "use": [
            "exports-loader?module.exports.toString()",
            {
              "loader": "css-loader",
              "options": {
                "sourceMap": false,
                "importLoaders": 1
              }
            },
            {
              "loader": "postcss-loader",
              "options": {
                "ident": "postcss",
                "plugins": postcssPlugins
              }
            },
            {
              "loader": "less-loader",
              "options": {
                "sourceMap": false
              }
            }
          ]
        },
        {
          "exclude": [
            path.join(process.cwd(), "src/styles.css")
          ],
          "test": /\.styl$/,
          "use": [
            "exports-loader?module.exports.toString()",
            {
              "loader": "css-loader",
              "options": {
                "sourceMap": false,
                "importLoaders": 1
              }
            },
            {
              "loader": "postcss-loader",
              "options": {
                "ident": "postcss",
                "plugins": postcssPlugins
              }
            },
            {
              "loader": "stylus-loader",
              "options": {
                "sourceMap": false,
                "paths": []
              }
            }
          ]
        },
        {
          "include": [
            path.join(process.cwd(), "src/styles.css")
          ],
          "test": /\.css$/,
          "use": [
            "style-loader",
            {
              "loader": "css-loader",
              "options": {
                "sourceMap": false,
                "importLoaders": 1
              }
            },
            {
              "loader": "postcss-loader",
              "options": {
                "ident": "postcss",
                "plugins": postcssPlugins
              }
            }
          ]
        },
        {
          "include": [
            path.join(process.cwd(), "src/styles.css")
          ],
          "test": /\.scss$|\.sass$/,
          "use": [
            "style-loader",
            {
              "loader": "css-loader",
              "options": {
                "sourceMap": false,
                "importLoaders": 1
              }
            },
            {
              "loader": "postcss-loader",
              "options": {
                "ident": "postcss",
                "plugins": postcssPlugins
              }
            },
            {
              "loader": "sass-loader",
              "options": {
                "sourceMap": false,
                "precision": 8,
                "includePaths": []
              }
            }
          ]
        },
        {
          "include": [
            path.join(process.cwd(), "src/styles.css")
          ],
          "test": /\.less$/,
          "use": [
            "style-loader",
            {
              "loader": "css-loader",
              "options": {
                "sourceMap": false,
                "importLoaders": 1
              }
            },
            {
              "loader": "postcss-loader",
              "options": {
                "ident": "postcss",
                "plugins": postcssPlugins
              }
            },
            {
              "loader": "less-loader",
              "options": {
                "sourceMap": false
              }
            }
          ]
        },
        {
          "include": [
            path.join(process.cwd(), "src/styles.css")
          ],
          "test": /\.styl$/,
          "use": [
            "style-loader",
            {
              "loader": "css-loader",
              "options": {
                "sourceMap": false,
                "importLoaders": 1
              }
            },
            {
              "loader": "postcss-loader",
              "options": {
                "ident": "postcss",
                "plugins": postcssPlugins
              }
            },
            {
              "loader": "stylus-loader",
              "options": {
                "sourceMap": false,
                "paths": []
              }
            }
          ]
        },
        {
          "test": /\.ts$/,
          "loader": "@ngtools/webpack"
        }
      ]
    },
    "plugins": [
      new NoEmitOnErrorsPlugin(),
      new CopyWebpackPlugin([
        {
          "context": "src",
          "to": "",
          "from": {
            "glob": "assets/**/*",
            "dot": true
          }
        },
        {
          "context": "src",
          "to": "",
          "from": {
            "glob": "favicon.ico",
            "dot": true
          }
        }
      ], {
        "ignore": [
          ".gitkeep"
        ],
        "debug": "warning"
      }),
      new ProgressPlugin(),
      new CircularDependencyPlugin({
        "exclude": /(\\|\/)node_modules(\\|\/)/,
        "failOnError": false
      }),
      new NamedLazyChunksWebpackPlugin(),
      new HtmlWebpackPlugin({
        "template": "./src/index.html",
        "filename": "./index.html",
        "hash": false,
        "inject": true,
        "compile": true,
        "favicon": false,
        "minify": false,
        "cache": true,
        "showErrors": true,
        "chunks": "all",
        "excludeChunks": [],
        "title": "Webpack App",
        "xhtml": true,
        "chunksSortMode": function sort(left, right) {
          let leftIndex = entryPoints.indexOf(left.names[0]);
          let rightindex = entryPoints.indexOf(right.names[0]);
          if (leftIndex > rightindex) {
              return 1;
          }
          else if (leftIndex < rightindex) {
              return -1;
          }
          else {
              return 0;
          }
      }
      }),
      new BaseHrefWebpackPlugin({}),
      new CommonsChunkPlugin({
        "name": [
          "inline"
        ],
        "minChunks": null
      }),
      new CommonsChunkPlugin({
        "name": [
          "vendor"
        ],
        "minChunks": (module) => {
                  return module.resource
                      && (module.resource.startsWith(nodeModules)
                          || module.resource.startsWith(genDirNodeModules)
                          || module.resource.startsWith(realNodeModules));
              },
        "chunks": [
          "main"
        ]
      }),
      new SourceMapDevToolPlugin({
        "filename": "[file].map[query]",
        "moduleFilenameTemplate": "[resource-path]",
        "fallbackModuleFilenameTemplate": "[resource-path]?[hash]",
        "sourceRoot": "webpack:///"
      }),
      new CommonsChunkPlugin({
        "name": [
          "main"
        ],
        "minChunks": 2,
        "async": "common"
      }),
      new NamedModulesPlugin({}),
      new AngularCompilerPlugin({
        "mainPath": "main.ts",
        "platform": 0,
        "hostReplacementPaths": {
          "environments/environment.ts": "environments/environment.ts"
        },
        "sourceMap": true,
        "tsConfigPath": "src/tsconfig.app.json",
        "skipCodeGeneration": true,
        "compilerOptions": {}
      })
    ],
    "node": {
      __dirname: false,
      __filename: false,
      "fs": "empty",
      "global": true,
      "crypto": "empty",
      "tls": "empty",
      "net": "empty",
      "process": true,
      "module": false,
      "clearImmediate": false,
      "setImmediate": false
    },
    "devServer": {
      "historyApiFallback": true
    }
  }
];
