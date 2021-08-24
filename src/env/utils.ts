export function parseBooleanVariable (value: string | undefined): boolean {
    return value === 'false' || value === '0' ? false : !!value;
}

export function parseNumber (value: string | undefined): number | null {
    const parsed = value === void 0 ? Number.NaN : Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) return null;

    return parsed;
}

export function getEnvVariable (varName: string, onVarEmpty = () => void 0) {
    const envVarValue = process.env[varName];

    return envVarValue === void 0 ? onVarEmpty() : envVarValue;
}
