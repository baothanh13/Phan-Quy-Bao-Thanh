import { useState, useRef, useEffect } from "react";
import "./CurrencyInput.css";

const CurrencyInput = ({
  label,
  amount,
  onAmountChange,
  selectedToken,
  onTokenChange,
  tokens,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      onAmountChange(value);
    }
  };

  const handleTokenSelect = (token) => {
    onTokenChange(token);
    setIsOpen(false);
    setSearchQuery("");
  };

  const filteredTokens = tokens.filter((token) =>
    token.currency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTokenIcon = (currency) => {
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency}.svg`;
  };

  return (
    <div className="currency-input">
      <div className="currency-input-header">
        <label>{label}</label>
        {selectedToken && <span className="balance">Balance: 0.00</span>}
      </div>

      <div className="currency-input-body">
        <input
          type="text"
          className="amount-input"
          placeholder="0.0"
          value={amount}
          onChange={handleAmountChange}
          disabled={disabled}
        />

        <div className="token-selector" ref={dropdownRef}>
          <button
            className="token-button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
          >
            {selectedToken ? (
              <>
                <img
                  src={getTokenIcon(selectedToken.currency)}
                  alt={selectedToken.currency}
                  className="token-icon"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <span className="token-symbol">{selectedToken.currency}</span>
              </>
            ) : (
              <span className="token-symbol">Select</span>
            )}
            <span className="dropdown-arrow">▼</span>
          </button>

          {isOpen && (
            <div className="token-dropdown">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="token-list">
                {filteredTokens.length > 0 ? (
                  filteredTokens.map((token) => (
                    <div
                      key={token.currency}
                      className={`token-item ${
                        selectedToken?.currency === token.currency
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleTokenSelect(token)}
                    >
                      <div className="token-info">
                        <img
                          src={getTokenIcon(token.currency)}
                          alt={token.currency}
                          className="token-icon"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <div className="token-details">
                          <span className="token-name">{token.currency}</span>
                          <span className="token-price">
                            ${token.price.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">No tokens found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrencyInput;
