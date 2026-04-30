import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { getRevisionQuestions } from "../../api/practice.api";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import { getErrorMessage, titleCase } from "../../utils/formatters";

const Revision = () => {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    setError("");
    getRevisionQuestions({ limit: 20 })
      .then((response) => setQuestions(response.data || []))
      .catch((err) => setError(getErrorMessage(err, "Unable to load revision questions")))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (isLoading) return <LoadingState label="Loading revision queue" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-slate-100">Revision Mode</h1>
          <p className="mt-1 text-sm text-muted">Questions due from weak or recently missed concepts.</p>
        </div>
        <Button variant="secondary" onClick={load}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </Button>
      </section>

      {questions.length === 0 ? (
        <EmptyState title="No revision due" message="Incorrect practice attempts will appear here when they are due." />
      ) : (
        <div className="grid gap-3">
          {questions.map((question) => (
            <article key={question._id} className="rounded-md border border-line bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-muted">
                  {titleCase(question.difficulty)}
                </span>
                <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-accent">
                  {titleCase(question.type)}
                </span>
              </div>
              <h2 className="font-semibold text-ink dark:text-slate-100">{question.title || "Revision question"}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted">{question.prompt}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Revision;
