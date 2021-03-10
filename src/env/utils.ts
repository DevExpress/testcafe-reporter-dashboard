export function parseBooleanVariable (value: string | undefined): boolean {
    return value === 'false' || value === '0' ? false : !!value;
}
