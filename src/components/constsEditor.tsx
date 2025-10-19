import { useEffect, useState } from "react";
import { Constants } from "./simRunner";

export function ConstantsEditor(props: {
    consts: Constants,
    onChange: (newConsts: Constants) => void
}) {
    const { consts, onChange } = props;

    function handleInputChange<K extends keyof Constants>(key: K, value: string) {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
            const newConsts = { ...consts, [key]: parsedValue };
            onChange(newConsts);
        }
    }

    return (
        <div>
            <h3>Simulation Constants</h3>
            {Object.entries(consts).map(([key, value]) => (
                <div key={key}>
                    <label>
                        {key}:
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => handleInputChange(key as keyof Constants, e.target.value)}
                        />
                    </label>
                </div>
            ))}
        </div>
    );
}

export function ConstantDeltaEditor(props: {
    baseConsts: Constants,
    onChange: (newDeltaConsts: Partial<Constants>) => void
}) {
    const { baseConsts, onChange } = props;
    const [modifiers, setModifiers] = useState<Partial<Constants>>({});
    const [newConstSelectedKey, setNewConstSelectedKey] = useState<keyof Constants | "">("");

    useEffect(() =>{
        onChange(modifiers);
    }, [baseConsts]);

    function handleInputChange<K extends keyof Constants>(key: K, value: string) {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
            const newModifiers = { ...modifiers, [key]: parsedValue };
            setModifiers(newModifiers);
            onChange(newModifiers);
        }
    }

    return (
        <div>
            <h3>Constant Modifiers</h3>
            <button>Reset Modifiers</button>
            <div style={{ display: "flex"}}>
                <select value={newConstSelectedKey} onChange={(e) => setNewConstSelectedKey(e.target.value as keyof Constants)}>
                    <option value="">Select Constant to Modify</option>
                    {Object.keys(baseConsts).map((key) => (
                        !modifiers.hasOwnProperty(key) && 
                        <option key={key} value={key}>{key}</option>
                    ))}
                </select>
                <button onClick={() => {
                    if (newConstSelectedKey) {
                        handleInputChange(newConstSelectedKey, baseConsts[newConstSelectedKey].toString());
                        setNewConstSelectedKey("");
                    }
                }}>Add Modifier</button>
            </div>
            <div>
                {Object.entries(modifiers).map(([key, value]) => (
                    <div key={key}>
                        <label>
                            {key} (base: {baseConsts[key as keyof Constants]}):
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => handleInputChange(key as keyof Constants, e.target.value)}
                            />
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
    

    
}