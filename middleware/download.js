import request from 'request';
import { write, open } from 'fs';
import EventEmitter from 'events';

class HttpDownloader {
    constructor(url, pathFilesDestination) {
        this.url = new URL(url).toString();
        this.pathFilesDestination = pathFilesDestination;
        this.events = new EventEmitter();
        this.headers = {};
        this.flows = 8;
        this.jar = request.jar();
        this.isDone = false;
        this.isDownloading = false;
        this.isCanceled = false;
        this.downloadedSize = 0;
        this.contentLength = 0;
        this.contentType = null;
        this.segments = [];
        this.minBlock = 10 * 1024;
        this.readTimeout = 3000;
        this.retryTimeout = 500;
        this.errorCount = 0;
        this.writingCount = 0;
    }

    setFlows(n) {
        this.flows = n;
    }

    setMinBlock(minBlock) {
        this.minBlock = minBlock;
    }

    setReadTimeout(timeout) {
        this.readTimeout = timeout;
    }

    setRetryTimeout(timeout) {
        this.retryTimeout = timeout;
    }

    on(event, callback) {
        this.events.on(event, callback);
    }

    setHeader(key, value) {
        this.headers[key] = value;
    }

    getHeaders() {
        return Object.fromEntries(Object.entries(this.headers).map(([key, value]) => [key, value.toString()]));
    }

    getCeilingSegment(point) {
        return this.segments.findIndex((i) => point <= i.start);
    }

    getFloorSegment(point) {
        if (point < 0) return -1;
        const floorIndex = this.segments.findIndex((i) => point < i.start);
        if (floorIndex === -1) {
            return this.segments.length - 1;
        }
        return floorIndex - 1;
    }

    makeRequest(point = 0) {
        const segmentIndex = this.getCeilingSegment(point);
        let newSegment = {
            start: point,
            length: 0,
            running: true,
        };

        if (segmentIndex === -1) {
            this.segments.push(newSegment);
        } else {
            const segment = this.segments[segmentIndex];
            if (segment.start === point) {
                if (segment.running) {
                    return null;
                }
                segment.running = true;
                newSegment = segment;
            } else {
                this.segments.splice(segmentIndex, 0, newSegment);
            }
        }

        const headers = this.getHeaders();
        headers['Range'] = `bytes=${point}-`;
        headers['User-Agent'] =
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36';
        headers['Upgrade-Insecure-Request'] = 1;
        headers['DNT'] = 1;
        const req = request.get({
            uri: this.url,
            headers: headers,
            jar: this.jar,
            followRedirect: true,
            timeout: this.readTimeout,
        },);
        req.isAborted = false;
        req.segment = newSegment;
        req.abort = (function (origin) {
            return function () {
                if (req.isAborted) return;
                req.isAborted = true;
                newSegment.running = false;
                return origin.call(this);
            };
        })(req.abort);
        return (newSegment.req = req);
    }

    allocPoint() {
        let maxIndex;
        let space = -1;
        if (this.segments.length > 1) {
            for (let i = 1; i < this.segments.length; i++) {
                const prevSegment = this.segments[i - 1];
                const currentSegment = this.segments[i];
                const currentSpace = currentSegment.start - prevSegment.start - prevSegment.length;
                if (space < currentSpace) {
                    maxIndex = prevSegment;
                    space = currentSpace;
                }
            }
        }
        const lastSegment = this.segments[this.segments.length - 1];
        const lastSegmentSpace = this.contentLength - lastSegment.start - lastSegment.length;
        if (space < lastSegmentSpace) {
            maxIndex = lastSegment;
            space = lastSegmentSpace;
        }
        if (space <= 0) return null;
        if (!maxIndex.running) {
            return maxIndex.start + maxIndex.length;
        }

        if (space < this.minBlock) return null;
        return maxIndex.start + maxIndex.length + Math.floor(space / 2);
    }

    processStopFlow() {
        this.events.emit('stopFlow');
        if (--this.flows === 0) {
            this.isDone = true;
            if (this.writingCount === 0) {
                if (this.isDownloading && !this.isCanceled) {
                    this.events.emit('done', { mime: this.contentType, size: this.contentLength });
                } else {
                    this.events.emit('stop');
                }
            }
        }
    }

    startFlow(req = null) {
        const refreshTimeout = (() => {
            let timeout = null;
            return () => {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(() => {
                    req.abort();
                }, this.readTimeout);
            };
        })();
        const startNewFlow = () => {
            setTimeout(() => {
                this.startFlow();
            }, this.retryTimeout);
        };
        if (this.isCanceled) {
            return this.processStopFlow();
        }
        if (req === null) {
            const point = this.allocPoint();
            if (!point) return this.processStopFlow();
            req = this.makeRequest(point);
        }
        if (req === null) {
            return startNewFlow();
        }
        req.on('response', (response) => {
            if (response.statusCode !== 206 && response.headers['content-type'] && response.headers['content-length']) {
                this.response.mimetype = response.headers['content-type'];
                this.response.size = response.headers['content-length'];
                this.events.emit('flowError', `The segment received status code ${response.statusCode}`);
                req.abort();
            }
        }).on('complete', () => {
            req.abort();
        }).on('error', (err) => {
            this.events.emit('flowError', err);
            req.abort(true);
        }).on('abort', () => {
            startNewFlow();
        }).on('data', (data) => {
            if (req.isAborted) return;
            if (this.isCanceled) {
                req.abort();
                return;
            }
            refreshTimeout();
            const segmentIndex = this.getFloorSegment(req.segment.start);
            const segment = this.segments[segmentIndex];
            let nextSegmentIndex = segmentIndex + 1;
            let dataSize;
            let isStopFlow = false;
            do {
                if (nextSegmentIndex >= this.segments.length) {
                    dataSize = data.length;
                    break;
                }
                const nextSegment = this.segments[nextSegmentIndex];
                const freeSpace = nextSegment.start - req.segment.start;

                if (freeSpace > data.length) {
                    dataSize = data.length;
                    break;
                }
                if (freeSpace === data.length) {
                    dataSize = data.length;
                    isStopFlow = true;
                    break;
                }

                if (nextSegment.length > 0) {
                    dataSize = freeSpace;
                    isStopFlow = true;
                    break;
                }

                nextSegment.req.abort();
                this.segments.splice(nextSegmentIndex, 1);
            } while (true);

            this.writingCount += 1;
            this.events.emit('data', 0, dataSize, req.segment.start);
            write(this.fileDescriptor, data, 0, dataSize, req.segment.start, () => {
                if (--this.writingCount === 0 && this.isDone) {
                    if (this.isDownloading && !this.isCanceled) {
                        this.events.emit('done', { mime: this.contentType, size: this.contentLength });
                    } else {
                        this.events.emit('stop');
                    }
                }
            });

            req.segment.start += dataSize;
            segment.length += dataSize;
            this.downloadedSize += dataSize;

            if (isStopFlow) {
                req.abort();
            }
        });

        refreshTimeout();
    }

    initFirstFlow(callback) {
        const req = this.makeRequest();
        req.on('response', (response) => {
            if (response.statusCode === 206 && response.headers['content-range'] && response.headers['content-length']) {
                this.contentLength = Number(response.headers['content-length']);
                this.contentType = response.headers['content-type'];
                this.startFlow(req);
                callback(true);
            } else if (response.statusCode === 200) {
                this.contentLength = Number(response.headers['content-length']);
                this.contentType = response.headers['content-type'];
                this.startFlow(req);
                callback(false);
            } else {
                this.events.emit('error', `The server responses code ${response.statusCode}`);
            }
        });
    }

    download() {
        if (this.isDownloading || this.isCanceled) {
            throw new Error('Illegal download state');
        }
        this.isDownloading = true;
        open(this.pathFilesDestination, 'w', (error, fileDescriptor) => {
            if (error) throw error;
            this.fileDescriptor = fileDescriptor;
            this.initFirstFlow((allowMulti) => {
                if (allowMulti) {
                    this.flows = this.flows;
                    for (let i = 1; i < this.flows; i++) {
                        process.nextTick(() => {
                            this.startFlow();
                        });
                    }
                } else {
                    this.flows = 1;
                }
                if (this.flows === 0 && this.writingCount === 0 && this.isDone) {
                    if (this.isDownloading && !this.isCanceled) {
                        this.events.emit('done', { mime: this.contentType, size: this.contentLength });
                    } else {
                        this.events.emit('stop');
                    }
                }
            });
        });
    }

    cancel() {
        if (!this.isDownloading) {
            throw new Error('Illegal cancel state');
        }
        this.isCanceled = true;
        this.segments.forEach((segment) => {
            segment.req.abort();
        });
    }
}

export default HttpDownloader;