
export interface CacheValue {
    value?: any
    expire?: number
    createTime?: number
}
const isUni = (() => {
	try{
		// @ts-ignore
		return "undefined" != typeof uni ? uni : "undefined" != wx ? wx : "undefined" != my ? my : "undefined" != qq ? qq : false
	}catch(e){
		return false;
	}
})();

export class Cache {
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
            // @ts-ignore
			isUni ? uni.setStorageSync(key, JSON.stringify(cacheValue)) : window.localStorage.setItem(key, JSON.stringify(cacheValue));
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
			key = this.genKey(key);
            let cacheValue: CacheValue;
            if(isUni) {
                // @ts-ignore
                cacheValue = (uni.getStorageSync(key) || {}) as CacheValue;
            }
            else {
                cacheValue = (window.localStorage.getItem(key) || {}) as CacheValue;
            }
            try { cacheValue = JSON.parse(cacheValue as string) } catch (error) { cacheValue = {} }
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
            if(isUni) uni.removeStorageSync (key);
            else window.localStorage.removeItem(key);
            return true;
		}catch(e){
			console.log("Cache.remove.error: " , e);
            return false;
		}
	}

    /**
     * @desc 清除缓存
     * @return: boolean
     */
	clear() {
		try{
            // @ts-ignore
            if (isUni) uni.clearStorageSync()
            else window.localStorage.clear();
            return true;
		}catch(e){
			console.log("Cache.clear.error: " + e);
            return false;
		}
	}

	genKey(key: string): string {
		return (this.#id ? this.#id + "_" : "") + key;
	}

}

/** @desc 单例模式 （id: string） **/
export const CacheInstance = Cache.createInstance
