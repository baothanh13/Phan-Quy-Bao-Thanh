//  ORIGINAL CODE (WITH ISSUES)
// This file demonstrates all the problems found in the original code

interface WalletBalance {
  currency: string;
  amount: number;
  //  ISSUE #3: Missing blockchain property that's used in getPriority
}

interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

//  ISSUE #14: Empty interface extension - no added value
interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  //  ISSUE #13: children extracted but never used
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  //  ISSUE #10: Using 'any' type - defeats TypeScript's purpose
  //  ISSUE #11: Magic numbers - hard-coded values without explanation
  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  //  ISSUE #4: prices in dependency array but never used
  const sortedBalances = useMemo(() => {
    return (
      balances
        .filter((balance: WalletBalance) => {
          const balancePriority = getPriority(balance.blockchain);
          //  ISSUE #1: CRITICAL BUG - lhsPriority is undefined! Should be balancePriority
          if (lhsPriority > -99) {
            //  ISSUE #2: INVERTED LOGIC - keeping balances with amount <= 0
            if (balance.amount <= 0) {
              return true;
            }
          }
          //  ISSUE #2: Returns false for valid balances (should return true)
          return false;
        })
        //  ISSUE #5: Redundant getPriority calls - already computed in filter
        .sort((lhs: WalletBalance, rhs: WalletBalance) => {
          const leftPriority = getPriority(lhs.blockchain);
          const rightPriority = getPriority(rhs.blockchain);
          if (leftPriority > rightPriority) {
            return -1;
          } else if (rightPriority > leftPriority) {
            return 1;
          }
          //  ISSUE #6: Missing return 0 for equal priorities - returns undefined
        })
    );
  }, [balances, prices]);

  //  ISSUE #7: WASTED COMPUTATION - formattedBalances computed but NEVER USED
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      //  ISSUE #12: toFixed() without decimals - loses precision for crypto
      formatted: balance.amount.toFixed(),
    };
  });

  //  ISSUE #8: Type mismatch - sortedBalances is WalletBalance[] not FormattedWalletBalance[]
  // This means balance.formatted will be undefined!
  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      //  ISSUE #15: No null check - prices[balance.currency] might be undefined
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          //  ISSUE #9: ANTI-PATTERN - Using index as key
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          // This will be undefined because sortedBalances doesn't have formatted property
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};

/* 
SUMMARY OF CRITICAL ISSUES:
1. Runtime Error: lhsPriority is not defined
2. Logic Error: Filter logic is completely inverted
3. Type Error: Missing blockchain in WalletBalance interface
4. Type Error: Using FormattedWalletBalance type on WalletBalance data
5. Performance: Redundant getPriority calls (O(n log n) waste)
6. Performance: Unused formattedBalances computation (O(n) waste)
7. Performance: Wrong useMemo dependencies
8. Bug: Incomplete sort comparison (missing return 0)
9. Anti-pattern: Index as React key
10. Code Quality: Multiple type safety and maintainability issues
*/
