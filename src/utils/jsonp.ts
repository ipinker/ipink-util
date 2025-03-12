import {Config} from "./config";

let script: HTMLScriptElement,
	done: boolean,
	timer: any,
	counter = 0;

/**
 * Generates unique callback name.
 *
 * @param {String} name
 * @returns {string}
 */
function getUniqueCallbackName(name: string): string {
	return name + '_json' + (++counter);
}

/**
 * Setups full URL with all parameters.
 *
 * @param {String} baseUrl
 * @param {Object} params
 * @param {String} callbackName
 * @param {String} callbackUnique
 * @returns {String}
 */
function getQuery(baseUrl: string, params: AnyObject, callbackName: string, callbackUnique: string) {
	let query = (baseUrl || '').indexOf('?') === -1 ? '?' : '&';

	params = params || {};

	for (let key in params) {
		if (params.hasOwnProperty(key)) {
			query += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
		}
	}

	return baseUrl + query + callbackName + '=' + callbackUnique;
}

/**
 * Performs actual request.
 *
 * @param {String} url
 * @param {Function} errorCallback
 */
function load(url: string, errorCallback?: OnErrorEventHandler) {
	if(typeof document === 'undefined' || !document.createElement) return
	script = document.createElement('script') as HTMLScriptElement;
	script.src = url;
	script.async = true;

	if (typeof errorCallback === 'function') {
		script.onerror = errorCallback;
	}
	// @ts-ignore
	script.onload = script.onreadystatechange = function() {
		if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
			done = true;
			// @ts-ignore
			script.onload = script.onreadystatechange = null;

			if (script && script.parentNode) {
				script.parentNode.removeChild(script);
			}
		}
	};

	document.getElementsByTagName('head')[0].appendChild(script);
}

interface IJSONPOption<T> {
	timeout?: number,
	callback?: string
}
/**
 * Jsonp 请求
 * 仅在浏览器环境调用
 * @param url { string }
 * @param params { AnyObject }
 * @param options { IJSONPOption<T> }
 */
export const jsonp = <T>(url: string, params: AnyObject, options?: IJSONPOption<T>): Promise<T | null> => {
	if(typeof document === 'undefined' || !document.createElement) return Promise.resolve(null)
	"use strict";

	options = options || {};
	options.timeout = options.timeout || Config.request_timeout;

	let callbackName: string = options.callback || 'callback',
		callback: string = getUniqueCallbackName(callbackName as string);

	return new Promise(function(resolve, reject) {
		if (options.timeout) {
			timer = setTimeout(function() {
				reject(new Error('JSONP request timed out.'));
			}, options.timeout);
		}
		// @ts-ignore
		window[callback] = function(data: T){
			try {
				// @ts-ignore
				delete window[callback];
			} catch (e) {}
			// @ts-ignore
			window[callback] = null;
			clearTimeout(timer);
			resolve(data);
		};

		var query = getQuery(url, params, callbackName, callback),
			error = function() { reject(new Error('Script loading error.')) };

		load(query, error);
	});
};
