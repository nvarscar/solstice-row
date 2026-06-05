import { Trophy, Waves, Dumbbell, Clock } from "lucide-react";

interface Team {
  id: string;
  name: string;
  captain: string;
  members: number;
  boatM: number;
  ergM: number;
  club: string;
  pledgePerKm: number;
}

interface TeamsData {
  eventYear: string;
  eventDate: string;
  lastUpdated: string;
  teams: Team[];
}

interface ResultsProps {
  teamsData: TeamsData;
}

const rankStyle = [
  "bg-solstice-gold/20 border-solstice-gold/50 text-solstice-gold",
  "bg-white/10 border-white/20 text-slate-300",
  "bg-solstice-orange/10 border-solstice-orange/30 text-solstice-orange",
];

export default function Results({ teamsData }: ResultsProps) {
  const sorted = [...teamsData.teams].sort(
    (a, b) => b.boatM + b.ergM - (a.boatM + a.ergM)
  );

  const updated = new Date(teamsData.lastUpdated);
  const updatedStr = updated.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section id="results" className="py-24 px-4 sm:px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-solstice-gold text-sm font-semibold uppercase tracking-widest">
            Live Leaderboard
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-2">
            Team Meter Totals
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-forest-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>Updated {updatedStr}</span>
          </div>
        </div>

        <div className="space-y-3 mb-10">
          {sorted.map((team, rank) => {
            const total = team.boatM + team.ergM;
            const estRaised = ((total / 1000) * team.pledgePerKm).toFixed(2);
            const style = rankStyle[rank] ?? "bg-white/5 border-white/10 text-forest-300";
            return (
              <div
                key={team.id}
                className="card-glass rounded-2xl overflow-hidden hover:bg-white/8 transition-colors"
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm ${style}`}
                  >
                    {rank === 0 ? <Trophy className="w-4 h-4" /> : rank + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="text-white font-bold text-base leading-tight">
                        {team.name}
                      </h3>
                      <span className="text-forest-400 text-xs">{team.club}</span>
                    </div>
                    <p className="text-forest-300 text-sm mt-0.5">
                      {team.captain} · {team.members}{" "}
                      {team.members === 1 ? "member" : "members"}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="text-solstice-gold font-bold text-2xl leading-none">
                      {total.toLocaleString()}
                      <span className="text-base font-normal ml-1">m</span>
                    </p>
                    <p className="text-forest-400 text-xs mt-0.5">total</p>
                  </div>
                </div>

                <div className="border-t border-white/5 px-5 py-3 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Waves className="w-4 h-4 text-water-light flex-shrink-0" />
                    <span className="text-forest-300">Boat:</span>
                    <span className="text-white font-medium">
                      {team.boatM.toLocaleString()} m
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Dumbbell className="w-4 h-4 text-forest-400 flex-shrink-0" />
                    <span className="text-forest-300">Erg:</span>
                    <span className="text-white font-medium">
                      {team.ergM.toLocaleString()} m
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm ml-auto">
                    <span className="text-forest-400">Est. raised:</span>
                    <span className="text-solstice-gold font-semibold">
                      ${estRaised}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div className="card-glass rounded-2xl p-12 text-center">
            <p className="text-forest-300">
              The leaderboard will go live when the event begins on{" "}
              {teamsData.eventDate}.
            </p>
          </div>
        )}

        <div className="mt-8 water-divider" />
      </div>
    </section>
  );
}
