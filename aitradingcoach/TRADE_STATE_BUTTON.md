# Trade State Button Feature

## Overview
The Trade State Button provides a simple way to track your trading activity directly in the AI Trading Coach interface. It allows you to enter and exit trades with one click, and provide feedback on trade outcomes.

## Features

### 🎯 Single Toggle Button
- **📈 Enter Trade**: Green button to start a new trade
- **📉 Exit Trade**: Red button to close the current trade
- Automatically captures entry/exit prices from real-time market data
- **✏️ Manual Price Editing**: Edit prices before saving to database
- **📊 Quantity Tracking**: Enter share quantity for accurate P&L calculation
- Stores trade data in the `trades` table

### 👍 Feedback System
After exiting a trade, you can provide feedback:
- **👍 Win**: Trade was profitable
- **👎 Loss**: Trade resulted in a loss  
- **🤝 Breakeven**: Trade broke even

### 🤖 AI Integration
- Trade entries/exits are automatically logged as system messages
- AI can reference your trading history for better coaching
- Feedback helps the AI understand your trading patterns

## How It Works

1. **Start a Ticker Session**: Use the ticker detection button to start watching a stock
2. **Enter Trade**: Click the green "📈 Enter Trade" button when you want to enter
3. **Edit Price (Optional)**: Review and edit the captured price before confirming
4. **Exit Trade**: Click the red "📉 Exit Trade" button when you want to exit
5. **Edit Exit Price (Optional)**: Review and edit the exit price, see P&L preview
6. **Enter Quantity**: Specify the number of shares traded for accurate P&L calculation
7. **Provide Feedback**: Choose 👍 👎 🤝 to indicate how the trade went
8. **AI Learning**: The AI uses this data to provide better coaching

## Price Editing Features

- **Automatic Capture**: Prices are automatically captured from real-time market data
- **Manual Override**: Edit prices before saving to account for slippage or timing differences
- **P&L Preview**: See calculated profit/loss when editing exit prices
- **Edit Existing Trades**: Click the edit icon next to entry price to modify after creation
- **Cancel Option**: Cancel price editing to return to previous state

## Quantity & P&L Features

- **Quantity Entry**: Specify the number of shares traded after exit price confirmation
- **Automatic P&L Calculation**: P&L = (Exit Price - Entry Price) × Quantity for long trades
- **Real-time P&L Preview**: See P&L calculation as you adjust prices and quantity
- **Accurate Tracking**: All calculations use actual trade quantities for precise results

## Database Schema

The feature uses the existing `trades` table with these key fields:
- `entry_price`: Price when trade was entered
- `exit_price`: Price when trade was exited  
- `quantity`: Number of shares traded
- `pnl`: Calculated profit/loss (entry_price - exit_price) × quantity
- `trade_result`: User feedback (win/loss/breakeven)
- `feedback_timestamp`: When feedback was provided

## UI Location

The Trade State Button appears in the chat header when a ticker session is active. It's positioned next to the AI thinking indicator for easy access during trading.

## Benefits

- **Simple Tracking**: No need to manually log trades
- **Real-time Data**: Uses live market prices from Polygon.io
- **AI Context**: Helps the AI understand your trading style
- **Performance Analysis**: Track your win rate and performance over time
- **Seamless Integration**: Works with existing screenshot analysis and chat features 