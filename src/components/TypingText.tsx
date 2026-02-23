import { useEffect, useState } from "react";

const TypingText = ({
  text,
  speed = 50,
  className = "",
}: {
  text: string;
  speed?: number;
  className?: string;
}) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <span className="inline-block w-2 h-4 ml-0.5 border-r-2 border-primary animate-typing-cursor" />
      )}
    </span>
  );
};

export default TypingText;
