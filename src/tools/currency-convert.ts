import { tool, ParameterType } from "@optimizely-opal/opal-tools-sdk";

interface CurrencyConverterParams {
  usdAmount: number;
}

interface ExchangeRate {
  currency: string;
  rate: number;
  convertedAmount: number;
}

interface CurrencyConverterResult {
  originalAmount: number;
  baseCurrency: string;
  conversions: ExchangeRate[];
  timestamp: string;
}
async function currencyConverter(params: CurrencyConverterParams): Promise<CurrencyConverterResult> {
  try {
    const { usdAmount } = params;
    
    if (usdAmount < 0) {
      throw new Error('Amount must be a positive number');
    }

    // Using a free exchange rate API (exchangerate-api.com)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    const rates = data.rates;

    const targetCurrencies = ['GBP', 'EUR', 'CAD', 'CNY'];
    const conversions: ExchangeRate[] = [];

    for (const currency of targetCurrencies) {
      if (rates[currency]) {
        const rate = rates[currency];
        const convertedAmount = parseFloat((usdAmount * rate).toFixed(2));
        
        conversions.push({
          currency,
          rate: parseFloat(rate.toFixed(4)),
          convertedAmount
        });
      }
    }

    return {
      originalAmount: usdAmount,
      baseCurrency: 'USD',
      conversions,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    throw new Error(`Currency conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
tool({
  name: 'RW-currency-converter',
  description: 'Converts USD amount to GBP, EUR, CAD, and CNY using latest exchange rates',
    parameters: [
      {
        name: "usdAmount",
        type: ParameterType.Number,
        description: "The amount in USD to convert",
        required: true,
      }

    ]
})(currencyConverter);