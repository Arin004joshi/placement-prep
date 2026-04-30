import { BookOpen, Layers, ListChecks, Tags } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listResource } from "../../api/content.api";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import { findRoadmapSubjectByName, interviewRoadmap } from "../../data/interviewRoadmap";
import { getErrorMessage } from "../../utils/formatters";

const statConfig = [
  { key: "subjects", label: "Subjects", icon: BookOpen },
  { key: "topics", label: "Topics", icon: Layers },
  { key: "subtopics", label: "Subtopics", icon: Tags },
  { key: "questions", label: "Questions", icon: ListChecks }
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentSubjects, setRecentSubjects] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [subjects, topics, subtopics, questions] = await Promise.all([
          listResource("subjects", { limit: 6, sort: "displayOrder" }),
          listResource("topics", { limit: 1 }),
          listResource("subtopics", { limit: 1 }),
          listResource("questions", { limit: 1 })
        ]);

        const displayedSubjects = subjects.data?.length ? subjects.data : interviewRoadmap;

        const fallbackTopicCount = interviewRoadmap.reduce((count, subject) => count + subject.topics.length, 0);
        const fallbackSubtopicCount = interviewRoadmap.reduce(
          (count, subject) =>
            count + subject.topics.reduce((topicCount, [, subtopics]) => topicCount + subtopics.length, 0),
          0
        );

        setStats({
          subjects: subjects.pagination?.total || displayedSubjects.length,
          topics: topics.pagination?.total || fallbackTopicCount,
          subtopics: subtopics.pagination?.total || fallbackSubtopicCount,
          questions: questions.pagination?.total || 0
        });
        setRecentSubjects(displayedSubjects);
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load dashboard"));
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) return <LoadingState label="Loading dashboard" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Content coverage and starting points for Phase 1.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statConfig.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.key} className="rounded-md border border-line bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted">{item.label}</p>
                <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
              </div>
              <p className="mt-3 text-3xl font-bold text-ink">{stats[item.key]}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-md border border-line bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Subjects</h2>
            <p className="text-sm text-muted">Browse the available learning areas.</p>
          </div>
          <Link className="text-sm font-semibold text-brand hover:text-blue-700" to="/subjects">
            View all
          </Link>
        </div>

        {recentSubjects.length === 0 ? (
          <EmptyState title="No subjects yet" message="Run `npm run seed` in the server folder or create subjects from the admin area." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentSubjects.map((subject) => (
              <Link
                key={subject._id}
                to={`/subjects/${findRoadmapSubjectByName(subject.name)?._id || subject._id}`}
                className="rounded-md border border-line p-4 transition hover:border-brand hover:bg-blue-50"
              >
                <p className="font-semibold text-ink">{subject.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{subject.description || "No description yet."}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
