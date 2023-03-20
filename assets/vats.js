Shopify.formatMoney = function(cents, format) {
    if (typeof cents == 'string') { cents = cents.replace('.',''); }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || this.money_format);

    function defaultOption(opt, def) {
        return (typeof opt == 'undefined' ? def : opt);
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
        precision = defaultOption(precision, 2);
        thousands = defaultOption(thousands, ',');
        decimal   = defaultOption(decimal, '.');

        if (isNaN(number) || number == null) { return 0; }

        number = (number/100.0).toFixed(precision);

        var parts   = number.split('.'),
            dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
            cents   = parts[1] ? (decimal + parts[1]) : '';

        return dollars + cents;
    }

    switch(formatString.match(placeholderRegex)[1]) {
        case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
        case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
        case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
        case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);
}

const countries = [
    { country: 'United Kingdom', rate: 1.20 },
    { country: 'Spain', rate: 1.21 },
    { country: 'Poland', rate: 1.23 },
    { country: 'Italy', rate: 1.22 },
    { country: 'Germany', rate: 1.16 },
    { country: 'France', rate: 1.20 },
    { country: 'Czech Republic', rate: 1.21 },
    { country: 'Austria', rate: 1.20},
    { country: 'Netherlands', rate: 1.20},
    { country: 'Belgium', rate: 1.20},
    { country: 'Portugal', rate: 1.20},
    { country: 'Denmark', rate: 1.20},
    { country: 'Sweden', rate: 1.20},
    { country: 'Switzerland', rate: 1.20},
    { country: 'Ireland', rate: 1.20}
];

const vats = (country, price) => {
  /*
    if (country !== null) {
        let res = countries.filter(e => e.country.toLowerCase() === country.toLowerCase());

        if (res.length > 0) return `${Shopify.formatMoney(price)} | <strong>${Shopify.formatMoney(price * res[0].rate)} inc. VAT</strong>`;
    }
  */

    return `${Shopify.formatMoney(price)}`;
}