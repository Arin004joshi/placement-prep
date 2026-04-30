import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { buildTeachingPrompt } from "../../data/interviewRoadmap";
import CopyPromptButton from "./CopyPromptButton";

const STORAGE_KEY = "interview_prep_roadmap_completed";

const getCompletedMap = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const getCompletionKey = ({ subject, topic, subtopic }) =>
  [subject, topic, subtopic]
    .join("::")
    .toLowerCase()
    .replace(/[^a-z0-9:]+/g, "-");

const RoadmapSubject = ({ subject, compact = false }) => {
  const [completedMap, setCompletedMap] = useState(getCompletedMap);

  const totalSubtopics = useMemo(
    () => subject.topics.reduce((count, [, subtopics]) => count + subtopics.length, 0),
    [subject.topics]
  );

  const completedCount = useMemo(
    () =>
      subject.topics.reduce(
        (count, [topic, subtopics]) =>
          count +
          subtopics.filter((subtopic) =>
            completedMap[getCompletionKey({ subject: subject.name, topic, subtopic })]
          ).length,
        0
      ),
    [completedMap, subject.name, subject.topics]
  );

  const toggleCompleted = (key) => {
    setCompletedMap((current) => {
      const next = { ...current, [key]: !current[key] };

      if (!next[key]) {
        delete next[key];
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <article className="rounded-md border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">{subject.name}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{subject.description}</p>
          <p className="mt-2 text-sm font-semibold text-accent">
            {completedCount}/{totalSubtopics} subtopics complete
          </p>
        </div>
        {!compact ? (
          <Link className="text-sm font-semibold text-brand hover:text-blue-700" to={`/subjects/${subject._id}`}>
            Focus view
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {subject.topics.map(([topic, subtopics]) => (
          <section key={topic} className="rounded-md border border-line bg-slate-50 p-4">
            <h3 className="font-semibold text-ink">{topic}</h3>
            <div className="mt-3 space-y-2">
              {subtopics.map((subtopic) => {
                const completionKey = getCompletionKey({ subject: subject.name, topic, subtopic });
                const isComplete = Boolean(completedMap[completionKey]);

                return (
                  <div
                    key={subtopic}
                    className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 transition ${
                      isComplete ? "border-green-200 bg-green-50" : "border-line bg-white"
                    }`}
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isComplete}
                        onChange={() => toggleCompleted(completionKey)}
                        className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                      />
                      <span
                        className={`truncate text-sm font-medium ${
                          isComplete ? "text-green-800 line-through decoration-green-700" : "text-ink"
                        }`}
                      >
                        {subtopic}
                      </span>
                    </label>
                    <CopyPromptButton prompt={buildTeachingPrompt({ subject: subject.name, topic, subtopic })} />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
};

export default RoadmapSubject;
