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