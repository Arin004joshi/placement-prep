import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getResource, listResource } from "../../api/content.api";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import { getErrorMessage, titleCase } from "../../utils/formatters";

const TopicDetail = () => {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [topicResponse, subtopicsResponse, questionsResponse] = await Promise.all([
          getResource("topics", topicId),
          listResource("subtopics", { topicId, limit: 100, sort: "displayOrder" }),
          listResource("questions", { topicId, limit: 25, sort: "difficulty" })
        ]);
        setTopic(topicResponse.data);
        setSubtopics(subtopicsResponse.data || []);
        setQuestions(questionsResponse.data || []);
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load topic"));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [topicId]);

  if (isLoading) return <LoadingState label="Loading topic" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Topic</p>
        <h1 className="mt-2 text-2xl font-bold text-ink dark:text-slate-100">{topic?.title}</h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">{topic?.shortTheory || "No theory summary yet."}</p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink dark:text-slate-100">Subtopics</h2>
        {subtopics.length === 0 ? (
          <EmptyState title="No subtopics yet" message="Subtopics for this topic will appear here." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {subtopics.map((subtopic) => (
              <div key={subtopic._id} className="rounded-md border border-line bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-semibold text-ink dark:text-slate-100">{subtopic.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted">
                  {subtopic.shortTheory || "No theory summary yet."}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink dark:text-slate-100">Questions</h2>
        {questions.length === 0 ? (
          <EmptyState title="No questions yet" message="Interview questions for this topic will appear here." />
        ) : (
          <div className="overflow-hidden rounded-md border border-line bg-white dark:border-slate-800 dark:bg-slate-900">
            {questions.map((question) => (
              <Link
                key={question._id}
                to={`/questions/${question._id}`}
                className="block border-b border-line px-4 py-4 transition last:border-b-0 hover:bg-blue-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-muted">
                    {titleCase(question.difficulty)}
                  </span>
                  <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-accent">
                    {titleCase(question.type)}
                  </span>
                </div>
                <p className="mt-2 font-medium text-ink dark:text-slate-100">{question.title || question.prompt}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TopicDetail;
