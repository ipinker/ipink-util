/**
 * ImageUtils
 * @Author: Gavin New
 * @Create: 23/07/05 16:49:01
 */

import {isMaxVersion} from "./is";
import {Fail, window} from "./types/Common";
import {FileInfo} from "./types/File";
import {CanvasContext, CanvasElement, UniElement} from "./types/Element";

export type TempFile = {
    tempFilePaths: string[],
    tempFiles?: File[] | object[]
};

export type ApTempFile = {
    apFilePaths?: string[],
    apFilePathsV2?: string[]
} & TempFile;

export type SuccessFileOptions = {
    file?: { errMsg?: string, file?: string | File, base64?: string },
    info?: FileInfo,
    local?: string[] | string,
    base64?: string
} & Fail;


function getLocalFilePath(path: string): string {
    if (path.indexOf('_www') === 0 || path.indexOf('_doc') === 0 || path.indexOf('_documents') === 0 || path.indexOf(
        '_downloads') === 0) {
        return path
    }
    if (path.indexOf('file://') === 0) {
        return path
    }
    if (path.indexOf('/storage/emulated/0/') === 0) {
        return path
    }
    if (path.indexOf('/') === 0) {
        var localFilePath = plus.io.convertAbsoluteFileSystem(path)
        if (localFilePath !== path) {
            return localFilePath
        } else {
            path = path.substr(1)
        }
    }
    return '_www/' + path
}

function dataUrlToBase64(str: string): string {
    var array = str.split(',')
    return array[array.length - 1]
}

let index = 0

function getNewFileId() {
    return Date.now() + String(index++)
}

/**
 * chooseImage 选择图片并加工为base64;
 *    count: 一次性选择数量
 *    type: 选择图片方式
 *    extension: H5上上传图片格式
 *  width: 支付宝小程序canvas 宽度, 不指定默认设备宽度(windowWidth)
 *    height: 支付宝小程序canvas 高度, 不指定默认380px (不指定可能导致图片变形)
 */
export const chooseImage = async (count: number = 1, type: number = 1, extension: string[], width: number, height: number) => {
    extension = extension || ["png", "PNG", "JPG", "jpg", "jpeg", "webp", "bmp"];
    return new Promise(async (reslove) => {
        if (window && window.AlipayJSBridge) {
            await uni.showLoading();
            await window.AlipayJSBridge.call(
                'chooseImage',
                {
                    count: count,
                    // 如果只需要拍照，可以只传['camera']
                    sourceType: type == 2 ? ["album"] : type == 3 ? ["camera"] : ["album", "camera"],
                },
                async (result: ApTempFile) => {
                    let files: string | string[] = result.apFilePaths || result.tempFilePaths || result.apFilePathsV2;
                    if (typeof files === 'string') {
                        try {
                            files = JSON.parse(files);
                        } catch (e) {
                        }
                    }
                    let apFilePath: string[] = files as string[];
                    if (!apFilePath.length) return;
                    let promiseArr = apFilePath.map(async (item: string, index: number): Promise<SuccessFileOptions> => {
                        return await new Promise(async (reso) => {
                            const fileInfo: FileInfo = await getImageInfo(item)
                            const base64Info: SuccessFileOptions = (await pathToBase64(item)) as SuccessFileOptions;
                            const success: SuccessFileOptions = {
                                file: {base64: base64Info?.base64, file: item},
                                info: fileInfo,
                                err: base64Info.err
                            };
                            reso(success);
                        })
                    });
                    try {
                        await Promise.all(promiseArr)
                            .then((file) => {
                                let resultArr = file.map(item => {
                                    return {
                                        file: item.file,
                                        local: item.file && item.file.file || "",
                                        base64: item.file && item.file.base64 || "",
                                        info: item.info || {}
                                    }
                                });
                                reslove(resultArr);
                            })
                            .catch(err => {
                                reslove({
                                    err: {errMsg: err.toString()},
                                    local: apFilePath
                                });
                            });
                        uni.hideLoading();
                    } catch (e: any) {
                        reslove({
                            err: {errMsg: e.toString()}
                        });
                        uni.hideLoading();
                    }
                }
            );
        } else {
            uni.chooseImage({
                count: count,
                // #ifdef H5
                extension: extension,
                // #endif
                sizeType: ['compressed'],
                sourceType: type == 2 ? ["album"] : type == 3 ? ["camera"] : ["album", "camera"],
                success: (img) => {
                    uni.showLoading();
                    Promise.all(
                        (Array.isArray(img.tempFilePaths) && img.tempFilePaths || []).map((item: string, index: number): Promise<SuccessFileOptions> => {
                            return new Promise(async (resolve) => {
                                const fileInfo: FileInfo = await getImageInfo(item);

                                const base64Info: SuccessFileOptions = await pathToBase64(item, fileInfo, width, height) as SuccessFileOptions;
                                const success: SuccessFileOptions = {
                                    file: {base64: base64Info?.base64, file: item},
                                    info: fileInfo,
                                    err: base64Info.err
                                };
                                resolve(success);
                            })
                        })
                    ).then((file) => {
                        let resultArr = file.map(item => {
                            return {
                                file: item.file,
                                local: item.file && item.file.file || "",
                                base64: item.file && item.file.base64 || "",
                                info: item.info || {}
                            }
                        });
                        uni.hideLoading();
                        reslove(resultArr);
                    }).catch(err => {
                        reslove({
                            err: {errMsg: err.toString()},
                            local: img.tempFilePaths,
                        });
                        uni.hideLoading();
                    })
                },
                fail: (e) => {
                    reslove({
                        err: {errMsg: e.toString()},
                    });
                },
                complete() {
                    uni.hideLoading()
                }
            });
        }
    })
}

/* 获取图片基本信息 */
export const getImageInfo = async (url: string, fn?: Function): Promise<FileInfo> => {
    return new Promise((resolve) => {
        uni.getImageInfo({
            src: url,
            success: (res) => {
                resolve({...res, err: null});
            },
            fail: (err: Fail) => {
                fn && fn({err: {...err, errMsg: err.errMsg || JSON.stringify(err)}});
            }
        })
    });
}

/* 路径转 base64 */
export const pathToBase64 = async (path: string, info?: FileInfo, width?: number, height?: number) => {
    return new Promise(async (resolve) => {
        if (window && window.AlipayJSBridge) {
            const image: HTMLImageElement = new Image();
            image.crossOrigin = 'anonymous';
            image.src = path;
            image.onload = await function () {
                // 目前无类型支持
                let canvas: CanvasElement = document.createElement('CANVAS') as CanvasElement;
                if (canvas) {
                    let context: CanvasContext = canvas.getContext('2d') as unknown as CanvasContext;
                    canvas.height = image.height;
                    canvas.width = image.width;
                    context.drawImage(image, 0, 0);
                    try {
                        const dataURL: string = canvas.toDataURL('image/png');
                        resolve({base64: dataURL, err: null});
                    } catch (e: any) {
                        resolve({base64: "", err: {errMsg: e.toString()}});
                    }
                }
            }
            image.onerror = (err) => resolve({err: err})
        } else if (typeof window === 'object' && 'document' in window) {
            if (typeof FileReader === 'function') {
                const xhr = new XMLHttpRequest()
                xhr.open('GET', path, true)
                xhr.responseType = 'blob'
                xhr.onload = function () {
                    if (this.status === 200) {
                        let fileReader = new FileReader()
                        fileReader.onload = (e) => resolve({base64: e.target?.result, err: null});
                        fileReader.onerror = (e) => resolve({err: {errMsg: e.toString()}});
                        fileReader.readAsDataURL(this.response)
                    }
                }
                xhr.onerror = (e) => resolve({err: {errMsg: e.toString()}})
                xhr.send()
                return
            }
            let canvas: CanvasElement = document.createElement('canvas') as CanvasElement;
            if (canvas) {
                let img: HTMLImageElement = new Image();
                const c2x: CanvasContext = canvas.getContext('2d') as unknown as CanvasContext;
                img.src = path;
                img.onload = await function () {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    c2x.drawImage(img, 0, 0);
                    resolve({base64: canvas.toDataURL(), err: null});
                    canvas.height = canvas.width = 0
                }
                img.onerror = (e) => resolve({err: {errMsg: e.toString()}});
            }
            return
        } else if (typeof plus === 'object') {
            await plus.io.resolveLocalFileSystemURL(getLocalFilePath(path), (entry: any) => {
                entry.file((file: PlusIoFile) => {
                    // @ts-ignore
                    const fileReader = new plus.io.FileReader();
                    fileReader.onload = (data: any) => resolve({base64: data?.target?.result, err: null});
                    fileReader.onerror = (error) => resolve({base64: "", err: error});
                    fileReader.readAsDataURL(file)
                }, (error: string | Fail) => resolve({base64: "", err: error}));
            }, (error: string | Fail) => resolve({base64: "", err: error}));
        } else if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {
            wx.getFileSystemManager().readFile({
                filePath: path,
                encoding: 'base64',
                success: (res) => resolve({base64: 'data:image/png;base64,' + res.data, info: res, err: null}),
                fail: (error) => resolve({base64: "", err: error})
            })
        } else {

            // #ifdef MP-ALIPAY
            // 支付宝小程序端兼容, 需要在页面根组件内添加 以下代码   (750rpx) 这里仅提供一个方法,
            // <view style="position: fixed; top: 0; right: 0; height: 380px; background-color: pink;  left: 0; z-index: -1;"><canvas :style="{width: info.width, height: info.height}" id="canvas"></canvas></view>
            const defaultHeight = 380;
            const ctx: CanvasContext = uni.createCanvasContext('canvas') as CanvasContext;
            if (info && info.width) {
                ctx.drawImage(path, 0, 0, info.width, info.height || defaultHeight, 0, 0, info.width, info.height || defaultHeight);
            } else {
                ctx.drawImage(path, 0, 0, width || uni.getSystemInfoSync().windowWidth, height || defaultHeight);
            }
            ctx.draw(false, () => {
                ctx.toDataURL({}).then((dataURL: string) => {
                    resolve({base64: dataURL, err: null});
                }).catch((error: string | Fail) => {
                    resolve({base64: "", err: error});
                })
            });
            return;
            // #endif

            resolve({
                base64: "",
                err: {errMsg: "不支持的调用 !!!"}
            });
        }
    })
}

export const base64ToPath = (base64: string): Promise<string> => {
    let res: Promise<string> = new Promise((resolve, reject) => {
        if (typeof window === 'object' && 'document' in window) {
            const base64Arr: string[] = base64.split(',');
            const reg: RegExp = /:(.*?);/ as RegExp;
            // @ts-ignore
            const type: string = base64Arr[0].match(reg)[1];
            const str: string = atob(base64Arr[1])
            let n = str.length
            let array = new Uint8Array(n)
            while (n--) {
                array[n] = str.charCodeAt(n)
            }
            return resolve((window.URL || window.webkitURL).createObjectURL(new Blob([array], {
                type: type
            })))
        }
        const base64Arr: string[] = base64.split(',');
        // @ts-ignore
        let extName: string = base64Arr[0].match(/data\:\S+\/(\S+);/)[1]
        if (!extName) return reject();
        const fileName = getNewFileId() + '.' + extName
        if (typeof plus === 'object') {
            const basePath = '_doc'
            const dirPath = 'uniapp_temp'
            const filePath = basePath + '/' + dirPath + '/' + fileName
            if (!isMaxVersion(plus.os.name === 'Android' ? '1.9.9.80627' : '1.9.9.80472', <string>plus.runtime
                .innerVersion)) {
                plus.io.resolveLocalFileSystemURL(basePath, function (entry) {
                    entry.getDirectory(dirPath, {
                        create: true,
                        exclusive: false,
                    }, function (entry) {
                        entry.getFile(fileName, {
                            create: true,
                            exclusive: false,
                        }, function (entry) {
                            entry.createWriter(function (writer) {
                                writer.onwrite = function () {
                                    resolve(filePath)
                                }
                                writer.onerror = reject
                                writer.seek(0)
                                writer.writeAsBinary(dataUrlToBase64(base64))
                            }, reject)
                        }, reject)
                    }, reject)
                }, reject)
                return
            }
            // @ts-ignore
            const bitmap = new plus.nativeObj.Bitmap(fileName)
            bitmap.loadBase64Data(base64, () => {
                bitmap.save(filePath, {}, () => {
                    bitmap.clear()
                    resolve(filePath)
                }, (error) => {
                    bitmap.clear()
                    reject(error)
                })
            }, (error) => {
                bitmap.clear()
                reject(error)
            })
            return
        }
        if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {
            const filePath = wx.env.USER_DATA_PATH + '/' + fileName
            wx.getFileSystemManager().writeFile({
                filePath: filePath,
                data: dataUrlToBase64(base64),
                encoding: 'base64',
                success: function () {
                    resolve(filePath)
                },
                fail: function (error) {
                    reject(error)
                }
            })
            return
        }
        reject(new Error('not support'))
    });
    return res.then(res => res).catch(err => "");
}
