
export interface CacheValue {
    value?: any
    expire?: number
    createTime?: number
}
type GetCahe = (key: string) => CacheValue | string;
type SetCahe = (key: string, value: string) => void;
const isUni = !!(uni && uni.getStorage)
const setItem: SetCahe = isUni ? uni.setStorageSync : window.localStorage.setItem;
const getItem: GetCahe = (isUni ? uni.getStorageSync : window.localStorage.getItem) as GetCahe;
const removeItem = isUni ? uni.removeStorageSync : window.localStorage.removeItem;
const clear = isUni ? uni.clearStorageSync : window.localStorage.clear;

export class Cache {
	static #instance: Cache | null = null;
	#id = "";
	
	static createInstance(id?: string) {
		if(!this.#instance){
			this.#instance = new Cache(id || "");
		}
		return this.#instance;
	}
	
	constructor(id = "") {
		this.#id = id;
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
			setItem(key, JSON.stringify(cacheValue));
		}catch(e){
			console.error("Cache.set.error: " + e);
			return false;
		}
		return true;
	}
	
    /**
     * @desc 获取缓存
     * @param key 存储Key { string }
     * @return: any
     */
	get(key: string): any {	
		try{
			key = this.genKey(key);
            let cacheValue: CacheValue = (getItem(key) || {}) as CacheValue;
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
			console.error("Cache.get.error: " + e);
			return "";
		}
	}
	
    /**
     * @desc 删除指定缓存
     * @param key 存储Key { string }
     * @return: boolean
     */
	remove(key: string): boolean {	
		try{
			key = this.genKey(key);
			removeItem(key);
            return true;
		}catch(e){
			console.error("Cache.remove.error: " , e);
            return false;
		}
	}
	
    /**
     * @desc 清除缓存
     * @return: boolean
     */
	clear() {	
		try{
			clear();
            return true;
		}catch(e){
			console.error("Cache.clear.error: " + e);
            return false;
		}
	}
	
	genKey(key: string): string {
		return (this.#id ? this.#id + "_" : "") + key;
	}
	
}

/** @desc 单例模式 （id: string） **/
export default Cache.createInstance