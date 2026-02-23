interface VinylDiscProps {
  albumArt?: string;
  playing: boolean;
}

const VinylDisc = ({ albumArt, playing }: VinylDiscProps) => {
  return (
    <div
      className="relative w-40 h-40"
      style={{ perspective: "600px" }}
    >
      <div
        className={`w-full h-full rounded-full relative ${playing ? "animate-vinyl-spin" : "animate-vinyl-spin paused"}`}
        style={{
          transform: "rotateX(12deg)",
          background: `radial-gradient(circle at 50% 50%, 
            hsl(220 25% 10%) 0%, 
            hsl(220 20% 8%) 35%, 
            hsl(220 20% 6%) 100%)`,
          border: "2px solid hsl(0 0% 0% / 0.8)",
          boxShadow: playing
            ? "0 0 30px hsl(190 100% 50% / 0.2), 0 0 60px hsl(190 100% 50% / 0.1), inset 0 0 20px hsl(0 0% 0% / 0.5)"
            : "0 0 10px hsl(0 0% 0% / 0.5), inset 0 0 20px hsl(0 0% 0% / 0.5)",
        }}
      >
        {/* Album art cover full disc */}
        {albumArt && (
          <img
            src={albumArt}
            alt="Album"
            className="absolute inset-0 w-full h-full rounded-full object-cover"
            style={{ opacity: 0.8 }}
          />
        )}

        {/* Groove overlay */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `repeating-radial-gradient(
              circle at center,
              transparent 0px,
              transparent 2px,
              hsl(0 0% 0% / 0.15) 2px,
              hsl(0 0% 0% / 0.15) 3px
            )`,
          }}
        />

        {/* Center hole */}
        <div
          className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "radial-gradient(circle, hsl(220 20% 4%), hsl(220 25% 8%))",
            border: "1px solid hsl(190 100% 50% / 0.3)",
          }}
        />

        {/* Glass reflection */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(145deg, hsl(0 0% 100% / 0.07) 0%, transparent 35%, transparent 65%, hsl(0 0% 100% / 0.03) 100%)",
          }}
        />
      </div>
    </div>
  );
};

export default VinylDisc;
