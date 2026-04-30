import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getResource } from "../../api/content.api";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import { getErrorMessage, titleCase } from "../../utils/formatters";

const QuestionDetail = () => {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getResource("questions", questionId)
      .then((response) => setQuestion(response.data))
      .catch((err) => setError(getErrorMessage(err, "Unable to load question")))
      .finally(() => setIsLoading(false));
  }, [questionId]);

  if (isLoading) return <LoadingState label="Loading question" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-muted">
            {titleCase(question.difficulty)}
          </span>
          <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-accent">
            {titleCase(question.type)}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-ink dark:text-slate-100">{question.title || "Interview question"}</h1>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-ink dark:text-slate-200">{question.prompt}</p>
      </section>

      {question.options?.length ? (
        <section className="rounded-md border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-lg font-semibold text-ink dark:text-slate-100">Options</h2>
          <div className="space-y-2">
            {question.options.map((option) => (
              <div key={option.key} className="rounded-md border border-line px-3 py-2 text-sm text-ink dark:border-slate-800 dark:text-slate-100">
                <span className="mr-2 font-semibold">{option.key}.</span>
                {option.text}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-md border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-ink dark:text-slate-100">Expected Answer</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">
          {question.expectedAnswer || "Expected answer has not been added yet."}
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-ink dark:text-slate-100">Common Mistakes</h2>
          {question.commonMistakes?.length ? (
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {question.commonMistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No common mistakes recorded yet.</p>
          )}
        </div>

        <div className="rounded-md border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-ink dark:text-slate-100">Follow-ups</h2>
          {question.followUps?.length ? (
            <div className="mt-3 space-y-3">
              {question.followUps.map((followUp) => (
                <div key={followUp.question} className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-ink dark:text-slate-100">{followUp.question}</p>
                  <p className="mt-1 text-sm text-muted">{followUp.expectedAnswer}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">No follow-ups recorded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default QuestionDetail;
