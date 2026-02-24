interface TrackInfo {
  title: string;
  artist: string;
  albumArt?: string;
  timestamp: number;
}

interface TrackHistoryProps {
  tracks: TrackInfo[];
}

const TrackHistory = ({ tracks }: TrackHistoryProps) => {
  return (
    <div className="px-3 border-t border-border/50" style={{ minHeight: "120px" }}>
      <p className="text-[9px] text-muted-foreground tracking-wider py-1.5 uppercase">
        Histórico
      </p>
      <div className="space-y-1 pb-2">
        {tracks.length === 0 && (
          <p className="text-[10px] text-muted-foreground/50 text-center py-4">
            AGUARDANDO SINAL...
          </p>
        )}
        {tracks.map((track, i) => (
          <div
            key={track.timestamp}
            className={`flex items-center gap-2 px-2 py-1 rounded-sm transition-all ${
              i === 0
                ? "bg-primary/10 border-l-2 border-primary"
                : "bg-muted/10 border-l-2 border-transparent opacity-50"
            }`}
            style={{ animation: "fade-in 0.3s ease-out" }}
          >
            {track.albumArt ? (
              <img src={track.albumArt} alt="" className="w-6 h-6 rounded-sm object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-sm bg-muted/30" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-foreground truncate">{track.title}</p>
              <p className="text-[9px] text-accent/80 truncate">{track.artist}</p>
            </div>
            {i === 0 && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackHistory;
