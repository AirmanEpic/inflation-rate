

import { useState } from 'react';
import { LineChart, Line, CartesianGrid, YAxis, Legend, XAxis, Tooltip} from 'recharts';
import { Constants, FinancialSim } from './simRunner';
import { addCommas } from '@/utils/string';
import { ConstantDeltaEditor, ConstantsEditor } from './constsEditor';

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

    const finalEl = runner.rows.at(-1);
    if (!finalEl) {
        return <div>No data</div>;
    }

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
                <p>Final net worth: ${addCommas((finalEl.equity + finalEl.savings).toFixed(2))}</p>
                <p>Final savings: ${addCommas((finalEl.savings).toFixed(2))}</p>
                <p>Final houseValue: ${addCommas(finalEl.houseValue.toFixed(2))}</p>
            </div>
        </div>
    )
}

export type FinancialSimPluralSS = {
    name: string;
    modifiers: Partial<Constants>;
}

export function FinancialSimPlural(
){
    const [constsExpanded, setConstsExpanded] = useState(false);
    const [baseConsts, setBaseConsts] = useState<Constants>(new Constants());
    const [sampleSets, setSampleSets] = useState<FinancialSimPluralSS[]>([]);

    const runners = sampleSets.map((sampleSet:FinancialSimPluralSS) => {
        const consts = {...baseConsts};
        Object.assign(consts, sampleSet.modifiers);
        const runner = new FinancialSim(consts);
        while(!runner.isFinished){
            runner.simulateMonth();
        }
        return { name: sampleSet.name, runner };
    });

    const chartData = runners[0]?.runner.rows.map((_, index) => {
        const dataPoint:{
            name: string;
            [key: string]: number | string;
        } = { name: `${runners[0].runner.rows[index].year}-${runners[0].runner.rows[index].month + 1}` };
        runners.forEach(({ name, runner }) => {
            dataPoint[`${name}-Savings`] = runner.rows[index].savings;
        });
        return dataPoint;
    }) || [];

    return (
        <div>
            <div>
                <p>Financial Sim Component (plural)</p>
                <button onClick={() => setConstsExpanded(!constsExpanded)}>
                    {constsExpanded ? "Hide Constants" : "Show Constants"}
                </button>
            </div>
            {constsExpanded && (
                <div>
                    <h3>Base Constants</h3>
                    <ConstantsEditor consts={baseConsts} onChange={
                        (newConsts) => {
                            setBaseConsts(newConsts);
                            const oldSampleSets = [...sampleSets];
                            // Re-apply modifiers over new base constants
                            const newSampleSets = oldSampleSets.map((sampleSet) => {
                                const thisNewConsts = { ...newConsts };
                                Object.assign(thisNewConsts, sampleSet.modifiers);
                                return {
                                    name: sampleSet.name,
                                    modifiers: sampleSet.modifiers
                                };
                            });
                            
                            setSampleSets(newSampleSets); //trigger re-simulation
                        }
                    } />
                </div>
            )}
            <h3>Sample Sets</h3>
            <div style={{display:"flex"}}>{sampleSets.map((sampleSet, index) => (
                <div key={index} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
                    <input type="text" value={sampleSet.name} onChange={(e) => {
                        const newSampleSets = [...sampleSets];
                        newSampleSets[index].name = e.target.value;
                        setSampleSets(newSampleSets);
                    }} placeholder="Sample Set Name" />
                    <ConstantDeltaEditor baseConsts={baseConsts} onChange={(newModifiers) => {
                        const newSampleSets = [...sampleSets];
                        newSampleSets[index].modifiers = newModifiers;
                        setSampleSets(newSampleSets);
                    }} />
                </div>
            ))}</div>
            <button onClick={() => setSampleSets([...sampleSets, { name: `Sample ${sampleSets.length + 1}`, modifiers: {} }])}>
                Add Sample Set
            </button>
            <LineChart width={800} height={400} data={chartData}>
                {runners.map(({ name }) => (
                    <Line key={name} type="monotone" dataKey={`${name}-Savings`} stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                ))}
                <CartesianGrid stroke="#ccc" />
                <YAxis />
                <XAxis dataKey="name" />
                <Tooltip />
                <Legend />
            </LineChart>
            <div>
                {runners.map(({ name, runner }) => {
                    const finalEl = runner.rows.at(-1);
                    if (!finalEl) {
                        return <div key={name}>No data for {name}</div>;
                    }
                    const payoffEl = runner.rows.findLast((el)=>{
                        return el.loanPrincipal >= 1
                    })
                    const payoff = payoffEl ? `${payoffEl.year}-${payoffEl.month + 1}` : "Not paid off";
                    return (
                        <div key={name} style={{ border: "1px solid gray", margin: "5px", padding: "5px" }}>
                            <h4>{name}</h4>
                            <p>Loan paid off: {payoff}</p>
                            <p>Final net worth: ${addCommas((finalEl.equity + finalEl.savings).toFixed(2))}</p>
                            <p>Final savings: ${addCommas((finalEl.savings).toFixed(2))}</p>
                            <p>Final houseValue: ${addCommas(finalEl.houseValue.toFixed(2))}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}