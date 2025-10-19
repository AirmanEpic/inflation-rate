export class Constants {
    startYear = 2023;
    endYear = 2050;
    initialOwedOnHouse = 500000;
    inflationRateBase = 0.03;
    inflationRateVariation = 0.005;
    loanInterestRateBase = 0.035;
    loanRepaymentYears = 30;
    loanBasePayments = 2500;
    loanExtraPayment = 0;
    incomeMonthlyBase = 8000;
    savingsInterestRateBase = 0.01;
    incomeYearlyGrowthRate = 0.03;
    monthlyExpenses = 3000;
}

export interface DataPacket {
    year: number;
    month: number;
    loanPrincipal: number;
    savings: number;
    houseValue: number;
    equity: number;
    inflationMultiplier: number;
}

export class FinancialSim {
    constants: Constants;
    runningLoanPrincipal: number
    runningSavings: number
    runningYear: number
    runningMonth: number
    runningHouseValue: number
    runningEquity: number
    runningInflation: number
    isFinished = false;
    rows: DataPacket[] = [];

    constructor(consts: Constants) {
        this.constants = consts
        this.runningLoanPrincipal = this.constants.initialOwedOnHouse;
        this.runningSavings = 0;
        this.runningYear = this.constants.startYear;
        this.runningMonth = 0;
        this.runningHouseValue = this.constants.initialOwedOnHouse;
        this.runningEquity = 0;
        this.runningInflation = 1;
    }

    simulateMonth() {
        //the current inflation rate - varies slightly month to month. The average should be close to the base rate, but the inflationRateVariation adds some randomness.
        const runningInflationRateThisMonth = this.constants.inflationRateBase + (Math.random() * 2 - 1) * this.constants.inflationRateVariation;

        //update running inflation multiplier; compounds monthly. 
        this.runningInflation *= (1 + runningInflationRateThisMonth / 12);
        this.runningHouseValue = this.constants.initialOwedOnHouse * this.runningInflation;

        // If we've paid off the house loan, then we *only* get income.
        if (this.runningLoanPrincipal <= 0) {
            const monthlyIncome = this.constants.incomeMonthlyBase * (1 + this.constants.incomeYearlyGrowthRate) ** (this.runningYear - this.constants.startYear);
            this.runningSavings += monthlyIncome;
            this.runningSavings -= this.constants.monthlyExpenses * this.runningInflation; //expenses scale with inflation
            this.runningSavings *= (1 + this.constants.savingsInterestRateBase / 12);
        } else {
            //calculate monthly loan interest
            const monthlyInterest = this.runningLoanPrincipal * (this.constants.loanInterestRateBase / 12);

            //calculate this month's principal payment
            const monthlyPrincipalPayment = Math.min(
                this.constants.loanBasePayments + this.constants.loanExtraPayment - monthlyInterest,
                this.runningLoanPrincipal
            )

            //update running loan principal
            this.runningLoanPrincipal -= monthlyPrincipalPayment;

            //update running equity
            this.runningEquity = this.runningHouseValue - this.runningLoanPrincipal;

            const monthlyIncome = this.constants.incomeMonthlyBase * (1 + this.constants.incomeYearlyGrowthRate) ** (this.runningYear - this.constants.startYear);

            //update running savings
            //update running savings
            this.runningSavings += monthlyIncome - (this.constants.loanBasePayments + this.constants.loanExtraPayment);
            this.runningSavings -= this.constants.monthlyExpenses * this.runningInflation; //expenses scale with inflation
            this.runningSavings *= (1 + this.constants.savingsInterestRateBase / 12);
        }

        //advance month/year
        this.runningMonth += 1;
        if (this.runningMonth >= 12) {
            this.runningMonth = 0;
            this.runningYear += 1;
        }

        if (this.runningYear > this.constants.endYear) {
            this.isFinished = true;
        }

        //store data packet for this month
        this.rows.push({
            year: this.runningYear,
            month: this.runningMonth,
            loanPrincipal: this.runningLoanPrincipal,
            savings: this.runningSavings,
            houseValue: this.runningHouseValue,
            equity: this.runningEquity,
            inflationMultiplier: this.runningInflation
        });
    }
}