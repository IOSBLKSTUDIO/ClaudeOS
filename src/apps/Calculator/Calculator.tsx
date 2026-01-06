import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  const formatNumber = (num: string): string => {
    if (num.includes('e') || num === 'Erreur') return num;
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join(',');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
      else if (e.key === '.' || e.key === ',') handleDecimal();
      else if (e.key === '+') handleOperation('+');
      else if (e.key === '-') handleOperation('−');
      else if (e.key === '*') handleOperation('×');
      else if (e.key === '/') { e.preventDefault(); handleOperation('÷'); }
      else if (e.key === 'Enter' || e.key === '=') handleEquals();
      else if (e.key === 'Escape') handleClear();
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === '%') handlePercent();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, previousValue, operation, shouldResetDisplay]);

  const handleNumber = useCallback((num: string) => {
    if (display.replace(/[^0-9]/g, '').length >= 9 && !shouldResetDisplay) return;
    if (shouldResetDisplay) {
      setDisplay(num);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  }, [display, shouldResetDisplay]);

  const handleDecimal = useCallback(() => {
    if (shouldResetDisplay) {
      setDisplay('0.');
      setShouldResetDisplay(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, shouldResetDisplay]);

  const handleBackspace = useCallback(() => {
    if (shouldResetDisplay) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  }, [display, shouldResetDisplay]);

  const handleOperation = useCallback((op: string) => {
    const current = parseFloat(display);
    if (previousValue !== null && operation && !shouldResetDisplay) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    } else {
      setPreviousValue(current);
    }
    setOperation(op);
    setShouldResetDisplay(true);
  }, [display, previousValue, operation, shouldResetDisplay]);

  const calculate = (a: number, b: number, op: string): number => {
    let result: number;
    switch (op) {
      case '+': result = a + b; break;
      case '−': result = a - b; break;
      case '×': result = a * b; break;
      case '÷': result = b !== 0 ? a / b : NaN; break;
      default: result = b;
    }
    return Math.round(result * 1e10) / 1e10;
  };

  const handleEquals = useCallback(() => {
    if (previousValue === null || operation === null) return;
    const current = parseFloat(display);
    const result = calculate(previousValue, current, operation);
    setDisplay(isNaN(result) ? 'Erreur' : String(result));
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(true);
  }, [display, previousValue, operation]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(false);
  }, []);

  const handlePlusMinus = useCallback(() => {
    if (display !== '0' && display !== 'Erreur') {
      setDisplay(String(parseFloat(display) * -1));
    }
  }, [display]);

  const handlePercent = useCallback(() => {
    const value = parseFloat(display);
    if (previousValue !== null && operation) {
      setDisplay(String(previousValue * value / 100));
    } else {
      setDisplay(String(value / 100));
    }
  }, [display, previousValue, operation]);

  const Button = ({
    children,
    onClick,
    variant = 'number',
    wide = false
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'number' | 'op' | 'func';
    wide?: boolean;
  }) => {
    const isActive = variant === 'op' && operation === children;

    const baseStyle = {
      number: 'bg-[#333333] hover:bg-[#4a4a4a] text-white',
      op: isActive
        ? 'bg-white text-[#ff9500]'
        : 'bg-[#ff9500] hover:bg-[#ffad33] text-white',
      func: 'bg-[#a5a5a5] hover:bg-[#c5c5c5] text-black',
    };

    return (
      <motion.button
        className={`
          ${wide ? 'col-span-2' : ''}
          ${baseStyle[variant]}
          h-14 rounded-full font-light text-2xl
          flex items-center justify-center
          transition-colors duration-150
          select-none
        `}
        onClick={onClick}
        whileTap={{ scale: 0.95, opacity: 0.9 }}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <div className="h-full bg-black flex flex-col p-4 select-none">
      {/* Display */}
      <div className="flex-1 flex items-end justify-end px-2 pb-2 min-h-[80px]">
        <div
          className="text-white font-light text-right w-full truncate"
          style={{
            fontSize: display.length > 7 ? '36px' : display.length > 5 ? '48px' : '56px',
            lineHeight: 1,
          }}
        >
          {formatNumber(display)}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={handleClear} variant="func">AC</Button>
        <Button onClick={handlePlusMinus} variant="func">±</Button>
        <Button onClick={handlePercent} variant="func">%</Button>
        <Button onClick={() => handleOperation('÷')} variant="op">÷</Button>

        <Button onClick={() => handleNumber('7')}>7</Button>
        <Button onClick={() => handleNumber('8')}>8</Button>
        <Button onClick={() => handleNumber('9')}>9</Button>
        <Button onClick={() => handleOperation('×')} variant="op">×</Button>

        <Button onClick={() => handleNumber('4')}>4</Button>
        <Button onClick={() => handleNumber('5')}>5</Button>
        <Button onClick={() => handleNumber('6')}>6</Button>
        <Button onClick={() => handleOperation('−')} variant="op">−</Button>

        <Button onClick={() => handleNumber('1')}>1</Button>
        <Button onClick={() => handleNumber('2')}>2</Button>
        <Button onClick={() => handleNumber('3')}>3</Button>
        <Button onClick={() => handleOperation('+')} variant="op">+</Button>

        <Button onClick={() => handleNumber('0')} wide>0</Button>
        <Button onClick={handleDecimal}>,</Button>
        <Button onClick={handleEquals} variant="op">=</Button>
      </div>
    </div>
  );
}
