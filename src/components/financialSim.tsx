

import { useState } from 'react';
import { LineChart, Line, CartesianGrid, YAxis, Legend, XAxis, Tooltip} from 'recharts';
import { Constants, FinancialSim } from './simRunner';
import { addCommas } from '@/utils/string';
import { ConstantsEditor } from './constsEditor';

export function FinancialSimSingular(){
    const [constsExpanded, setConstsExpanded] = useState(false);
    const [showNetWorth, setShowNetWorth] = useState(true);
    const [myConsts, setMyConsts] = useState(new Constants());

    const runner = new FinancialSim(myConsts);
    while(!runner.isFinished){
        runner.simulateMonth();
    }

    const chartData = runner.rows.map(row => ({
        name: `${row.year}-${row.month + 1}`,
        houseValue: row.houseValue,
        loanPrincipal: row.loanPrincipal,
        equity: row.equity,
        savings: row.savings,
        netWorth: showNetWorth ? row.equity + row.savings : undefined,
    }));

    const finalNetWorth = runner.rows[runner.rows.length - 1].equity + runner.rows[runner.rows.length - 1].savings;
    const payoffEl = chartData.findLast((el)=>{
                    return el.loanPrincipal >= 1
                })
    const payoff = payoffEl ? `${payoffEl.name}` : "Not paid off";

    return (
        <div>
            <div>
                <p>Financial Sim Component (singular)</p>
                <button onClick={() => setConstsExpanded(!constsExpanded)}>
                    {constsExpanded ? "Hide Constants" : "Show Constants"}
                </button>
                <button onClick={() => setShowNetWorth(!showNetWorth)}>
                    {showNetWorth ? "Hide Net Worth" : "Show Net Worth"}
                </button>
            </div>
            {constsExpanded && (
                <ConstantsEditor consts={myConsts} onChange={setMyConsts} />
            )}
            <LineChart width={800} height={400} data={chartData}>
                <Line type="monotone" dataKey="houseValue" stroke="#8884d8" />
                <Line type="monotone" dataKey="loanPrincipal" stroke="#82ca9d" />
                <Line type="monotone" dataKey="equity" stroke="#ffc658" />
                <Line type="monotone" dataKey="savings" stroke="#ff7300" />
                {showNetWorth && <Line type="monotone" dataKey="netWorth" stroke="#000000" />}
                <CartesianGrid stroke="#ccc" />
                <YAxis />
                <XAxis dataKey="name" />
                <Tooltip />
                <Legend />
            </LineChart>
            <div>
                <p>Loan paid off: {payoff}</p>
                <p>Final net worth: ${addCommas(finalNetWorth.toFixed(2))}</p>
            </div>
        </div>
    )
}