import {addHeaderToken, genRequestUrl, IRequestConfigOption} from "./request";
import {
    IErrorResponse, IResponse, IUploadMoreResponse,
    IUploadResponse,
    LoadingType,
    MethodsHeaders,
    RawAxiosRequestHeaders,
    ToastType
} from "./typing";
import {HttpConfig, interceptor, getSdk} from "./config";
import {isArray, isJsonString, isMini, isString, isWxMini} from "./is";
import {allSettled, hasKey} from "./util";
import { toast as selfToast} from "./toast"
import {chooseImage, chooseOtherFile, chooseVideo} from "./image";
import {Storage} from "./cache"

export declare interface IUploadConfigOption extends IRequestConfigOption {
    /**
     * 后段用来接收文件的Key; 单文件
     */
    key?: string,
    /**
     * 临时｜文件路径； 单文件
     */
    file?: string,
    /**
     * 多文件上传文件集合，使用 files 时，file 和 key 不生效。
     */
    files?: string[],
    /**
     * 支付宝小程序必填
     */
    fileType?: "image" | "video" | "audio",
    /**
     * FormData
     */
    formData?: AnyObject,

}

/**
 * 单文件上传
 * @param options { IUploadConfigOption }
 */
export const uploadFile = (options: IUploadConfigOption): Promise<IUploadResponse> => {
	let {
		api,
		prefix = HttpConfig.upload_prefix, // 前缀
		key = HttpConfig.upload_key,
		file,
		fileType = "image",
		formData,
		header,
		isLoading,
		showLoading = isLoading,
        closeLoading = HttpConfig.closeLoading,
        loading = HttpConfig.loading,
		loadingText,
        isToast ,
		showToast = isToast,
		toastText ,
        toast = HttpConfig.toast,
	} = options || {};
	const reqUrl = genRequestUrl(HttpConfig.base_url, api, prefix)

    if(typeof showToast == "undefined"){
        showToast = HttpConfig.show_toast
    }
    if(typeof showLoading == "undefined"){
        showLoading = HttpConfig.show_loading
    }
    let sdk = getSdk();
	if (showLoading) {
        if(typeof loading == "function") {
            loading(loadingText || '');
        }
        else if(sdk){
            typeof uni !== "undefined" ? uni.showLoading({title: loadingText ,icon: "none"}) : wx.showLoading({title: loadingText || "",icon: "none"})
        }
	}
	return new Promise((resolve) => {
		let _options = {
			url: reqUrl,
			filePath: file,
			name: key,
			fileType: fileType,
			formData: formData,
			timeout: HttpConfig.timeout,
			header: {
				...header
            }
		}
        addHeaderToken(_options.header)
		_options = interceptor("BeforeUpload", _options )
		const uploadTask = uni.uploadFile({
			... _options,
			success: (uploadFileRes) => {
				let errMsg = uploadFileRes.errMsg;
				var data = isJsonString(uploadFileRes.data) ? JSON.parse(uploadFileRes.data) : (uploadFileRes.data || {});
                data = interceptor("AfterUpload",data )
				if(uploadFileRes.statusCode == 200){
					const ok = data[HttpConfig.code_key] == HttpConfig.code_value;
                    let urlData: string = "";
                    let receive = HttpConfig.upload_receive_key;
                    if(ok){
                        if(!receive){
                            urlData = isArray(data.data) ? data.data[0] : data.data
                        }
                        else {
                            let receiveData = hasKey(data, receive) ? data[receive] : hasKey(data.data, receive) ? data.data[receive] : data.data

                            urlData = isArray(receiveData) ? receiveData[0] : receiveData
                        }
                        return resolve({
                            ok: true,
                            local: file,
                            data: urlData,
                            msg: data.msg || data.message || "上传成功"
                        })
                    }
				}
				errMsg = data.msg || data.message || errMsg || toastText;
				if(showToast && errMsg){
                    if(typeof toast === "function") {
                        toast(errMsg);
                    }
                    else {
                        selfToast(errMsg)
                    }
                }
				resolve({
					ok: false,
                    local: file,
					msg: errMsg as string
				})
			},
			fail: (err: any) => {
				let errMsg = err && err.errMsg || toastText;
                if(showToast && errMsg){
                    if(typeof toast === "function") {
                        toast(errMsg);
                    }
                    else {
                        selfToast(errMsg)
                    }
                }
				resolve({
					ok: false,
                    local: file,
					msg: errMsg as string,

					err: err as IErrorResponse,
				})
			},
			complete: () => {
				if(showLoading){
                    if(typeof closeLoading == "function") {
                        closeLoading();
                    }
                    else if(sdk){
                        typeof uni !== "undefined" ? uni.hideLoading() : wx.hideLoading()
                    }
                }
			}
		});

		interceptor("ExecUpload", uploadTask )
	})
}

/**
 * 多文件上传
 * @param options { IUploadConfigOption }
 */
export const uploadMoreFile = (params: IUploadConfigOption): Promise<IUploadMoreResponse> => {
	let {
		api,
		prefix = HttpConfig.upload_prefix, //
		files,
        key = HttpConfig.upload_key,
		fileType = "image",
		formData,
		header,
		isLoading,
		showLoading = isLoading,
        closeLoading = HttpConfig.closeLoading,
        loading = HttpConfig.loading,
		loadingText,
        isToast ,
		showToast = isToast,
		toastText ,
        toast = HttpConfig.toast,
	} = params || {};

    if(typeof showToast == "undefined"){
        showToast = HttpConfig.show_toast
    }
    if(typeof showLoading == "undefined"){
        showLoading = HttpConfig.show_loading
    }
    let sdk = getSdk();
	if (showLoading) {
        if(typeof loading == "function") {
            loading(loadingText || '');
        }
        else if(sdk){
            typeof uni !== "undefined" ? uni.showLoading({title: loadingText ,icon: "none"}) : wx.showLoading({title: loadingText || "",icon: "none"})

        }
	}

	return new Promise(async (resolve) => {
        /**
         * 微信小程序不支持多文件上传
         */
        if(isWxMini()){
            let resArr: IUploadResponse[] = [],
            errArr: IResponse<any>[] = [],
            promiseArr: Promise<IUploadResponse>[] = [];
            promiseArr = (files || []).map(async (item,index) => {
                return uploadFile({
                    api,key,fileType,formData,header,file: item, prefix, showToast: false
                }).catch(err => err)
            });
            await allSettled(promiseArr)
            .then(res => {
                res.forEach(item => {
                    if (item && item.ok) {
                        resArr.push(item);
                    } else {
                        errArr.push(item);
                    }
                })
                if(resArr.length > 0){
                    resolve({
                        ok:  true,
                        data: resArr.map(item => item.data)
                    } as IUploadMoreResponse);
                } else {
                    resolve({
                        ok: false,
                        msg: "上传失败！",
                        data: resArr.map(item => item.data),
                        err: errArr[0].err
                    } as IUploadMoreResponse);
                }
                if(errArr.length > 0){
                    let errMsg = errArr[0].err && errArr[0].err.errMsg;
                    let finalErrMsg = `${errArr.length}份上传失败！${errMsg ? '失败原因：' + errMsg : ''}`
                    if(showToast && finalErrMsg){
                        if(typeof toast === "function") {
                            toast(finalErrMsg);
                        }
                        else {
                            selfToast(finalErrMsg)
                        }
                    }
                }
            })
            .catch((err: any) => {
                let errMsg = err && err.errMsg || err.errMsg || toastText;
                if(showToast && errMsg){
                    if(typeof toast === "function") {
                        toast(errMsg);
                    }
                    else {
                        selfToast(errMsg)
                    }
                }
                resolve({
                    ok: false,
                    msg: "上传失败！",
                    err
                });
            })
            return ;
        }
		let fileList = (files || []).map((item: string, index: number) => {
			return {
				name: index,
				uri: item
			}
		}) as unknown as UniNamespace.UploadFileOptionFiles[]
    	const reqUrl = genRequestUrl(HttpConfig.base_url, api, prefix)
		let _options = {
			url: reqUrl, //仅为示例，非真实的接口地址
			files: fileList,
			fileType: fileType,
			formData: formData,
			header: {
				... header
			},
		}
        addHeaderToken(_options.header)

		_options = interceptor("BeforeUpload", _options )
		const uploadTask = uni.uploadFile({
			... _options,
			success: (uploadFileRes) => {
				let errMsg = uploadFileRes?.errMsg;
				var data = isJsonString(uploadFileRes.data) ? JSON.parse(uploadFileRes.data) : (uploadFileRes.data || {});
                data = interceptor("AfterUpload",data )
				if(uploadFileRes.statusCode == 200){
					const ok = data[HttpConfig.code_key] == HttpConfig.code_value;
					if(ok){
                        let urlData: string[] | AnyObject[] = []
                        let receive = HttpConfig.upload_receive_key;
                        if(!receive){
                            urlData = isArray(data.data) ? data.data : []
                        }
                        else {
                            let receiveData = hasKey(data, receive) ? data[receive] : hasKey(data.data, receive) ? data.data[receive] : data.data
                            urlData = isArray(receiveData) ? receiveData : []
                        }
                        return resolve({
                            ok: true,
                            local: files,
                            data: urlData,
                            msg: data.msg || data.message || "上传成功"
                        })
					}
				}
				errMsg = data.msg || data.message || errMsg || toastText;
				if(showToast && errMsg){
                    if(typeof toast === "function") {
                        toast(errMsg);
                    }
                    else {
                        selfToast(errMsg)
                    }
                }
				resolve({
					ok: false,
					data: [],
					msg: errMsg as string
				})
			},
			fail: (err) => {
				let errMsg = err && err.errMsg || toastText;
                if(showToast && errMsg){
                    if(typeof toast === "function") {
                        toast(errMsg);
                    }
                    else {
                        selfToast(errMsg)
                    }
                }
				resolve({
					ok: false,
                    local: files,
					msg: errMsg as string,
					err: err as IErrorResponse,
				})
			},
			complete: () => {
				if(showLoading){
                    if(typeof closeLoading == "function") {
                        closeLoading();
                    }
                    else if(sdk){
                        typeof uni !== "undefined" ? uni.hideLoading() : wx.hideLoading()
                    }
                }
			}
		});
		interceptor("ExecUpload", uploadTask )

	});
}

export declare interface IUploadExtConfigOption extends IUploadConfigOption {

    count ?: number,
    /**
     * 选取图片方式
     * sourceType == 2 ? ["album"] : sourceType == 3 ? ["camera"] : ["album", "camera"],
     */
    sourceType?: 1 | 2 | 3,
    /**
     * 文件扩展名
     */
    extension?: string[]
    /**
     * 录视频最大时长
     */
    maxDuration?: number,
    /**
     * 选择去摄像头
     */
    camera?: 'back' | "front",
    /**
     * 是否压缩
     */
    compressed?: boolean,
    /**
     * 上传类型 视频 图片 其他文件
     */
    type?: "other" | "image" | "video"
}
/**
 * 选择文件并上传, 单独选择文件再上传可食用 uploadFile ｜ uploadMoreFile
 * @param options { IUploadExtConfigOption }
 * @param choosedCallback { 文件选择成功后的回调 }
 */
export const upload = async function (options: IUploadExtConfigOption, choosedCallback?: (list: any[]) => boolean) {
	let {
		api,
		key,
		fileType,
		formData,
		header,
		isLoading,
		showLoading,
        closeLoading ,
        loading,
		loadingText,
        isToast ,
		showToast,
		toastText ,
        toast,
        prefix,


		count = 1,
		sourceType = 1,
		extension,
		maxDuration = 60,
		camera = 'back',
		compressed = true,

        type

	} = options || {};

	let list = []
	if(type == "other"){
		list = await chooseOtherFile({
			count,
			sourceType,
			extension,
			type: "all"
		})
	}
	else if(type == "video"){
		list = await chooseVideo({
			sourceType,
			maxDuration,
			camera,
			compressed
		});
	}
	else {
		list = await chooseImage({
			count,
			sourceType,
			fileType,
			extension
		});
	}
    list = interceptor("AfterChooseFile",list )
	if(!list || !list.length) return { ok: false };

    if(choosedCallback){
        const status = choosedCallback(list);
        if(status === false) {
            return { ok: false };
        }
    }
	return new Promise(async (resolve) => {
		let result = {};
		if (list.length === 1) {
			result = await uploadFile({
				api,key,fileType,formData,header,file: list[0],
				isLoading, prefix,
                showLoading, closeLoading, loading,
                loadingText, showToast, toastText, toast
			})
		} else {
			result = await uploadMoreFile({
				api,key,fileType,formData,header,files: list,
				isLoading, prefix,
                showLoading, closeLoading, loading,
                loadingText, showToast, toastText, toast
			})
		}
		resolve(result);
	})
}
