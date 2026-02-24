import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

class CarouselErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: Error) {
    console.warn("CarouselErrorBoundary caught:", err.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full flex items-center justify-center py-4">
          <div className="w-28 h-28 border border-border/30 bg-muted/10 flex flex-col items-center justify-center gap-1"
            style={{ clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-20">
              <circle cx="12" cy="12" r="10" stroke="hsl(var(--primary))" strokeWidth="1" />
              <circle cx="12" cy="12" r="3" stroke="hsl(var(--primary))" strokeWidth="1" />
            </svg>
            <span className="text-[6px] text-muted-foreground/30 tracking-[0.3em]">COVER ERR</span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default CarouselErrorBoundary;
