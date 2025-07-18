import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ThumbsUp, ThumbsDown, Handshake, Edit, X, Check } from 'lucide-react';
import { DatabaseService, supabase } from '../lib/supabase';

interface TradeStateButtonProps {
  currentTicker: string | null;
  tickerSessionId: string | null;
  userId: string;
  onTradeStateChange?: (isInTrade: boolean) => void;
}

type TradeState = 'idle' | 'in_trade' | 'feedback' | 'editing_entry' | 'editing_exit' | 'entering_quantity';
type TradeResult = 'win' | 'loss' | 'breakeven';

interface Trade {
  id: string;
  ticker: string;
  trade_type: 'long' | 'short';
  entry_price: number;
  exit_price?: number;
  quantity?: number;
  entry_time: string;
  exit_time?: string;
  pnl?: number;
  strategy?: string;
  notes?: string;
  trade_result?: 'win' | 'loss' | 'breakeven';
  feedback_timestamp?: string;
  trade_data?: Record<string, any>;
}

export default function TradeStateButton({ 
  currentTicker, 
  tickerSessionId, 
  userId, 
  onTradeStateChange 
}: TradeStateButtonProps) {
  const [tradeState, setTradeState] = useState<TradeState>('idle');
  const [currentTrade, setCurrentTrade] = useState<Trade | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingQuantity, setEditingQuantity] = useState<number>(100);
  const [pendingTradeData, setPendingTradeData] = useState<{
    entry_price?: number;
    exit_price?: number;
    action: 'enter' | 'exit';
  } | null>(null);

  // Check for existing active trade on mount and ticker change
  useEffect(() => {
    if (currentTicker && tickerSessionId) {
      checkForActiveTrade();
    } else {
      setTradeState('idle');
      setCurrentTrade(null);
    }
  }, [currentTicker, tickerSessionId]);

  const checkForActiveTrade = async () => {
    if (!currentTicker || !tickerSessionId) return;
    
    try {
      const { data: activeTrade, error } = await supabase
        .from('trades')
        .select('*')
        .eq('ticker', currentTicker)
        .eq('ticker_session_id', tickerSessionId)
        .is('exit_time', null)
        .single();

      if (activeTrade && !error) {
        setCurrentTrade(activeTrade);
        setTradeState('in_trade');
        onTradeStateChange?.(true);
      } else {
        setTradeState('idle');
        setCurrentTrade(null);
        onTradeStateChange?.(false);
      }
    } catch (error) {
      console.error('Error checking for active trade:', error);
      setTradeState('idle');
      setCurrentTrade(null);
      onTradeStateChange?.(false);
    }
  };

  const handleEnterTrade = async () => {
    if (!currentTicker || !tickerSessionId || isLoading) return;
    
    setIsLoading(true);
    try {
      // Get current market price
      const { data: marketData } = await supabase
        .from('market_data')
        .select('price')
        .eq('ticker', currentTicker)
        .single();

      const entryPrice = marketData?.price || 0;
      
      // Show price editing modal
      setEditingPrice(entryPrice);
      setPendingTradeData({ entry_price: entryPrice, action: 'enter' });
      setTradeState('editing_entry');
      
    } catch (error) {
      console.error('Error getting market price:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEntry = async () => {
    if (!pendingTradeData?.entry_price || !currentTicker || !tickerSessionId) return;
    
    setIsLoading(true);
    try {
      if (currentTrade) {
        // Editing existing trade
        const { error } = await supabase
          .from('trades')
          .update({
            entry_price: editingPrice,
            notes: `${currentTrade.notes || ''}\n\nEntry price updated to $${editingPrice.toFixed(2)}`
          })
          .eq('id', currentTrade.id);

        if (error) throw error;

        // Update local state
        setCurrentTrade({ ...currentTrade, entry_price: editingPrice });
        setTradeState('in_trade');
        setPendingTradeData(null);

        // Send AI message about price update
        await DatabaseService.saveChatMessage({
          user_id: userId,
          message_type: 'system',
          content: `✏️ Updated entry price to $${editingPrice.toFixed(2)}`,
          ticker: currentTicker || undefined
        });
      } else {
        // Creating new trade
        const { data: newTrade, error } = await supabase
          .from('trades')
          .insert({
            user_id: userId,
            ticker_session_id: tickerSessionId,
            ticker: currentTicker,
            trade_type: 'long', // Default to long, could be made configurable
            entry_price: editingPrice,
            quantity: editingQuantity,
            entry_time: new Date().toISOString(),
            strategy: 'AI Coach Entry',
            notes: 'Entry triggered via UI button'
          })
          .select()
          .single();

        if (error) throw error;

        setCurrentTrade(newTrade);
        setTradeState('in_trade');
        setPendingTradeData(null);
        onTradeStateChange?.(true);

        // Send AI message about trade entry
        await DatabaseService.saveChatMessage({
          user_id: userId,
          message_type: 'system',
          content: `📈 Entered ${currentTicker} at $${editingPrice.toFixed(2)}`,
          ticker: currentTicker || undefined
        });
      }

    } catch (error) {
      console.error('Error handling entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitTrade = async () => {
    if (!currentTrade || isLoading) return;
    
    setIsLoading(true);
    try {
      // Get current market price
      const { data: marketData } = await supabase
        .from('market_data')
        .select('price')
        .eq('ticker', currentTicker)
        .single();

      const exitPrice = marketData?.price || 0;
      
      // Show price editing modal
      setEditingPrice(exitPrice);
      setPendingTradeData({ exit_price: exitPrice, action: 'exit' });
      setTradeState('editing_exit');
      
    } catch (error) {
      console.error('Error getting market price:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmExit = async () => {
    if (!currentTrade || !pendingTradeData?.exit_price) return;
    
    // Move to quantity entry state instead of immediately saving
    setTradeState('entering_quantity');
  };

  const handleConfirmQuantity = async () => {
    if (!currentTrade || !pendingTradeData?.exit_price) return;
    
    setIsLoading(true);
    try {
      // Calculate P&L based on trade type, prices, and quantity
      const pnl = currentTrade.trade_type === 'long' 
        ? (editingPrice - currentTrade.entry_price) * editingQuantity
        : (currentTrade.entry_price - editingPrice) * editingQuantity;

      const { error } = await supabase
        .from('trades')
        .update({
          exit_price: editingPrice,
          quantity: editingQuantity,
          exit_time: new Date().toISOString(),
          pnl: pnl
        })
        .eq('id', currentTrade.id);

      if (error) throw error;

      setTradeState('feedback');
      setPendingTradeData(null);
      onTradeStateChange?.(false);

      // Send AI message about trade exit
      await DatabaseService.saveChatMessage({
        user_id: userId,
        message_type: 'system',
        content: `📉 Exited ${currentTicker} at $${editingPrice.toFixed(2)} | Qty: ${editingQuantity} | P&L: $${pnl.toFixed(2)}`,
        ticker: currentTicker || undefined
      });

    } catch (error) {
      console.error('Error exiting trade:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTradeFeedback = async (result: TradeResult) => {
    if (!currentTrade || isLoading) return;
    
    setIsLoading(true);
    try {
      const feedbackEmoji = result === 'win' ? '👍' : result === 'loss' ? '👎' : '🤝';
      const feedbackText = result === 'win' ? 'Win' : result === 'loss' ? 'Loss' : 'Breakeven';

      // Update trade with feedback
      await supabase
        .from('trades')
        .update({
          notes: `${currentTrade.notes || ''}\n\nTrade Result: ${feedbackText}`,
          trade_result: result,
          feedback_timestamp: new Date().toISOString()
        })
        .eq('id', currentTrade.id);

      // Send AI feedback message
      await DatabaseService.saveChatMessage({
        user_id: userId,
        message_type: 'user',
        content: `${feedbackEmoji} ${feedbackText}`,
        ticker: currentTicker || undefined
      });

      // Reset state
      setTradeState('idle');
      setCurrentTrade(null);
      onTradeStateChange?.(false);

    } catch (error) {
      console.error('Error saving trade feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (tradeState === 'entering_quantity') {
      setTradeState('editing_exit');
    } else {
      setTradeState(pendingTradeData?.action === 'enter' ? 'idle' : 'in_trade');
    }
    setPendingTradeData(null);
    setEditingPrice(0);
  };

  if (!currentTicker) {
    return null; // Don't show button if no ticker is active
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Trade State Button */}
      {tradeState === 'idle' && (
        <button
          onClick={handleEnterTrade}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
        >
          <TrendingUp className="w-4 h-4" />
          <span>📈 Enter Trade</span>
        </button>
      )}

      {tradeState === 'in_trade' && (
        <button
          onClick={handleExitTrade}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
        >
          <TrendingDown className="w-4 h-4" />
          <span>📉 Exit Trade</span>
        </button>
      )}

      {/* Price Editing Modal - Entry */}
      {tradeState === 'editing_entry' && (
        <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Entry Price:</span>
            <input
              type="number"
              step="0.01"
              value={editingPrice}
              onChange={(e) => setEditingPrice(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleConfirmEntry}
              disabled={isLoading}
              className="p-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors"
              title="Confirm Entry"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="p-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 text-white rounded transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Price Editing Modal - Exit */}
      {tradeState === 'editing_exit' && currentTrade && (
        <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Exit Price:</span>
            <input
              type="number"
              step="0.01"
              value={editingPrice}
              onChange={(e) => setEditingPrice(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <div className="text-xs text-gray-400">
              P&L: ${((editingPrice - currentTrade.entry_price) * editingQuantity).toFixed(2)}
            </div>
            <button
              onClick={handleConfirmExit}
              disabled={isLoading}
              className="p-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors"
              title="Confirm Exit"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="p-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 text-white rounded transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quantity Entry Modal */}
      {tradeState === 'entering_quantity' && currentTrade && (
        <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Quantity:</span>
            <input
              type="number"
              min="1"
              value={editingQuantity}
              onChange={(e) => setEditingQuantity(parseInt(e.target.value) || 1)}
              className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <div className="text-xs text-gray-400">
              P&L: ${((editingPrice - currentTrade.entry_price) * editingQuantity).toFixed(2)}
            </div>
            <button
              onClick={handleConfirmQuantity}
              disabled={isLoading}
              className="p-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors"
              title="Confirm Quantity"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="p-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 text-white rounded transition-colors"
              title="Back to Exit Price"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Feedback Options */}
      {tradeState === 'feedback' && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">How did it go?</span>
          <button
            onClick={() => handleTradeFeedback('win')}
            disabled={isLoading}
            className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            title="Win"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleTradeFeedback('loss')}
            disabled={isLoading}
            className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            title="Loss"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleTradeFeedback('breakeven')}
            disabled={isLoading}
            className="p-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            title="Breakeven"
          >
            <Handshake className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      )}

      {/* Trade info display */}
      {currentTrade && tradeState === 'in_trade' && (
        <div className="flex items-center space-x-2 text-xs text-gray-400 ml-2">
          <span>Entry: ${currentTrade.entry_price?.toFixed(2)}</span>
          <span>Qty: {currentTrade.quantity || editingQuantity}</span>
          <button
            onClick={() => {
              setEditingPrice(currentTrade.entry_price || 0);
              setPendingTradeData({ entry_price: currentTrade.entry_price, action: 'enter' });
              setTradeState('editing_entry');
            }}
            className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
            title="Edit entry price"
          >
            <Edit className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
} 