import { Activity, CheckCircle2, Clock3, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { getProgressSummary } from "../../api/practice.api";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import { getErrorMessage, titleCase } from "../../utils/formatters";

const Progress = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProgressSummary()
      .then((response) => setSummary(response.data))
      .catch((err) => setError(getErrorMessage(err, "Unable to load progress")))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState label="Loading progress" />;
  if (error) return <ErrorState message={error} />;

  const stats = [
    { label: "Attempted", value: summary.totalAttempted, icon: Activity },
    { label: "Correct", value: summary.totalCorrect, icon: CheckCircle2 },
    { label: "Accuracy", value: `${summary.accuracy}%`, icon: Target },
    { label: "Revision due", value: summary.revisionDueCount, icon: Clock3 }
  ];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-ink">Progress</h1>
        <p className="mt-1 text-sm text-muted">Practice accuracy, mastery snapshots, and weak areas.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-md border border-line bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted">{stat.label}</p>
                <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
              </div>
              <p className="mt-3 text-3xl font-bold text-ink">{stat.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Mastery</h2>
          {summary.mastery?.length ? (
            <div className="mt-4 space-y-3">
              {summary.mastery.map((item) => (
                <div key={item._id} className="rounded-md bg-slate-50 p-3">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold text-ink">{titleCase(item.masteryLevel)}</span>
                    <span className="text-muted">{item.accuracy}% accuracy</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-brand" style={{ width: `${item.accuracy}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No progress yet" message="Submit practice answers to build mastery data." />
          )}
        </div>

        <div className="rounded-md border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Weak Areas</h2>
          {summary.weakAreas?.length ? (
            <div className="mt-4 space-y-2">
              {summary.weakAreas.map((area) => (
                <div key={area.concept} className="flex justify-between rounded-md bg-red-50 px-3 py-2 text-sm">
                  <span className="font-medium text-red-900">{area.concept}</span>
                  <span className="text-red-700">{area.misses} misses</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No weak areas yet" message="Missed concepts will appear here after practice." />
          )}
        </div>
      </section>
    </div>
  );
};

export default Progress;
