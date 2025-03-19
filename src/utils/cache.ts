import {Config, getSdk, win} from "./config";

interface CacheValue {
    value?: any
    expire?: number
    createTime?: number
}
export declare interface IStorage {
	set: (key: string, value: any, expire?: number | -1)=> boolean
	setItem: (key: string, value: any, expire?: number | -1)=> boolean
	get: (key: string) => any
	getItem: (key: string) => any
	remove: (key: string)=> boolean
	clear: () => void
	genKey: (key: string) => string
	setConfig: (option: { id?: string }) => void
}
const isUni = (() => {
	try{
		// @ts-ignore
		return "undefined" != typeof uni ? uni : "undefined" != wx ? wx : "undefined" != my ? my : "undefined" != qq ? qq : false
	}catch(e){
		return false;
	}
})();

export class Cache implements IStorage {
	static #instance: Cache | null = null;
	#id = "";

	static createInstance(id?: string) {
		if(!Cache.#instance){
			Cache.#instance = new Cache(id || "");
		}
		return Cache.#instance;
	}

	constructor(id?: string) {
		this.#id = id || "";
	}

	setConfig(option: { id?: string }) {
		if(option.id){
			this.#id = option.id;
		}
	}

    /**
     * @desc 设置缓存
     * @param key 存储Key { string }
     * @param value 存储内容 { any }
     * @param expire 过期时间（ s > 0 ) { number }
     * @return: boolean
     */
	set (key: string, value: any, expire: number = -1): boolean {
		try{
			key = this.genKey(key);
            const cacheValue : CacheValue = {
				value: value,
				expire,
				createTime: Date.now()
			}
			let sdk = getSdk();
            // @ts-ignore
			sdk ? (
					typeof uni !== "undefined" ? uni.setStorageSync(key, JSON.stringify(cacheValue)) :
						wx.setStorageSync(key, JSON.stringify(cacheValue))
				)
				 :
				win ?
					win!.localStorage.setItem(key, JSON.stringify(cacheValue)) :
					new Error("uni or window is not undefined !")
		}catch(e){
			console.log("Cache.set.error: " + e);
			return false;
		}
		return true;
	}
	setItem = this.set;
    /**
     * @desc 获取缓存
     * @param key 存储Key { string }
     * @return: any
     */
	get(key: string): any {
		try{
    		let sdk = getSdk();
			key = this.genKey(key);
            let cacheValue: CacheValue = sdk ? ((typeof uni !== "undefined" ? uni.getStorageSync(key) : wx.getStorageSync(key)) || {}) as CacheValue :
				win ? (win.localStorage.getItem(key) || {}) as CacheValue :
					new Error("uni or window is not undefined !") as CacheValue

            try {
				cacheValue = JSON.parse(cacheValue as string)
			} catch (error) { cacheValue = {} }
			const {
				value = null,
				expire = -1,
				createTime = 0
			} = cacheValue;
            if(!value) return "";
			// 判断是否设置了过期时间
			if( expire > 0 ){
				const nowTime = new Date().getTime();
				const isExpire = (nowTime - createTime) / 1000 > expire;
				// 过期则销毁数据
				if(isExpire){
					this.remove(key);
					return "";
				}
			}
			return value;
		}catch(e){
			console.log("Cache.get.error: " + e);
			return "";
		}
	}
    getItem = this.get

    /**
     * @desc 删除指定缓存
     * @param key 存储Key { string }
     * @return: boolean
     */
	remove(key: string): boolean {
		try{
			key = this.genKey(key);
            // @ts-ignore
            if(typeof uni !== "undefined") uni.removeStorageSync (key);
            else if(typeof wx !== "undefined") wx.removeStorageSync (key);
            else typeof window !== "undefined" && window.localStorage && window.localStorage.removeItem(key);
            return true;
		}catch(e){
			console.log("Cache.remove.error: " , e);
            return false;
		}
	}
	removeItem = this.remove;
    /**
     * @desc 清除缓存
     * @return: boolean
     */
	clear() {
		try{
            // @ts-ignore
            if (typeof uni !== "undefined") uni.clearStorageSync()
            else if (typeof wx !== "undefined") wx.clearStorageSync()
            else typeof window !== "undefined" && window.localStorage && window.localStorage.clear();
            return true;
		}catch(e){
			console.log("Cache.clear.error: " + e);
            return false;
		}
	}

	genID() {
		return this.#id || Config.appId;
	}
	genKey(key: string): string {
		const id = this.genID();
        let cacheKey = key + "_" + Config.language;
		if (id) cacheKey = key + "_" + id + "_" + Config.language;
		return cacheKey;
	}

}

/** @desc 单例模式 **/
export const Storage = Cache.createInstance() as IStorage
