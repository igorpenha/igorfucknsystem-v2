import { useState } from "react";

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [reset, setReset] = useState(false);

  const handleNumber = (n: string) => {
    if (reset) {
      setDisplay(n);
      setReset(false);
    } else {
      setDisplay(display === "0" ? n : display + n);
    }
  };

  const handleOp = (o: string) => {
    setPrev(display);
    setOp(o);
    setReset(true);
  };

  const handleEqual = () => {
    if (!prev || !op) return;
    const a = parseFloat(prev);
    const b = parseFloat(display);
    let result = 0;
    switch (op) {
      case "+": result = a + b; break;
      case "-": result = a - b; break;
      case "*": result = a * b; break;
      case "/": result = b !== 0 ? a / b : 0; break;
    }
    setDisplay(String(result));
    setPrev(null);
    setOp(null);
    setReset(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
  };

  const buttons = [
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["C", "0", "=", "+"],
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-muted rounded-sm px-3 py-2 text-right font-display text-xl text-foreground text-glow border border-border">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            onClick={() => {
              if (btn === "C") handleClear();
              else if (btn === "=") handleEqual();
              else if (["+", "-", "*", "/"].includes(btn)) handleOp(btn);
              else handleNumber(btn);
            }}
            className={`
              py-2 rounded-sm font-display text-sm transition-all duration-150
              active:scale-95 hover:glow-primary
              ${["+", "-", "*", "/"].includes(btn)
                ? "bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30"
                : btn === "="
                ? "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                : btn === "C"
                ? "bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30"
                : "bg-muted text-foreground border border-border hover:bg-muted/80"
              }
            `}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
