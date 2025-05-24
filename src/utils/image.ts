import { toast } from "./toast"

export type ErrorType = {
    errCode?: string | number
    errMsg?: string
    msg?: string
}
export type RectType = {
    width: number
    height: number
}
/**
 * @desc 获取本地文件路径
 * @param path { string }
 * @return: { string }
 */
export function getLocalFilePath(path: string): string {
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

/**
 * @desc base64 去除前缀
 * @param base64Str { string }
 * @return: {string}
 */
function dataUrlToBase64(base64Str: string): string {
	var array = base64Str.split(',')
	return array[array.length - 1]
}

var index = 0

function getNewFileId(): string {
	return Date.now() + String(index++)
}

function biggerThan(v1: string, v2: string) {
	var v1Array: string[] = v1.split('.')
	var v2Array: string[] = v2.split('.')
	var update = false
	for (var index = 0; index < v2Array.length; index++) {
		var diff = (+v1Array[index]) - (+v2Array[index])
		if (diff !== 0) {
			update = diff > 0
			break
		}
	}
	return update
}

/**
 * chooseImage 选择图片并加工为base64;
 * 	count: 一次性选择数量
 * 	type: 选择图片方式
 * 	extension: H5上上传图片格式
 *  width: 支付宝小程序canvas 宽度, 不指定默认设备宽度(windowWidth)
 * 	height: 支付宝小程序canvas 高度, 不指定默认380px (不指定可能导致图片变形)
 */
export type ChooseImageOption = {
    /** @desc 上传数量 **/
    count?: number
    /** @desc 打开相机方式 1: 相机， 2: 相册， 3:全部 **/
    sourceType?: 1 | 2 | 3
    /** @desc 固定不变 **/
    fileType?: "image" | "video" | "audio",
    /** @desc 文件后缀限制 **/
    extension?: string[],
	showToast?: boolean
}
export type ChooseImageAlipayResult = {
    /** @desc 图片文件路径 **/
    apFilePathsV2?: string[]
    /** @desc 图片文件路径 **/
    apFilePaths: string
    /** @desc 图片文件路径 Android使用 **/
    tempFilePaths: string
    /** @desc 图片多媒体LocalId iOS使用 **/
    localIds?: string
    /** @desc 是否返回成功 **/
    success?: boolean
    /** @desc 错误码 **/
    errorCode?: string
    tempFiles?: File[]
}

/**
 * @desc 选取文件 （  用于 支付宝公众号 ｜ uniapp ）
 * @param params { ChooseImageOption }
 * @return: { Promise<string[]> }
 */
export function chooseImage (params: ChooseImageOption ): Promise<string[]> {
	let {
		count = 1,
		sourceType = 1,
		fileType= "image",
		extension,
		showToast = false
	} = params || {};
	return new Promise(async (resolve) => {
		extension = extension || ["png", "PNG", "JPG", "jpg", "jpeg"];
        // @ts-ignore
		if (window && window.AlipayJSBridge) {
            // @ts-ignore
			await AlipayJSBridge.call(
				'chooseImage',
				{
					count: count,
					// 如果只需要拍照，可以只传['camera']
					sourceType: sourceType == 2 ? ["album"] : sourceType == 3 ? ["camera"] : ["album", "camera"],
				},
				async function (chooseImageRes: ChooseImageAlipayResult) {
					const _apFilePath: string = chooseImageRes.apFilePaths || chooseImageRes.tempFilePaths;
                    let apFilePath: string[] = [];
					if (typeof _apFilePath === 'string') {
						try {
							apFilePath = JSON.parse(_apFilePath);
						} catch (e) {}
					}
                    apFilePath = apFilePath.length ? apFilePath : chooseImageRes.apFilePathsV2 || []
					if (!apFilePath.length) {
						return resolve([]);
					}
					if(fileType == "image"){
						let fIndex = (chooseImageRes.tempFiles || []).findIndex(item => {
							var type = item.type;
                            const checkType = (extension || []).map(item => "image/" + item).find(item => item == type)
							if (type && !checkType) {
								return item;
							}
						})
						if(fIndex >= 0){
							toast('选择的文件格式不正确,请重新选择!')
							return resolve([])
						}
					}
					resolve(apFilePath);
				}
			)
		} else {
            if(!uni || !uni.chooseImage) return resolve([]);
			uni.chooseImage({
				count: count,
				// #ifdef H5
				extension: extension,
				// #endif
				sourceType: sourceType == 2
					? ["album"]
					: sourceType == 3
						? ["camera"]
						: ["album", "camera"]
				,
				sizeType: ['compressed'],
				success: (chooseImageRes: UniApp.ChooseImageSuccessCallbackResult) => {
					let apFilePath: string[] = chooseImageRes.tempFilePaths as string[];
                    try {
                        if(typeof apFilePath == "string") apFilePath = JSON.parse(apFilePath);
                    } catch (error) {
                        apFilePath = []
                    }
					resolve(apFilePath);
				},
				fail(err) {
					if(showToast) toast(err && err.errMsg || '上传失败!');
					resolve([]);
				}
			});
		}
	})
}

/**
 * @desc 获取图片信息 （  用于 uniapp ｜ 微信公众号 ）
 * @param params { ChooseImageOption }
 * @return: { Promise<string[]> }
 */
export function getImageInfo (url: string): Promise<UniApp.GetImageInfoSuccessData | ErrorType> {
    const env = uni || wx;
    if (!env || !env.getImageInfo) return Promise.resolve({ msg: "当前环境暂不支持！" })
    return new Promise((resolve) => {
        env.getImageInfo({
            src: url,
            success: (res: UniApp.GetImageInfoSuccessData) => {
                resolve(res);
            },
            fail: (err : ErrorType) => {
                resolve(err);
            }
        })
    })
}

type CanvasElement = {
    width: number
    height: number
    getContext: (id?: string) => UniApp.CanvasContext
    toDataURL: (id?: string) => string
}
type Path2Base64Result = {
    base64?: string
	file?: string
	info?: RectType | WechatMiniprogram.ReadFileSuccessCallbackResult
    err?: ErrorType
}
/**
 * @desc 文件路径转换base64
 * @param path { string }
 * @param info { string }
 * @param path { string }
 * @return: { Promise<string[]> }
 */
export async function pathToBase64 (
    path: string, info?: RectType, width?: number, height?: number): Promise<Path2Base64Result> {
    height = height || 300;
	return new Promise(async function(resolve, reject) {
        // @ts-ignore
		if (window && window.AlipayJSBridge) {
			var image = new Image();
			image.crossOrigin = 'anonymous';
			image.src = path;
			image.onload = await
			function() {
				var canvas: CanvasElement = document.createElement('CANVAS') as unknown as CanvasElement;
				var context = canvas.getContext('2d');
				canvas.height = image.height;
				canvas.width = image.width;
				context.drawImage(image as unknown as string, 0, 0);
				try {
					var dataURL = canvas.toDataURL('image/png');
				    canvas = null as unknown as CanvasElement;
					return resolve({
						base64: dataURL,
						file: path
					});
				} catch (e) {
                    canvas = null as unknown as CanvasElement;
					return resolve({
						base64: "",
						file: path
					});
				}
			}
			return
		}
		if (typeof window === 'object' && 'document' in window) {
			if (typeof FileReader === 'function') {
				var xhr = new XMLHttpRequest()
				xhr.open('GET', path, true)
				xhr.responseType = 'blob'
				xhr.onload = function() {
					if (this.status === 200) {
						let fileReader = new FileReader()
						fileReader.onload = function(e?: any) {
							resolve({
								base64: e.target.result,
								file: path
							});
						}
						fileReader.onerror = reject
						fileReader.readAsDataURL(this.response)
					}
				}
				xhr.onerror = reject
				xhr.send()
				return
			}
			var canvas: CanvasElement = document.createElement('canvas') as unknown as CanvasElement;
			var c2x = canvas.getContext('2d')
			var img = new Image();
			img.src = path;
			img.onload = await
			function() {
				canvas.width = img.width
				canvas.height = img.height
				c2x.drawImage(img as unknown as string, 0, 0)

				resolve({
					base64: canvas.toDataURL(),
					file: path
				});
				canvas.height = canvas.width = 0
			}
			img.onerror = reject
			img.src = path
			canvas = null as unknown as CanvasElement;
			return
		}
		if (typeof plus === 'object') {
			await plus.io.resolveLocalFileSystemURL(getLocalFilePath(path), function(entry: any) {
				entry.file(function(file: any) {
					var fileReader = new plus.io.FileReader()
					fileReader.onload = function(data: any) {
						resolve({
							base64: data.target.result,
							file: path
						});
					}
					fileReader.onerror = function(error) {
						resolve({
							base64: "",
							file: path
						});
					}
					fileReader.readAsDataURL(file)
				}, function(error: ErrorType) {
					resolve({
						base64: "",
						file: path
					});
				})
			}, function(error: ErrorType) {
				resolve({
					base64: "",
					file: path
				});
			})
			return
		}
		if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {
            if(wx && wx.getFileSystemManager){
                // #ifdef MP-WEIXIN
                wx.getFileSystemManager().readFile({
                    filePath: path,
                    encoding: 'base64',
                    success: function(res: WechatMiniprogram.ReadFileSuccessCallbackResult) {
                        resolve({
                            base64: 'data:image/png;base64,' + res.data,
                            file: path,
                            info: res
                        });
                    },
                    fail: function(error: ErrorType) {
                        resolve({
                            base64: "",
                            file: path,
                            err: error
                        });
                    }
                })
                // #endif
                return;
            }
            // @ts-ignore
            if(my && my.createCanvasContext){
                // #ifdef MP-ALIPAY
                // 支付宝小程序端兼容, 需要在页面根组件内添加 以下代码   (750rpx) 这里仅提供一个方法,
                // <view style="position: fixed; top: 0; right: 0; height: 380px; background-color: pink;  left: 0; z-index: -1;"><canvas :style="{width: info.width, height: info.height}" id="canvas"></canvas></view>
                const ctx: any = my.createCanvasContext('canvas');
                if (info && info.width) {
                    let rect = info.width > info.height;
                    let ratio = my.getSystemInfoSync().windowWidth / info.width;
                    let _height = ratio * info.height;
                    ctx.drawImage(
                        path,
                        0,
                        0,
                        info.width,
                        info.height
                    );

                } else {
                    ctx.drawImage(path, 0, 0, width || my.getSystemInfoSync().windowWidth, height);
                }
                ctx.draw(false, () => {
                    ctx.toDataURL({}).then((dataURL: string) => {
                        resolve({
                            base64: dataURL,
                            file: path
                        });
                    }).catch((err : ErrorType) => {
                        resolve({
                            base64: "",
                            file: path,
                            err
                        });
                    })
                })
                // #endif

            }
			return
		}
		resolve({
			base64: "",
			file: path
		});
	})
}

/**
 * @desc Basr64 转换为 path
 * @param param { type }
 * @return:
 */
export function base64ToPath(base64: string): Promise<string | ErrorType> {
	return new Promise(function(resolve, reject) {
		if (typeof window === 'object' && 'document' in window) {
			const base64Arr: string[] = base64.split(',')
			var type = ((base64Arr[0]).match(/:(.*?);/) as string[])[1]
			var str = atob(base64Arr[1])
			var n = str.length
			var array = new Uint8Array(n)
			while (n--) {
				array[n] = str.charCodeAt(n)
			}
			return resolve((window.URL || window.webkitURL).createObjectURL(new Blob([array], {
				type: type
			})))
		}
		var _extName: string[] = base64.split(',')[0].match(/data\:\S+\/(\S+);/) as string[],
            extName = "";
		if (_extName) {
			extName = _extName[1] as string
		} else {
			resolve({msg : "base64 error"})
		}
		var fileName = getNewFileId() + '.' + extName
		if (typeof plus === 'object') {
			var basePath = '_doc'
			var dirPath = 'uniapp_temp'
			var filePath = basePath + '/' + dirPath + '/' + fileName
			if (!biggerThan(
                plus.os.name === 'Android' ? '1.9.9.80627' : '1.9.9.80472',
                plus.runtime.innerVersion as string)
            ) {
				plus.io.resolveLocalFileSystemURL(basePath, function(entry) {
					entry.getDirectory(dirPath, {
						create: true,
						exclusive: false,
					}, function(entry) {
						entry.getFile(fileName, {
							create: true,
							exclusive: false,
						}, function(entry) {
							entry.createWriter(function(writer) {
								writer.onwrite = function() {
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
			var bitmap = new plus.nativeObj.Bitmap(fileName)
			bitmap.loadBase64Data(base64, function() {
				bitmap.save(filePath, {}, function() {
					bitmap.clear()
					resolve(filePath)
				}, function(error) {
					bitmap.clear()
					reject(error)
				})
			}, function(error) {
				bitmap.clear()
				reject(error)
			})
			return
		}
		if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {
			var filePath = wx.env.USER_DATA_PATH + '/' + fileName
			wx.getFileSystemManager().writeFile({
				filePath: filePath,
				data: dataUrlToBase64(base64),
				encoding: 'base64',
				success: function() {
					resolve(filePath)
				},
				fail: function(error) {
					reject(error)
				}
			})
			return
		}
		reject(new Error('not support'))
	})
}

type ChooseVideoOptions = {
    sourceType: 1 | 2 | 3
    maxDuration?: any
    camera?: any
    compressed?: boolean,
	showToast?: boolean
}
/**
 * @desc 选择视频
 * @param options { ChooseVideoOptions }
 * @return: { Promise<string[]> }
 */
export function chooseVideo(options?: ChooseVideoOptions): Promise<string[]> {
    let {sourceType = 1, maxDuration, camera, compressed, showToast = false} = options || {};
    if(!uni || !uni.chooseVideo) return Promise.resolve([])
	return new Promise((resolve) => {
		uni.chooseVideo({
			sourceType: sourceType == 2 ? ["album"] : sourceType == 3 ? ["camera"] : ["album", "camera"],
			maxDuration,
			camera,
			compressed,
			success (res) {
				resolve([res.tempFilePath])
			},
			fail(err) {
				resolve([])
				if(showToast) toast(err && err.errMsg || '上传失败!');
			}
		});
	})
}
type ChooseFileOptions = {
    count?: number
    extension?: string[]
    type?: any,
    sourceType?: 1 | 2 | 3,
	showToast?: boolean
}
/**
 * @desc 选择视频
 * @param param { type }
 * @return:
 */
export function chooseOtherFile(options?: ChooseFileOptions): Promise<string[]> {
    let { count = 1, extension, type = "all", sourceType, showToast = false } = options || {};
	extension = extension || ['.csv', '.xlsx']
	return new Promise((resolve) => {
		const params = {
			count,
			type,
			sourceType: sourceType == 2 ? ["album"] : sourceType == 3 ? ["camera"] : ["album", "camera"],
			extension: extension,
			fail: (err: ErrorType) => {
				if(showToast) toast(err && err.errMsg || "上传失败!")
				resolve([])
			}
		}
        if(wx && wx.chooseMessageFile){
            // #ifdef MP-WEIXIN || MP-QQ
            wx.chooseMessageFile({
                ... params,
                success (res: WechatMiniprogram.ChooseMessageFileSuccessCallbackResult) {
                    resolve(
                        // @ts-ignore
                        (res && res.tempFilePaths) ||
                        (res && res.tempFiles && res.tempFiles[0] ? [res.tempFiles[0].path] : [])
                    )
                }
            })
            // #endif
            return
        }
        // @ts-ignore
        if(uni && uni.chooseFile) {
            // #ifdef H5
            uni.chooseFile({
                ... params,
                success: function (res) {
                    resolve(res.tempFilePaths ? (typeof res.tempFilePaths == "string" ? [res.tempFilePaths] : res.tempFilePaths)  : [])
                }
            });
            return ;
            // #endif
        }
		// #ifdef MP-ALIPAY || APP
		toast("请在「APP」内进行操作, 未安装请先前往下载!");
		resolve([])
		// #endif
	})
}
