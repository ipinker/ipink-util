type Nums = Array<number>;

type Nums2Num = (...args: Nums) => number;
type Nums2Maths = (...args: Nums) => Maths;
interface Maths {
    useChain: boolean;
    isInit: boolean;
    result: number;
    getInstance: (isUseChain?: boolean) => Maths;
    done: () => number;
    base: (num: number) => Maths;
    chain: (key: string, ...args: Nums) => Maths | number;
    add: Nums2Maths;
    adds: Nums2Num;
    sub: Nums2Maths;
    subs: Nums2Num;
    mul: Nums2Maths;
    muls: Nums2Num;
    div: Nums2Maths;
    divs: Nums2Num;
    pow: Nums2Maths;
    pows: Nums2Num;
}

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

declare class MathsImpl implements Maths {
    static instance: Maths | null;
    useChain: boolean;
    isInit: boolean;
    result: number;
    constructor(useChain?: boolean);
    static newInstance(isUseChain?: boolean, keepOldChain?: boolean): Maths;
    getInstance(isUseChain?: boolean): Maths;
    done(): number;
    base(num?: number): Maths;
    chain(key: string | number, ...args: Nums): Maths;
    add(...args: Nums): Maths;
    sub(...args: Nums): Maths;
    mul(...args: Nums): Maths;
    div(...args: Nums): Maths;
    pow(...args: Nums): Maths;
    divs(...args: Nums): number;
    muls(...args: Nums): number;
    adds(...args: Nums): number;
    subs(...args: Nums): number;
    pows(...args: Nums): number;
}
declare const math: typeof MathsImpl.newInstance;

export { math };
