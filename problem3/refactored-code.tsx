// Refactored version with fixes

import React, { useMemo } from "react";

// Added missing blockchain property
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

enum Blockchain {
  Osmosis = "Osmosis",
  Ethereum = "Ethereum",
  Arbitrum = "Arbitrum",
  Zilliqa = "Zilliqa",
  Neo = "Neo",
}

const BLOCKCHAIN_PRIORITIES: Record<Blockchain, number> = {
  [Blockchain.Osmosis]: 100,
  [Blockchain.Ethereum]: 50,
  [Blockchain.Arbitrum]: 30,
  [Blockchain.Zilliqa]: 20,
  [Blockchain.Neo]: 20,
};

const WalletPage: React.FC<BoxProps> = (props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: Blockchain): number => {
    return BLOCKCHAIN_PRIORITIES[blockchain] ?? -99;
  };

  const formattedBalances = useMemo(() => {
    return balances
      .map((balance) => ({
        ...balance,
        priority: getPriority(balance.blockchain),
      }))
      .filter((balance) => balance.priority > -99 && balance.amount > 0)
      .sort((a, b) => b.priority - a.priority)
      .map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(8),
        usdValue: (prices[balance.currency] ?? 0) * balance.amount,
      }));
  }, [balances, prices]);

  // Using stable keys for better React reconciliation
  const rows = formattedBalances.map((balance) => (
    <WalletRow
      className={classes.row}
      key={`${balance.blockchain}-${balance.currency}`}
      amount={balance.amount}
      usdValue={balance.usdValue}
      formattedAmount={balance.formatted}
    />
  ));

  return <div {...props}>{rows}</div>;
};

export default WalletPage;

/* 
Main improvements:
- Fixed the critical bugs (undefined variable, inverted logic, type errors)
- Better performance by computing priority once instead of repeatedly
- Proper TypeScript types
- Stable React keys
- Added null checks
*/
