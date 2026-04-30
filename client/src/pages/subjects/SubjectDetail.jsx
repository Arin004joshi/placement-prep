import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getResource, listResource } from "../../api/content.api";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import CopyPromptButton from "../../components/ui/CopyPromptButton";
import RoadmapSubject from "../../components/ui/RoadmapSubject";
import { buildTeachingPrompt, findRoadmapSubject } from "../../data/interviewRoadmap";
import { getErrorMessage } from "../../utils/formatters";

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const fallbackSubject = findRoadmapSubject(subjectId);

      if (fallbackSubject) {
        setSubject(fallbackSubject);
        setTopics(
          fallbackSubject.topics.map(([title], index) => ({
            _id: `${fallbackSubject._id}-topic-${index}`,
            title,
            shortTheory: ""
          }))
        );
        setSubtopics(
          fallbackSubject.topics.flatMap(([topicTitle, subtopicTitles], topicIndex) =>
            subtopicTitles.map((title, subtopicIndex) => ({
              _id: `${fallbackSubject._id}-subtopic-${topicIndex}-${subtopicIndex}`,
              topicId: `${fallbackSubject._id}-topic-${topicIndex}`,
              title,
              shortTheory: `Read and revise ${title} for ${topicTitle} interviews.`
            }))
          )
        );
        setIsLoading(false);
        return;
      }

      try {
        const [subjectResponse, topicsResponse, subtopicsResponse] = await Promise.all([
          getResource("subjects", subjectId),
          listResource("topics", { subjectId, limit: 100, sort: "displayOrder" }),
          listResource("subtopics", { subjectId, limit: 200, sort: "displayOrder" })
        ]);
        setSubject(subjectResponse.data);
        setTopics(topicsResponse.data || []);
        setSubtopics(subtopicsResponse.data || []);
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load subject"));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [subjectId]);

  if (isLoading) return <LoadingState label="Loading subject" />;
  if (error) return <ErrorState message={error} />;

  if (subject?.isFallback) {
    return <RoadmapSubject subject={subject} compact />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Subject</p>
        <h1 className="mt-2 text-2xl font-bold text-ink dark:text-slate-100">{subject?.name}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{subject?.description || "No description yet."}</p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink dark:text-slate-100">Topics</h2>
        {topics.length === 0 ? (
          <EmptyState title="No topics yet" message="Run the seed script or create topics from the admin area." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {topics.map((topic) => (
              <div key={topic._id} className="rounded-md border border-line bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <Link className="font-semibold text-ink hover:text-brand dark:text-slate-100" to={`/topics/${topic._id}`}>
                  {topic.title}
                </Link>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{topic.shortTheory || "No theory summary yet."}</p>
                <div className="mt-4 space-y-2">
                  {subtopics
                    .filter((subtopic) => subtopic.topicId === topic._id)
                    .map((subtopic) => (
                      <div
                        key={subtopic._id}
                        className="flex items-start justify-between gap-3 rounded-md border border-line bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                      >
                        <div>
                          <p className="text-sm font-semibold text-ink dark:text-slate-100">{subtopic.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                            {subtopic.shortTheory || "No subtopic theory yet."}
                          </p>
                        </div>
                        <CopyPromptButton
                          prompt={buildTeachingPrompt({
                            subject: subject.name,
                            topic: topic.title,
                            subtopic: subtopic.title
                          })}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SubjectDetail;
