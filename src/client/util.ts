export function formatNumber(
    value: number,
    options: {
        decimals?: number;
        thousandsSeparator?: string;
        decimalSeparator?: string;
        currency?: string;
        currencyPosition?: 'before' | 'after';
    } = {}
): string {
    const {
        decimals = 0,
        thousandsSeparator = ',',
        decimalSeparator = '.',
        currency = '',
        currencyPosition = 'before',
    } = options;

    // Handle NaN or invalid numbers
    if (isNaN(value)) return 'NaN';

    // Round to specified decimals
    const fixedValue = value.toFixed(decimals);

    // Split into integer and decimal parts
    const [integerPart, decimalPart] = fixedValue.split('.');

    // Add thousands separators
    const formattedInteger = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        thousandsSeparator
    );

    // Construct the number part
    let result = decimals > 0
        ? `${formattedInteger}${decimalSeparator}${decimalPart}`
        : formattedInteger;

    // Add currency symbol
    if (currency) {
        result = currencyPosition === 'before'
            ? `${currency} ${result}`
            : `${result} ${currency}`;
    }

    return result;
}
