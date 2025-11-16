import { useState, useEffect } from "react";
import "./SwapForm.css";
import CurrencyInput from "./CurrencyInput";
import SwapButton from "./SwapButton";

const SwapForm = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const [error, setError] = useState("");
  const [swapAnimation, setSwapAnimation] = useState(false);

  // Fetch token prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          "https://interview.switcheo.com/prices.json"
        );
        const data = await response.json();

        // Create a price map and filter tokens with prices
        const priceMap = {};
        const tokensWithPrices = [];

        data.forEach((item) => {
          if (item.price && parseFloat(item.price) > 0) {
            const key = item.currency;
            if (
              !priceMap[key] ||
              new Date(item.date) > new Date(priceMap[key].date)
            ) {
              priceMap[key] = item;
            }
          }
        });

        // Convert to array and sort
        Object.values(priceMap).forEach((item) => {
          tokensWithPrices.push({
            currency: item.currency,
            price: parseFloat(item.price),
          });
        });

        tokensWithPrices.sort((a, b) => a.currency.localeCompare(b.currency));

        setTokens(tokensWithPrices);

        // Set default tokens
        if (tokensWithPrices.length >= 2) {
          setFromToken(
            tokensWithPrices.find((t) => t.currency === "USDC") ||
              tokensWithPrices[0]
          );
          setToToken(
            tokensWithPrices.find((t) => t.currency === "SWTH") ||
              tokensWithPrices[1]
          );
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching prices:", err);
        setError("Failed to load token prices. Please try again later.");
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Calculate exchange rate
  const calculateExchange = (amount, from, to) => {
    if (!amount || !from || !to || !from.price || !to.price) return "";

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return "";

    const fromValue = numAmount * from.price;
    const toValue = fromValue / to.price;

    return toValue.toFixed(6);
  };

  // Handle from amount change
  const handleFromAmountChange = (value) => {
    setFromAmount(value);
    setError("");

    if (value && fromToken && toToken) {
      const calculated = calculateExchange(value, fromToken, toToken);
      setToAmount(calculated);
    } else {
      setToAmount("");
    }
  };

  // Handle to amount change
  const handleToAmountChange = (value) => {
    setToAmount(value);
    setError("");

    if (value && fromToken && toToken) {
      const calculated = calculateExchange(value, toToken, fromToken);
      setFromAmount(calculated);
    } else {
      setFromAmount("");
    }
  };

  // Handle token swap
  const handleSwapTokens = () => {
    setSwapAnimation(true);
    setTimeout(() => {
      const tempToken = fromToken;
      const tempAmount = fromAmount;

      setFromToken(toToken);
      setToToken(tempToken);
      setFromAmount(toAmount);
      setToAmount(tempAmount);

      setSwapAnimation(false);
    }, 300);
  };

  // Handle from token change
  const handleFromTokenChange = (token) => {
    if (token.currency === toToken?.currency) {
      setToToken(fromToken);
    }
    setFromToken(token);

    if (fromAmount) {
      const calculated = calculateExchange(fromAmount, token, toToken);
      setToAmount(calculated);
    }
  };

  // Handle to token change
  const handleToTokenChange = (token) => {
    if (token.currency === fromToken?.currency) {
      setFromToken(toToken);
    }
    setToToken(token);

    if (fromAmount) {
      const calculated = calculateExchange(fromAmount, fromToken, token);
      setToAmount(calculated);
    }
  };

  // Handle swap execution
  const handleSwap = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!fromToken || !toToken) {
      setError("Please select both tokens");
      return;
    }

    // Simulate swap success
    alert(
      `Swap successful! ${fromAmount} ${fromToken.currency} → ${toAmount} ${toToken.currency}`
    );
    setFromAmount("");
    setToAmount("");
    setError("");
  };

  const exchangeRate =
    fromToken && toToken && fromToken.price && toToken.price
      ? (fromToken.price / toToken.price).toFixed(6)
      : null;

  if (loading) {
    return (
      <div className="swap-form">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading tokens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swap-form">
      <div className="swap-container">
        <CurrencyInput
          label="From"
          amount={fromAmount}
          onAmountChange={handleFromAmountChange}
          selectedToken={fromToken}
          onTokenChange={handleFromTokenChange}
          tokens={tokens}
          disabled={loading}
        />

        <SwapButton onClick={handleSwapTokens} animate={swapAnimation} />

        <CurrencyInput
          label="To"
          amount={toAmount}
          onAmountChange={handleToAmountChange}
          selectedToken={toToken}
          onTokenChange={handleToTokenChange}
          tokens={tokens}
          disabled={loading}
        />

        {exchangeRate && fromToken && toToken && (
          <div className="exchange-rate">
            1 {fromToken.currency} = {exchangeRate} {toToken.currency}
          </div>
        )}

        {error && <div className="error-message">⚠️ {error}</div>}

        <button
          className="swap-execute-button"
          onClick={handleSwap}
          disabled={!fromAmount || !toAmount || loading}
        >
          Swap
        </button>
      </div>
    </div>
  );
};

export default SwapForm;
