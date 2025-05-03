/**
 * 该文件请求仅适用于uniapp ｜ wx
 */
import {HttpConfig, interceptor, getSdk} from './config';
import { toast as selfToast } from "./toast"
import {Storage} from "./cache"
import {
    IBaseResponse, IErrorResponse,
    IfUnknown, InterceptorTypeEnum,
    IResponse,
    LoadingType,
    MethodsHeaders,
    RawAxiosRequestHeaders,
    ToastType
} from "./typing";

/**
 * 内部用来合成请求url用的，会依赖 HttpConfig，外部使用需注意
 * @param url
 * @param path
 * @param prefix
 */
export function genRequestUrl(url: string, path = "", prefix = "") {
    url = url || HttpConfig.base_url
    prefix = prefix || HttpConfig.api_prefix
	// path 为 http链接, 直接返回
	if(path.startsWith("http://") || path.startsWith("https://")){
		return path;
	}
	// path 或者 url 包含前缀
	if(prefix && (path.includes(prefix) || url.includes(prefix))){
		return url + path
	}
	return url + prefix + path;
}

export declare interface IRequestConfigOption {
    timeout?: number,
    /**
     * 请求的api部分
     */
    api: string,
    /**
     * 请求的url域名
     */
    url?: string,
    /**
     * 请求方法，默认 POST
     */
    method?: string,
    /**
     * 请求入参，直接在第一个参数传入， 也可以使用请求第二个参数
     */
    data?: AnyObject,
    /**
     * @deprecated 已废弃，请使用 showLoading
     */
    isLoading?: boolean,
    /**
     * 请求时是否加载loading， uni.showLoading, 可设置HttpConfig.setConfig({ showLoading: true }) 打开
     * 设置此值false 权限最大
     */
    showLoading?: boolean,
    closeLoading?: boolean,
    /**
     * loading文字
     */
    loadingText?: string,
    /**
     * 自定义弹框方法，不传则相关配置无效， 可在此传入， 也可全局配置HttpConfig.setConfig({loading})
     */
    loading?: null | LoadingType
    /**
     * @deprecated 已废弃， 请使用 showToast
     */
    isToast?: boolean,
    /**
     * 业务逻辑错误时是否弹框提示, 可设置HttpConfig.setConfig({ show_toast: true }) 打开
     * 设置此值false 权限最大
     */
    showToast?: boolean,
    /**
     * toast文字
     */
    toastText?: string,
    /**
     * 自定义弹框方法， 不传默认本包的toast
     */
    toast?: null | ToastType;
    /**
     * 自定义Header
     */
    header?: RawAxiosRequestHeaders & MethodsHeaders & Headers
    /**
     * api前缀
     */
    prefix?: string, // 前缀
    /**
     * 接口描述
     */
    description?: string
}

export const addHeaderToken = (header: RawAxiosRequestHeaders) => {
    if(!header.Authorization){
        let token = ""
        if(HttpConfig.getToken){
            token = HttpConfig.getToken()
        }
        else {
            token = Storage.get(HttpConfig.token_key)
        }
        if(token){
            header.Authorization =  token ? `${HttpConfig.token_type}${HttpConfig.token_type ? ' ' : ''}${token}` : '';
        }
    }
}

/**
 * Uniapp or Wx 环境下的请求方法
 *
 * @param configOption { IRequestConfigOption | string } 「配置选项」或「api字符串路径」，当为配置选项时非必传参数会取HttpConfig内的默认值， 当为string类型可使用第三个参数传入覆盖配置项
 * @param data { AnyObject } 请求入参， 可选, 【configOption】为「IRequestConfigOption」类型时，可设置 configOption.data 为入参
 * @param extConfigOption { IRequestConfigOption } 可选， 针对于「configOption」，一般「configOption」为全局HttpConfig的默认值，这里会对该参数进行补充， 例如使用example 1示例时
 * @type T <T>request(... args): Promise<IfUnknown<T, IResponse<unknown>>>
 * @example `
 *  // 用法可参考以下两个案例
 *  // example 1
 *  // 1. 创建service.ts
 *  import { request, isString } from "ipink-util"
 *  // 下边有api.ts示例
 *  import Apis from "./apis"
 *  const _R: { [propName: string]: <T>(params: AnyObject, config: IRequestConfigOption) => Promise<IResponse<T>> } = {};
 *  Object.keys(Apis).forEach(item => {
 *      let baseConfig = Api[item];
 *      if(isString(baseConfig)) baseConfig = {
 *          api: baseConfig
 *      }
 *      _R[item] = <T>(params: AnyObject, config: IRequestConfigOption) => request<T>(Apis[item], params, config);
 *  })
 *  export default _R;
 *  // api.ts
 *  export default {
 *      "API_NAME": {
 *          api: "/user/info",
 *          description: ”获取用户信息“,
 *          method: "GET",
 *          showToast: true, // 接口报错提示
 *          showLoading: true,
 *          header: {
 *              "custom-key": "value"
 *          }
 *      }
 *  }
 *  // 页面调用 invoke
 *  import Req from "@/service"
 *  import { log } from "ipink-util"
 *  onMounted(async () => {
 *      const res = await R["API_NAME"]({id: "123"})
 *      log.info("API_NAME", res)
 *  })
 *
 *  @example2
 *  // 不创建service.ts, 直接使用api.ts
 *  import { request } from "ipink-util"
 *  export const getUserInfo = (data: {id: string}) => {
 *      return request("/user/info", data, {
 *          description: ”获取用户信息“,
 *          showToast: true, // 接口报错提示
 *          showLoading: true,
 *          header: {
 *              "custom-key": "value"
 *          }
 *      })
 *  }
 *  export const getUserInfo2 = <T>(data: {id: string}): Promise<T> => {
 *      return request({
 *          description: ”获取用户信息“,
 *          showToast: true, // 接口报错提示
 *          showLoading: true,
 *          header: {
 *              "custom-key": "value"
 *          },
 *          data,
 *      })
 *  }
 *  // mine.vue
 *  import { getUserInfo2 } from "@/apis"
 *  onMounted(async () => {
 *      const res = await getUserInfo2<IUserInfo>({id: "123"})
 *      log.info("API_NAME", res)
 *  })
 * `
 */
export const request = <T = unknown>(
    baseConfig: IRequestConfigOption | string,
    data?: AnyObject, superConfig?: IRequestConfigOption
): Promise<IfUnknown<T, IResponse<unknown>>> => {
    // 处理 baseConfig 为 string 类型
	if(typeof baseConfig === "string") baseConfig = {
		api: baseConfig as string
	}
	if(typeof baseConfig === "object" && baseConfig.data)  {
		data = {
            ... baseConfig.data,
            ... (data || {})
        };
	}
	let config = {
		... baseConfig,
		... superConfig
	}
	let {
		api,
		url,
		method = HttpConfig.default_method,
		isLoading,
		showLoading = isLoading,
        closeLoading = HttpConfig.closeLoading,
        loading = HttpConfig.loading,
		loadingText,
        isToast ,
		showToast = isToast,
		toastText ,
        toast = HttpConfig.toast,
		header,
		prefix =  HttpConfig.api_prefix, // 前缀
        timeout = HttpConfig.timeout
	} = config;
    if(typeof showToast == "undefined"){
        showToast = HttpConfig.show_toast
    }
    if(typeof showToast == "undefined"){
        showLoading = HttpConfig.show_loading
    }
	const reqUrl = genRequestUrl(url || HttpConfig.base_url, api, prefix)
    let sdk = getSdk();
	if (showLoading) {
        if(typeof loading == "function") {
            loading(loadingText || '');
        }
        else if(sdk){
            typeof uni !== "undefined" ? uni.showLoading({title: loadingText ,icon: "none"}) : wx.showLoading({title: loadingText || "" ,icon: "none"})
        }
	}
	return new Promise((reslove) => {
        let _options = {
            url: reqUrl,
			method: method || HttpConfig.default_method,
			timeout,
			data,
			header: {
				"content-type": HttpConfig.content_type,
				...header
			},
        }
        addHeaderToken(_options.header)
        _options = interceptor("BeforeRequest",_options )
		const request = {
            ... _options,
			success: (res: IBaseResponse<IResponse<unknown>>) => {
                res.data = interceptor("AfterRequest",data || {} )
				let ok = false;
                let errMsg = ""
				if(res.statusCode === 200){
					// 待去除
					ok = res.data[HttpConfig.code_key] == HttpConfig.code_value;
					if (!ok) {
                        errMsg = res.data?.msg || res.data?.message || res.data?.Message || toastText || "参数错误";
					}
				}
				else if(res.statusCode === 401){
					errMsg = "您的登录已过期，请重新登录！"
                    interceptor("401",res )
                }
                else if( res.statusCode === 403){
					errMsg = "您没有访问的权限！"
                    interceptor("403",res )
				}
				else if(res.statusCode === 404){
					errMsg = "您访问的资源不存在！"
                    interceptor("404",res )
                }
                else {
					errMsg = "您的访问出现了一点问题，请稍后再做尝试！"
                    interceptor("" + res.statusCode as InterceptorTypeEnum,res )
				}
                if(showToast){
                    if(typeof toast === "function") {
                        toast(errMsg);
                    }
                    else {
                        selfToast(errMsg)
                    }
                }
				reslove({
					ok,
					... res.data || {}
				} as IfUnknown<T, IResponse<unknown>>);
			},
			fail: (err: IErrorResponse) => {
				let errMsg = err && err.errMsg || toastText;
                if(showToast && errMsg){
                    if(typeof toast === "function") {
                        toast(errMsg);
                    }
                    else {
                        selfToast(errMsg)
                    }
                }
				reslove({
					ok: false,
					err
				} as IfUnknown<T, IResponse<unknown>>);
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
		}
		const requestTask = typeof uni !== "undefined" ? uni.request(request as unknown as UniApp. RequestOptions) : wx.request(request as unknown as  WechatMiniprogram.RequestOption);
        interceptor("ExecRequest", requestTask);
	})
};


