import { CheckCircle2, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";
import { getPracticeQuestions, submitAttempt } from "../../api/practice.api";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import { getErrorMessage, titleCase } from "../../utils/formatters";

const Practice = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];

  const loadQuestions = () => {
    setError("");
    setIsLoading(true);
    getPracticeQuestions({ limit: 10 })
      .then((response) => setQuestions(response.data || []))
      .catch((err) => setError(getErrorMessage(err, "Unable to load practice questions")))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleSubmit = async (skipped = false) => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await submitAttempt({
        questionId: currentQuestion._id,
        submittedAnswer: selectedAnswer,
        skipped,
        mode: "practice"
      });
      setResult(response.data.result);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to submit answer"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer("");
    setResult(null);
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
  };

  if (isLoading) return <LoadingState label="Loading practice questions" />;
  if (error) return <ErrorState message={error} />;
  if (!currentQuestion) {
    return <EmptyState title="No practice questions" message="Seed or create published questions to start practice." />;
  }

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-bold text-ink">Practice Mode</h1>
        <p className="mt-1 text-sm text-muted">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </section>

      <section className="rounded-md border border-line bg-white p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-muted">
            {titleCase(currentQuestion.difficulty)}
          </span>
          <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-accent">
            {titleCase(currentQuestion.type)}
          </span>
        </div>

        <h2 className="text-xl font-semibold text-ink">{currentQuestion.title || "Practice question"}</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink">{currentQuestion.prompt}</p>

        {currentQuestion.options?.length ? (
          <div className="mt-5 space-y-2">
            {currentQuestion.options.map((option) => (
              <label
                key={option.key}
                className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3 text-sm transition ${
                  selectedAnswer === option.key ? "border-brand bg-blue-50" : "border-line bg-white hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option.key}
                  checked={selectedAnswer === option.key}
                  onChange={(event) => setSelectedAnswer(event.target.value)}
                  disabled={Boolean(result)}
                />
                <span>
                  <strong>{option.key}.</strong> {option.text}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            className="mt-5 min-h-32 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-blue-100"
            value={selectedAnswer}
            onChange={(event) => setSelectedAnswer(event.target.value)}
            disabled={Boolean(result)}
            placeholder="Write your answer"
          />
        )}

        {result ? (
          <div className={`mt-5 rounded-md p-4 ${result.isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            <p className="font-semibold">{result.isCorrect ? "Correct" : "Needs review"}</p>
            <p className="mt-2 text-sm">{result.expectedAnswer}</p>
            {result.explanation ? <p className="mt-2 text-sm">{result.explanation}</p> : null}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          {!result ? (
            <>
              <Button disabled={isSubmitting || (!selectedAnswer && currentQuestion.type === "mcq")} onClick={() => handleSubmit(false)}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Submit
              </Button>
              <Button variant="secondary" disabled={isSubmitting} onClick={() => handleSubmit(true)}>
                <SkipForward className="h-4 w-4" aria-hidden="true" />
                Skip
              </Button>
            </>
          ) : (
            <Button onClick={nextQuestion} disabled={currentIndex === questions.length - 1}>
              Next question
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Practice;
