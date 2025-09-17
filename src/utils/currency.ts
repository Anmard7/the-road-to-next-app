import { MyBig } from '@/lib/big';

export const toCent = (amount: number) => new MyBig(amount).mul(100).toNumber();

export const fromCent = (amount: number) =>
  new MyBig(amount).div(100).toNumber();

export const toCurrencyFromCents = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(fromCent(amount));
