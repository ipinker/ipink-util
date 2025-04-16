import { HttpConfig } from "./config";
import {genRequestUrl} from "./request";
import {MethodsHeaders, RawAxiosRequestHeaders} from "./typing";
interface ISSEOption {
    api: string,
		url?: string,
		data?: AnyObject,
		headers?: RawAxiosRequestHeaders & MethodsHeaders & Headers,
		prefix?: string, // 前缀
		success?: Function,
		fail?: Function,
		complete?: Function
}
export function createSSEConnection(options: ISSEOption):  XMLHttpRequest {
	const {
		api,
		url,
		data = {},
		headers,
		prefix = HttpConfig.api_prefix, // 前缀
		success,
		fail,
		complete
	} = (options || {}) as ISSEOption;
	const reqUrl = genRequestUrl(url || HttpConfig.base_url, api, prefix)
	// 创建一个标准的XMLHttpRequest对象
	const xhr = new XMLHttpRequest()

	xhr.open('POST', reqUrl, true)

	xhr.setRequestHeader('Accept', 'text/event-stream')
	xhr.setRequestHeader('Cache-Control', 'no-cache')
	Object.keys(headers || {}).forEach(key => {
        // @ts-ignore
		xhr.setRequestHeader(key, headers[key])
	})

	// 设置响应类型为文本
	xhr.responseType = 'text'

	// 数据缓冲区
	let buffer = ''

	// 处理进度事件
	xhr.onprogress = function(e) {
		// 获取新数据
		const newData = xhr.responseText.substring(buffer.length)
		if (newData) {
			buffer += newData
			// 按行分割数据
			const lines = newData.split('\n')
			for (const line of lines) {
				if (line.startsWith('data:')) {
					const eventData = line.substring(5).trim()
					// 触发数据处理
					const data = handleSSEData(eventData)
					if(data.event != "message_end"){
						success && success(data)
					}
					else {
						success && success(data)
						complete && complete(buffer)
						xhr && xhr.abort && xhr.abort();
					}
				}
			}
		}
		else {
			success && success({})
			complete && complete(buffer)
		}
	}

	xhr.onerror = function(e) {
		console.error('SSE连接错误:', )
		fail && fail(e)
		complete && complete()
	}

	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				console.log('SSE连接完成')
			} else {
				console.log("SSE连接失败", xhr.status)
				fail && fail({
					statusCode: xhr.status,
					errMsg: xhr.responseXML || xhr.responseText
				})
				complete && complete()
			}
		}
	}

	// 发送请求
	xhr.send(JSON.stringify(data))

	return xhr
}

// 处理SSE数据
function handleSSEData(data : any) {
	try {
		return JSON.parse(data)
	} catch (e) {
		return { answer: "", event: "message" }
	}
}
