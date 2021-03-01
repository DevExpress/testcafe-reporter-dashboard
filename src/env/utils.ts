export function parseBooleanVariable (value: string): boolean {
    return value === 'false' || value === '0' ? false : !!value;
}
