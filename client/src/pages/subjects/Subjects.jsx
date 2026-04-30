import { useEffect, useState } from "react";
import { listResource } from "../../api/content.api";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import RoadmapSubject from "../../components/ui/RoadmapSubject";
import { interviewRoadmap } from "../../data/interviewRoadmap";
import { getErrorMessage } from "../../utils/formatters";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listResource("subjects", { limit: 50, sort: "displayOrder" })
      .then((response) => setSubjects(response.data?.length ? response.data : interviewRoadmap))
      .catch((err) => {
        setSubjects(interviewRoadmap);
        setError(getErrorMessage(err, "Using offline roadmap because API subjects could not be loaded"));
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState label="Loading subjects" />;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-ink dark:text-slate-100">Interview Readiness Roadmap</h1>
        <p className="mt-1 text-sm text-muted">
          All must-read topics and subtopics for DBMS, OOPs, OS, and MERN interviews.
        </p>
      </section>

      {error ? <ErrorState title="API fallback active" message={error} /> : null}

      {subjects.length === 0 ? (
        <EmptyState title="No subjects available" message="Run `npm run seed` in the server folder or create subjects from the admin area." />
      ) : (
        <div className="space-y-5">
          {interviewRoadmap.map((subject) => (
            <RoadmapSubject key={subject._id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Subjects;
