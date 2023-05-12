/** 数学计算工具类
 * @param u'se : Boolean, 是否开启链式模式; 默认不开启
 * 
 * @method newInstance(useC'h'a'i'n: Boolean): Maths 获取实例, 没有则创建实例
 * 
 * @method done() : Number 获取链接调用的最终结果, 并清空链式副作用
 * 
 * @method base(defaultNum: Number) : Maths,  开启链式调用, 初始化默认值
 * @method chain(defaultNum: Number) : Maths,  同 <base>
 * @method chain(methodKey: String, ...arguments) : Maths | Number, methodKey<内部方法名>, 
 * 		* 1. 链式模式返回链式调用实例 <Maths>
 * 		* 2. 非链式模式计算结果
 * 		* ps. methodKey [ add, sub, mul, div, pow ]
 * 
 * 
 * 以下方法, 
 * 		+ 链式模式返回链式调用实例 <Maths>, 取结果调用 done(), 或者直接 实例(Maths).result
 * 			* 链式模式直接通过 < 实例(Maths).result >获取结果, 并不会初始化, 下次计算会直接拿结果加入下次运算
 * 		+ 非链式模式返回计算结果 <Number>
 * 		+ 链式模式下不想使用链式调, 直接取结果 直接调用 adds subs muls divs pows; 方法名+s
 * @method add( ...arguments ) : <Maths | Number>, 加法 单例
 * @method sub( ...arguments ) : <Maths | Number>, 减法
 * @method mul( ...arguments ) : <Maths | Number>, 乘法
 * @method div( ...arguments ) : <Maths | Number>, 除法
 * @method pow( ...arguments ) : <Maths | Number>, 求幂 不支持指数为小数
 * 
 * */ 
 /** Example
  * Example1 非链式使用
		const math = Maths();
		console.log(math.div(64,2,16,0.2))
		console.log(math.add(64,2,16,0.2))
		console.log(math.sub(64,2))
  * Example2 链式调用
		const math = Maths(true); 
		console.log(math.div(64,2,16,0.2).div(2))
		// or 
		Maths(true).div(64,2,16,0.2).div(2)
  * Example3 链式调用在任何地方都可调用
		const math = Maths(true); 
		console.log(math.div(64,2,16,0.2).div(2))
		// 临时取餐 math.result, 做一些其他操作, 比如请求接口
		const num = math.result;
		// do something ... 
		
		// 继续操作结果
		console.log(math.div(10.04).div(2))
		console.log(math.add(10.04).mul(9))
		// 结束链接调用, 初始化 result
		console.log(math.div(64).add(2).done())
  **/ 

import { Num, Nums } from "./types/Common";
import { Maths } from "./types/Maths"


class MathsImpl implements Maths {
	static instance: Maths | null;

	useChain: boolean = false;// 链式模式
	isInit: boolean = false;
	result: number = 0;

	
	constructor(useChain?: boolean) {
		this.isInit = false;
		this.useChain = !!useChain;
	}

	// keepOldChain, 保持原链继续运算, 暂不开发
	static newInstance(isUseChain?: boolean, keepOldChain?: boolean) : Maths {
		if(!MathsImpl.instance){
			MathsImpl.instance = new MathsImpl(isUseChain);
		}
        else if(typeof isUseChain === "boolean") {
            MathsImpl.instance.useChain = isUseChain;
        }
        if(keepOldChain !== true){
            MathsImpl.instance.isInit = false;
        }
		
		return MathsImpl.instance;
	}
	getInstance(isUseChain?: boolean): Maths {
		if(MathsImpl.instance){
			return MathsImpl.instance;
		}
		return MathsImpl.newInstance(typeof isUseChain === "boolean" ? isUseChain : this.useChain)
	}
	
	// Finished computed
	done(): number {
		const result: number = this.result;
		// Initialize this result;
		this.result = 0;
		this.isInit = false;
		return result;
	}
	
	base(num: number = 0): Maths {
		return this.chain(num);
	}
	
	// 链式调用
	chain(key: string | number, ...args: Nums): Maths {
		if(typeof key === "number"){						
			this.result = key || 0;
			this.isInit = true;
			return this.getInstance();
		}
        const that: any = this;
		if(this.useChain){
			const firstArg: number = this.isInit ? this.result : args.splice(0, 1)[0];
            const opts = [firstArg, ...args];
			this.result = that[key + "s"](...opts);
			this.isInit = true;
			return this.getInstance();
		}
		return that[key + "s"](...args);
	}
	// Addition
	add(...args: Nums): Maths {
		return this.chain("add", ...args);
	}
	// Subtraction
	sub(...args: Nums): Maths {
		return this.chain("sub", ...args);
	}
	// Multiplication
	mul(...args: Nums): Maths {
		return this.chain("mul", ...args);
	}
	// Division
	div(...args: Nums): Maths {
		return this.chain("div", ...args);
	}
	// Exponentiation
	pow(...args: Nums): Maths {
		return this.chain("pow", ...args);
	}
	// 除法
	divs(...args: Nums): number {
		if (args.length <= 1) return args[0] || 0;
		const [arg1, arg2, ...opts] = args;
		let result = 0,
			t1 = 0, 
			t2 = 0, 
			r1, r2
		; 
		try { 
			t1 = arg1.toString().split(".")[1].length;
		}catch(e){} 
		try{ 
			t2 = arg2.toString().split(".")[1].length;
		}catch(e){} 
		r1 = Number(arg1.toString().replace(".", ""));
		r2 = Number(arg2.toString().replace(".", "")); 
		result = this.muls( 
			( r1 / r2 ),
			Math.pow( 10, t2 - t1 ) 
		);
		if(opts.length){
			return this.divs(result, ...opts);;
		}
		return result; 
	}
	
	//乘法 
	muls(...args: Nums): number { 
		if (args.length <= 1) return args[0] || 0;
		const [arg1, arg2, ...opts] = args;
		let result = 0,
			m = 0,
			s1 = arg1.toString(),
			s2 = arg2.toString()
		; 
		try { 
			m += s1.split(".")[1].length;
		} catch (e) {} 
		try { 
			m += s2.split(".")[1].length;
		} catch (e) {} 
		result = Number(s1.replace(".","")) * Number(s2.replace(".","")) / Math.pow(10, m);
		if(opts.length){
			return this.muls(result, ...opts);
		}
		return result;
	} 
	//加法 
	adds(...args: Nums): number { 
		if (args.length <= 1) return args[0] || 0;
		const [arg1, arg2, ...opts] = args;
		let result = 0, r1, r2, m; 
		try {
			r1 = arg1.toString().split(".")[1].length;
		} catch(e) {
			r1 = 0;
		} 
		try {
			r2 = arg2.toString().split(".")[1].length;
		} catch(e) {
			r2 = 0;
		} 
		m = Math.pow(10,Math.max(r1,r2)); 
		result = ( arg1 * m + arg2 * m) / m;
		if(opts.length){
			return this.adds(result, ...opts);;
		}
		return result;
	} 
	//减法 
	subs(...args: Nums): number { 
		if (args.length <= 1) return args[0] || 0;
		const [arg1, arg2, ...opts] = args;
		let result = 0, r1, r2, m, n; 
		try {
			r1 = arg1.toString().split(".")[1].length;
		} catch(e) {
			r1 = 0;
		} 
		try {
			r2 = arg2.toString().split(".")[1].length;
		} catch(e) {
			r2 = 0;
		} 
		m = Math.pow(10, Math.max(r1, r2)); 
		n = (r1 >= r2) ? r1 : r2; 
		result = + ((arg1 * m - arg2 * m) / m).toFixed(n); 
		if(opts.length){
			return this.subs(result, ...opts);;
		}
		return result;
	}
	// 	幂运算 // 指数级别只支持整数
	pows(...args: Nums): number {
		if (args.length <= 1) return args[0] || 1;
		let [arg1, arg2, ...opts] = args;
		arg2 = Math.floor(arg2);
		let result = arg2 === 0 ? 1 : this.muls(...(new Array(arg2).fill(arg1)));
		if(opts.length){
			return this.muls(result, ...opts);
		}
		return result;
	}
}

export default MathsImpl.newInstance;