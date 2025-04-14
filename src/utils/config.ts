import {
    CloseLoadingType,
    ContentType,
    InterceptorType,
    InterceptorTypeEnum,
    LoadingType,
    Method,
    ToastType
} from "./typing";
import {IToast} from "./toast";
import { hasKey } from "./util";

export declare interface IConfig {
    appName?: string
    appId?: string
    language?: string
    socket_url?: string
    origin_url?: string
    login_url?: string
	use_inner_toast?: boolean
	toast_duration?: number
    webview_path?: string
    [prop: string]: any
}

// 全剧配置文件
export class Config {
    /**
     * App name
     */
    static appName = ""
    /**
     * App id
     */
    static appId = ""
    /**
     * 语言
     */
    static language = ""
    /**
     * Url Option
     */
    static socket_url = ""; // socket url
    static origin_url = ""; // 跳转的URL前缀
    static login_url = "";  // 登陆url

    /**
     * 组件内部调用内部的toast方法时， 是否用内部定义的html toast， 否则使用uni.showToast
     */
    static use_inner_toast: boolean = true;
    /**
     * toast 持续时间
     */
    static toast_duration: number = 2400;
    /**
     * 非H5使用，打开一个webview页面显示指定的 h5 url 页面
     * 页面需接收 【url】query
     * 在 jump 方法中非H5平台会使用到该属性
     */
    static webview_path: string = "/pages/webview/index"
    /**
	 * 设置配置信息
	 * 如果设置Http相关的配置， 使用HttpConfig.setConfig
	 *
	 * 如果主题相关使用 ipink-theme.ThemeConfig.setToken
	 */
    static setConfig(params: IConfig) {
        if (params) {
            Object.keys(params).forEach((key: keyof IConfig) => {
                // @ts-ignore
                Config[key] = params[key]
				// 如果设置了Config的默认属性
				if(hasKey(HttpConfig, key as string)) {
					// @ts-ignore
					HttpConfig[key] = Config[key]
				}
            })
        }
    }
}


declare interface IHttpConfig {
    /**
     * 请求的URL
     */
    base_url?: string
    /**
     * 超时时间
     */
    timeout?: number
    content_type?: ContentType
    /**
     * 默认方法
     */
    default_method?: Method
    /**
     * 获取token函数吗未设置则取 Storage.get(AxiosConfig.token_key)
     */
    getToken?: null | (() => string)
    /**
     * Token 验证类型， 默认： Bearer
     */
    token_type?: string
    /**
     * 获取Token的Key， 默认使用的是  import {Storage} from "ipink-util";Storage.get
     */
    token_key?: string
    /**
     * 外部传入的axios包, uniapp 环境下使用 request；js环境下使用 http， 使用request此项忽略
	 *
	 * @example `
     *  import { Config, HttpConfig, createHttp } from "ipink-util"
     *
     *  HttpConfig.setConfig({
     *    base_url: "http://www.baidu.com"
     *  })
     *
     *  const http = createHttp();
     *
     *  http<string>({
     *      url: "/api/public/upload",
     *      method: "POST",
     *      data: {},
     *      headers: {
     *          'Content-Type': 'multipart/form-data'
     *      }
     *  })
     * `
     */
    axios?: any | null
    /**
     * 请求前缀
     */
    api_prefix?: string;
    /**
     * 上传请求前缀
     */
    upload_prefix?: string;

    /**
     * 文件上传后后段接收的 key
     */
    upload_key?: string;
    /**
     * 文件上传成功后用来取值，仅限于 example
     * 单文件上传 取data， data[0];多文件直接返回data
     * 如果设置了 upload_receive_key ， 则会判定data不存在，会在顶级结构取该属性， 取不到则会取 data[upload_receive_key]
     * @example `
     *    {
     *        data: "https://.../demo.png",
     *        // or
     *        data: ["https://.../demo.png"]
     *    }
     * `
     */
    upload_receive_key?: string;
    /**
     * 错误弹窗体方法
     */
    toast?: null | ToastType;
    /**
     * 报错时是否调用toast
     */
    show_toast?: boolean;
    /**
     * 接口请求时是否开启loading, 仅适用与uniapp环境下
     */
    show_loading?: boolean
    loading?: null | LoadingType;
    closeLoading?: null | CloseLoadingType
    /**
     * 判断StatusCode == 200的情况下，根据该值判断接口出餐是否逻辑正确， 否则赋值 [ok：false]
     */
    code_key?: string
    /**
     * 判断StatusCode == 200的情况下，根据该值判断接口出餐是否逻辑正确，依赖为该值 默认为 1
     */
    code_value?: string | number
    /**
     * 默认错误信息
     */
    default_error_msg?: string

    /**
     * http 请求拦截器， 在这里可设置自定义操作
     * @param type 拦截到的类型
     * @param data 可修改的源数据， return data 即修改完成
     *
     * @example `
     *    HttpConfig.interceptor = (type: InterceptorTypeEnum, data: any) => {
     *
     *        switch (type) {
     *            // 请求前，对配置和入参做一些处理
     *            case "BeforeRequest":
     *            // 执行中， data为RequestTask， 可执行 RequestTask.abort() 终止请求
     *            case "ExecRequest":
     *                typeof data = { abort: () => void }
     *                break;
     *            // 请求完成，对出参做一些处理， 例如： 整体出参揭秘等
     *            case "AfterRequest":
     *                break;
     *            // upload 方法，选择文件后对选择的文件做一些处理；虽然该函数提供 choosedCallback：() => boolean 入参函数
     *            case "AfterChooseFile":
     *                break;
     *            // 调用UploadFile前，对配置和入参做一些处理
     *            case "BeforeUpload":
     *                break;
	 *			  // 调用UploadFile时, 对请求进行管理
     *            case "ExecUpload":
	 *				  typeof data = {
	 *					abort: () => void
	 *					onProgressUpdate: ({progress: number, totalBytesSent: number, totalBytesExpectedToSend: number}) => {} // 监听上传进度变化
	 *					onHeadersReceived // 仅微信小程序平台支持, 见官方文档
	 *					offProgressUpdate // 仅微信小程序平台支持, 见官方文档
	 *					offHeadersReceived // 仅微信小程序平台支持, 见官方文档
	 *				  }
     *                break;
     *            // UploadFile | UploadMoreFile 方法，对上传完成后的数据进行一些处理
     *            case "AfterUpload":
     *                break;
     *
     *
     *        }
     *        return data
     *    }
     * `
     */
    interceptor?: InterceptorType

}

/**
 * 使用本工具包的Http请求， 需要设置该配置， 不用则忽略
 */
export class HttpConfig {
    /**
     * 请求的URL
     */
    static base_url: string = "";
    /**
     * 超时时间
     */
    static timeout: number = 60000;
    static content_type: string = "application/json";
    /**
     * 默认方法
     */
    static default_method: Method = "POST"
    /**
     * 获取token函数吗未设置则取 Storage.get(AxiosConfig.token_key)
     */
    static getToken: null | (() => string) = null
    static token_type: string = "Bearer"
    /**
     * 获取Token的Key， 默认使用的是  import {Storage} from "ipink-util";Storage.get
     */
    static token_key: string = "A__APP_TOKEN__Z"
    /**
     * 外部传入的axios包, uniapp 环境下使用 request；js环境下使用 http， 使用request此项忽略
	 *
	 * @example `
     *  import { Config, HttpConfig, createHttp } from "ipink-util"
     *
     *  HttpConfig.setConfig({
     *    base_url: "http://www.baidu.com"
     *  })
     *
     *  const http = createHttp();
     *
     *  http<string>({
     *      url: "/api/public/upload",
     *      method: "POST",
     *      data: {},
     *      headers: {
     *          'Content-Type': 'multipart/form-data'
     *      }
     *  })
     * `
     */
    static axios: any | null = null
    /**
     * 请求前缀
     */
    static api_prefix: string = "";
    /**
     * 上传请求前缀
     */
    static upload_prefix: string = "";
    /**
     * 文件上传成功后用来取值，仅限于 example
     * 单文件上传 取data， data[0];多文件直接返回data
     * 如果设置了 upload_receive_key ， 则会判定data不存在，会在顶级结构取该属性， 取不到则会取 data[upload_receive_key]
     * @example `
     *    {
     *        data: "https://.../demo.png",
     *        // or
     *        data: ["https://.../demo.png"]
     *    }
     * `
     */
    static upload_receive_key: string = "";
    /**
     * 文件上传后后段接收的 key
     */
    static upload_key?: string = "file"
    /**
     * 错误弹窗体方法
     */
    static toast: null | ((title: string | IToast) => void) = null;
    /**
     * 报错时是否调用toast
     */
    static show_toast = false

    /**
     * 接口请求时是否开启loading, 仅适用与uniapp环境下
     */
    static show_loading = false
    static loading: null | LoadingType = null;
    static closeLoading: null | CloseLoadingType = null;
    /**
     * 判断StatusCode == 200的情况下，根据该值判断接口出餐是否逻辑正确， 否则赋值 [ok：false]
     */
    static code_key: string = "code"
    /**
     * 判断StatusCode == 200的情况下，根据该值判断接口出餐是否逻辑正确，依赖为该值 默认为 1
     */
    static code_value: string | number = 1
    /**
     * 默认错误信息
     */
    static default_error_msg: string = "数据响应失败！"

    /**
     * http 请求拦截器， 在这里可设置自定义操作
     * @param type 拦截到的类型
     * @param data 可修改的源数据， return data 即修改完成
     *
     * @example `
     *    HttpConfig.interceptor = (type: InterceptorTypeEnum, data: any) => {
     *
     *        switch (type) {
     *            // 请求前，对配置和入参做一些处理
     *            case "BeforeRequest":
     *            // 执行中， data为RequestTask， 可执行 RequestTask.abort() 终止请求
     *            case "ExecRequest":
     *                typeof data = { abort: () => void }
     *                break;
     *            // 请求完成，对出参做一些处理， 例如： 整体出参揭秘等
     *            case "AfterRequest":
     *                break;
     *            // upload 方法，选择文件后对选择的文件做一些处理；虽然该函数提供 choosedCallback：() => boolean 入参函数
     *            case "AfterChooseFile":
     *                break;
     *            // 调用UploadFile前，对配置和入参做一些处理
     *            case "BeforeUpload":
     *                break;
	 *			  // 调用UploadFile时, 对请求进行管理
     *            case "ExecUpload":
	 *				  typeof data = {
	 *					abort: () => void
	 *					onProgressUpdate: ({progress: number, totalBytesSent: number, totalBytesExpectedToSend: number}) => {} // 监听上传进度变化
	 *					onHeadersReceived // 仅微信小程序平台支持, 见官方文档
	 *					offProgressUpdate // 仅微信小程序平台支持, 见官方文档
	 *					offHeadersReceived // 仅微信小程序平台支持, 见官方文档
	 *				  }
     *                break;
     *            // UploadFile | UploadMoreFile 方法，对上传完成后的数据进行一些处理
     *            case "AfterUpload":
     *                break;
     *
     *
     *        }
     *        return data
     *    }
     * `
     */
    static interceptor: null | InterceptorType = null

    /**
     * 设置默认配置
     * @param params { IHttpConfig }
     */
    static setConfig(params: IHttpConfig): void {
        Object.keys(params || {}).forEach((key: string) => {
            // @ts-ignore
            HttpConfig[key] = params[key]
        })
    }
}

/**
 * 拦截器内部盼盼是否存在，存在即调用调用
 * @param type
 * @param data
 */
export function interceptor(type: InterceptorTypeEnum, data: any) {
    if (typeof HttpConfig.interceptor === "function") {
        const result = HttpConfig.interceptor(type, data);
        return result || data;
    }
    return data;
}

/**
 * Window ｜ Self ｜ GlobalThis 对象
 */
// @ts-ignore
export const win: Window = "undefined" != typeof window ? window : "undefined" != globalThis ? globalThis : "undefined" != self ? self : null; // window | self | globalThis
/**
 * 获取调用该方法的环境sdk
 * 部分特殊系统级api封装； 仅支持 uniapp wx
 * 使用 getSdk请关闭uniapp的摇树； 这里仅用来判断是否存在sdk
 * @example `
 *  import { getSdk } from "ipink-util"
 *  // uniapp
 *  getSdk() === uni
 *  // wx
 *  getSdk() === wx
 * `
 */
export const getSdk = (): Uni => {
    // @ts-ignore
    return "undefined" != typeof uni && uni?.getStorageSync ? uni : "undefined" != typeof wx && wx?.getStorageSync ? wx : null; // uni | wx | null
}

export const ConfigBase = Config
