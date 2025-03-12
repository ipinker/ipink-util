/**
 * 该文件请求仅适用于 Web + axios
 */
import {HttpConfig, interceptor} from "./config";
import {Storage} from "./cache"
import {
    AxiosBasicCredentials, AxiosProxyConfig,
    BrowserProgressEvent, CancelToken, GenericAbortSignal, HttpStatusCode, IResponse,
    Method,
    MethodsHeaders,
    RawAxiosRequestHeaders, RawAxiosResponseHeaders,
    responseEncoding, TransitionalOptions
} from "./typing";
import {log} from "./log";
// @ts-ignore
import { get, merge } from "lodash-es"

/**
 * 参考 axios.AxiosProgressEvent
 */
interface AxiosProgressEvent {
    loaded: number;
    total?: number;
    progress?: number;
    bytes: number;
    rate?: number;
    estimated?: number;
    upload?: boolean;
    download?: boolean;
    event?: BrowserProgressEvent;
}

/**
 * 参考 axios.AxiosRequestConfig
 */
interface AxiosRequestConfig<D = any> {
    url?: string;
    method?: Method | string;
    base_url?: string;
    headers?: RawAxiosRequestHeaders & MethodsHeaders & Headers;
    params?: any;
    data?: D;
    timeout?: number;
    timeoutErrorMessage?: string;
    withCredentials?: boolean;
    auth?: AxiosBasicCredentials;
    responseType?: ResponseType;
    responseEncoding?: responseEncoding | string;
    xsrfCookieName?: string;
    xsrfHeaderName?: string;
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void;
    maxContentLength?: number;
    validateStatus?: ((status: number) => boolean) | null;
    maxBodyLength?: number;
    maxRedirects?: number;
    maxRate?: number;
    beforeRedirect?: (options: Record<string, any>, responseDetails: {
        headers: Record<string, string>,
        statusCode: HttpStatusCode
    }) => void;
    socketPath?: string | null;
    transport?: any;
    httpAgent?: any;
    httpsAgent?: any;
    proxy?: AxiosProxyConfig | false;
    cancelToken?: CancelToken;
    decompress?: boolean;
    transitional?: TransitionalOptions;
    signal?: GenericAbortSignal;
    insecureHTTPParser?: boolean;
    env?: {
        FormData?: new (...args: any[]) => object;
    };

    [propName: string]: any;
}

/**
 * 参考 axios.AxiosResponse
 */
interface AxiosResponse<T = any, D = any>  {
    data: T;
    status: number;
    statusText: string;
    headers: RawAxiosResponseHeaders | MethodsHeaders & Headers;
    config: AxiosRequestConfig<D>;
    request?: any;
}
/** 创建请求实例 */
function createService() {
    if (!HttpConfig.axios) {
        throw new Error('本包未内置axios，请在外部传入，例如在main.ts中 \nimport axios from "axios"\nConfig.setConfig({\n\taxios: axios \n})\n\/\/或者 \nHttpConfig.setConfig({\n\taxios: axios \n})');
    }
    // 创建一个 axios 实例命名为 service
    const service = HttpConfig.axios.create()
    // 请求拦截
    service.interceptors.request.use(
        // InternalAxiosRequestConfig<any>
        (config: any) => config,
        // 发送失败
        (error: any) => Promise.resolve({...(error || {}), ok: false})
    )
    // 响应拦截（可根据具体业务作出相应的调整）
    service.interceptors.response.use(
        (response: AxiosResponse) => {

            response = interceptor("AfterRequest", response);
            const apiData = {
                ...(response.data || {}),
                msg: response.data.msg || response.data.message || response.data.Message || ""
            }
            // 二进制数据则直接返回
            const responseType = response.request?.responseType
            if (responseType === "blob" || responseType === "arraybuffer") return apiData;
            // 这个 code 是和后端约定的业务 code
            const code: number = +apiData[HttpConfig.code_key],
                ok: boolean = code == HttpConfig.code_value;
            const finalData = Object.assign(apiData, Object.assign(apiData, {ok}))
            if (!ok) {
                HttpConfig.toast && HttpConfig.show_toast && HttpConfig.toast(finalData.msg || HttpConfig.default_error_msg)
            }
            return finalData
        },
        (error: any) => {
            // status 是 HTTP 状态码
            const status = get(error, "response.status")
            switch (status) {
                case HttpStatusCode.BadRequest:
                    error.msg = "请求错误"
                    break
                case HttpStatusCode.Unauthorized:
                    error.msg = "您的登录已过期！"
                    break
                case HttpStatusCode.Forbidden:
                    error.msg = "拒绝访问"
                    break
                case HttpStatusCode.NotFound:
                    error.msg = "请求地址出错"
                    break
                case HttpStatusCode.RequestTimeout:
                    error.msg = "请求超时"
                    break
                case HttpStatusCode.InternalServerError:
                    error.msg = "服务器内部错误"
                    break
                case HttpStatusCode.NotImplemented:
                    error.msg = "服务未实现"
                    break
                case HttpStatusCode.BadGateway:
                    error.msg = "网关错误"
                    break
                case HttpStatusCode.ServiceUnavailable:
                    error.msg = "服务不可用"
                    break
                case HttpStatusCode.GatewayTimeout:
                    error.msg = "网关超时"
                    break
                case HttpStatusCode.HttpVersionNotSupported:
                    error.msg = "HTTP 版本不受支持"
                    break
                default:
                    error.msg = "服务器响应错误！"
                    break
            }
            HttpConfig.toast && HttpConfig.show_toast && HttpConfig.toast(error.msg || HttpConfig.default_error_msg)

            return Promise.resolve({
                ... error,
                ok: false,
                msg: error.msg,
                code: status
            })
        }
    )
    return service
}

/** 创建请求方法 */
function createRequest(service: any) {
    return function <T>(config: AxiosRequestConfig): Promise<IResponse<T>> {
        let token: string
        if(HttpConfig.getToken){
            token = HttpConfig.getToken()
        }
        else {
            token = Storage.get(HttpConfig.token_key)
        }
        const defaultConfig = {
            headers: {
                // 携带 Token
                "Authorization": token ? `${HttpConfig.token_type}${HttpConfig.token_type ? ' ' : ''}${token}` : '',
                "Content-Type": "application/json"
            },
            timeout: HttpConfig.timeout,
            base_url: HttpConfig.base_url + HttpConfig.api_prefix,
            method: HttpConfig.default_method,
            data: {}
        }
        log.group(config?.url || "", () => {
            log.info("入参:", {...config.data})
        }, true)
        // 将默认配置 defaultConfig 和传入的自定义配置 config 进行合并成为 mergeConfig
        let mergeConfig = merge(defaultConfig, config);
        mergeConfig = interceptor("BeforeRequest", mergeConfig);
        return service(mergeConfig)
    }
}

/** 用于网络请求的实例 */
const service = createService()
/** 用于网络请求的方法 */
export const http = createRequest(service)
