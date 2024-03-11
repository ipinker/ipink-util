/**
 * 常见的四种贷款计算
 * 先息后本, 等本等金, 等额本金, 等额本息
 * @Author: Gavin New
 * @Create: 2024/03/11 15:11
 */
export interface LoanOptionType {
    /** @desc 贷款日利率 **/
    dayRate?: number
    /** @desc 贷款年利率 **/ 
    yearRate?: number
    /** @desc 总金额 **/
    amount?: number 
    /** @desc 贷款期数 **/
    months?: number
}
export interface LoanPlanType {
    /** @desc 当前多少期 **/
    num?: number
    /** @desc 当期月供 **/
    total?: number | string
    /** @desc 当前期还款利息 **/
    interest?: number | string
    /** @desc 当前期还款本金 **/
    capital?: number | string
    /** @desc 剩余本金 **/
    remainingLoan?: number | string
}
export interface LoanResultType {
    /** @desc 还款计划 **/
    plan?: LoanPlanType[]
    /** @desc 贷款详情 **/
    info?: {
        /** @desc 最高月供 **/
        monthly?: number | string
        /** @desc 累计还款总额 **/
        totalRepayment?: number | string 
        /** @desc 累计还款利息总额 **/
        totalInterest?: number | string
    }
}
export class Loan {
	static instance: Loan | null = null;
	static getInstance() {
		if(!Loan.instance){
			Loan.instance = new Loan();
		}
		return Loan.instance;
	}
	
	constructor () {}
	
    /**
     * @desc 先息后本
     * @param options { LoanOptionType }
     * @return: { LoanResultType }
     */
	xxhb (options : LoanOptionType): LoanResultType {
        let { dayRate = 0, yearRate, amount = 0, months = 1 } = options
		if (!dayRate && !yearRate) {
            console.warn("日利率或者年化利率不能为空");
            return {} ;
        }
		if (!yearRate) yearRate = dayRate * 365;
		let objArray: LoanPlanType[] = new Array();
		let interestM: number = 0; // 月还款额
		let interestTotal: number = 0; // 累计还款总额
		let capital: number = 0; // 每月偿还本金0 最后一个月偿还全部本金
		let totalInterest: number = amount * yearRate / 12 * 0.01 * months; // 利息总额
		for (let i = 1; i <= months; i++) {
			let t1 = totalInterest / months; //第i月还款利息
			interestM = t1; //第i月还款额 = 每月偿还利息 最后一个月还款额 = 每月利息 + 贷款本金
			if (i == months) { // 最后一个月
				capital = amount; // 
				interestM = t1 + amount;
			}
			objArray[i - 1] = {
                num : i,
                total : (interestM).toFixed(2),
                interest : (interestM - capital).toFixed(2),
                capital : (capital).toFixed(2),
                remainingLoan : (amount - (capital * i)).toFixed(2),
            };
			interestTotal = interestTotal + interestM;
		}
	 
		interestTotal = (Math.round(interestTotal * 100)) / 100; //累计还款总额
		let monthly: string  = objArray[0]['total'] as string; //月供 最高月供
		let totalRepayment: string = "" + interestTotal; //累计还款总额
	 
		let resArray: LoanResultType = {
			'plan' : objArray,
			'info' : {
				monthly : parseFloat(monthly).toFixed(0),
				totalRepayment : parseFloat(totalRepayment).toFixed(0),
				totalInterest : parseFloat("" + totalInterest).toFixed(0)
			}
		};
	 
		return resArray;
	}
	
    /**
     * @desc 等本等金
     * @param options { LoanOptionType }
     * @return: { LoanResultType }
     */
	dbdx (options: LoanOptionType): LoanResultType {
        let { dayRate = 0, yearRate, amount = 0, months = 1 } = options;
		if (!dayRate && !yearRate) {
            console.warn("日利率或者年化利率不能为空");
            return {};
        }
		if (!yearRate) yearRate = dayRate * 365;
		
		let objArray: LoanPlanType[] = new Array();
		let interestM: number = 0; // 月还款额
		let interestTotal: number = 0; // 累计还款总额
		let capital: number = amount / months; // 每月偿还本金 = 贷款金额 除以 月份
		let totalInterest: number = amount * yearRate / 12 * 0.01 * months; // 利息总额
		for (let i = 1; i <= months; i++) {
			let t1 = totalInterest / months; //第i月还款利息
			interestM = capital + t1; //第i月还款额 = 每月偿还利息 + 每月偿还本金
			objArray[i - 1] = {
                num: i,
                total: (interestM).toFixed(2),
                interest: (interestM - capital).toFixed(2),
                capital: (capital).toFixed(2),
                remainingLoan: (amount - (capital * i)).toFixed(2),
            };
			interestTotal = interestTotal + interestM;
		}
	 
		interestTotal = (Math.round(interestTotal * 100)) / 100; //累计还款总额
		let monthly: string = objArray[0]['total'] as string; //月供 最高月供
		let totalRepayment: string = "" + interestTotal; //累计还款总额
	 
		let resArray: LoanResultType = {
			'plan' : objArray,
			'info' : {
				monthly : parseFloat(monthly).toFixed(0),
				totalRepayment : parseFloat(totalRepayment).toFixed(0),
				totalInterest : parseFloat("" + totalInterest).toFixed(0)
			}
		};
	 
		return resArray;
	}
	
    /**
     * @desc 等额本金
     * @param options { LoanOptionType }
     * @return: { LoanResultType }
     */
	debj (options: LoanOptionType): LoanResultType {
        let { dayRate = 0, yearRate, amount = 0, months = 1 } = options;
		if (!dayRate && !yearRate) {
            console.warn("日利率或者年化利率不能为空")
            return {};
        };
		if (!yearRate) yearRate = dayRate * 365;
	 
		let active = yearRate * 10 / 12 * 0.001;
		let objArray: LoanPlanType[] = new Array();
		let interestM: number = 0; //月还款额
		let interestTotal: number = 0; //累计还款总额
		let capital: number = amount / months; //每月偿还本金（元） months 3年36
		for (let i = 1; i <= months; i++) {
			let t1 = (amount - amount * (i - 1) / months) * active; //第i月还款利息
			interestM = amount / months + t1; //第i月还款额
			objArray[i - 1] = {
                num: i,
                total: (interestM).toFixed(2),
                interest: (interestM - capital).toFixed(2),
                capital: (capital).toFixed(2),
                remainingLoan: (amount - (capital * i)).toFixed(2),
            }; //声明二维，每一个一维数组里面的一个元素都是一个数组；
			if (+(objArray[i - 1]['remainingLoan'] || 0) <= 1) { //最后一个月出现小于1元的值
				objArray[i - 1]['remainingLoan'] = 0.00; //第i个月，剩余本金（元）
			}
			interestTotal = interestTotal + interestM;
		}
		interestTotal = (Math.round(interestTotal * 100)) / 100; //累计还款总额
		let monthly: string = objArray[0]['total'] as string; //月供 最高月供
		let totalRepayment: number = interestTotal; //累计还款总额
		let totalInterest: number = (totalRepayment - amount); //利息总额
		let resArray: LoanResultType = {
			plan : objArray,
			info : {
				monthly : parseFloat(monthly).toFixed(0),
				totalRepayment : parseFloat('' + totalRepayment).toFixed(0),
				totalInterest : parseFloat('' + totalInterest).toFixed(0)
			}
		};
	 
		return resArray;
	}
	
    /**
     * @desc 等额本息
     * @param options { LoanOptionType }
     * @return: { LoanResultType }
     */
	debx (options : LoanOptionType): LoanResultType {
        let { dayRate = 0, yearRate, amount = 0, months = 1 } = options;
		if (!dayRate && !yearRate) {
            console.warn("日利率或者年化利率不能为空")
            return {};
        };
		if (!yearRate) yearRate = dayRate * 365;
	 
		let active: number = yearRate * 10 / 12 * 0.001;
		let t1: number = Math.pow(1 + active, months);
		let t2: number = t1 - 1;
		let tmp: number = t1 / t2;
		let monthsratio: number = active * tmp; //月利率
		let monthsBack: string = (amount * monthsratio).toFixed(2); //每月支付本息
		yearRate = yearRate * 0.01; //百分比
		let yue_lilv = ((yearRate / 12));
		let objArray: LoanPlanType[] = new Array(); //等额本息结果二维数组
		let ljch_bj = 0; //累积偿还本金
		let pre_remainingLoan: number = 0; //上一个月剩余本金
		let i = 1;
		for (i = 1; i <= months; i++) { //等额本息
			objArray[i - 1] = {
                num: i,
                total: monthsBack,
                interest: 0,
                remainingLoan: 0
            }; //声明二维，每一个一维数组里面的一个元素都是一个数组；
			if (i == 1) { //第一个月
				pre_remainingLoan = amount;
			} else {
				pre_remainingLoan = +(objArray[i - 2]['remainingLoan'] || 0);
			}
			objArray[i - 1]['interest'] = (pre_remainingLoan * yue_lilv).toFixed(2); //第i个月，偿还利息（元）每月付息额 =（贷款本金-已还清贷款本金）×月利率
			let capital: number = +(objArray[i - 1]['total'] as string) - (+(objArray[i - 1]['interest'] as string)); //第i个月，偿还本金（元）
			objArray[i - 1]['capital'] = capital.toFixed(2);
			ljch_bj += capital;
			let remainingLoan = (amount - ljch_bj);
			objArray[i - 1]['remainingLoan'] = remainingLoan.toFixed(2); //第i个月，剩余本金（元）
			if (remainingLoan <= 1) { //最后一个月出现小于1元的值
				objArray[i - 1]['remainingLoan'] = 0.00; //第i个月，剩余本金（元）
			}
		}
		let monthly = monthsBack; //月供
		let totalRepayment = (+monthsBack) * months; //累计还款总额
		let totalInterest = totalRepayment - amount; //利息总额
		
		let resArray = {
			plan : objArray,
			info : {
				monthly : parseFloat(monthly).toFixed(0),
				totalRepayment : parseFloat('' + totalRepayment).toFixed(0),
				totalInterest : parseFloat('' + totalInterest).toFixed(0)
			}
		};
		return resArray;
	}
}


export default Loan.getInstance();