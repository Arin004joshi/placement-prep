import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import AdminQuestions from "../pages/admin/AdminQuestions";
import AdminSubjects from "../pages/admin/AdminSubjects";
import AdminSubtopics from "../pages/admin/AdminSubtopics";
import AdminTopics from "../pages/admin/AdminTopics";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/dashboard/Dashboard";
import Practice from "../pages/practice/Practice";
import Progress from "../pages/progress/Progress";
import QuestionDetail from "../pages/questions/QuestionDetail";
import Revision from "../pages/revision/Revision";
import Subjects from "../pages/subjects/Subjects";
import SubjectDetail from "../pages/subjects/SubjectDetail";
import TopicDetail from "../pages/topics/TopicDetail";
import AdminRoute from "./AdminRoute";
import ProtectedRoute from "./ProtectedRoute";

const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/revision" element={<Revision />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
        <Route path="/topics/:topicId" element={<TopicDetail />} />
        <Route path="/questions/:questionId" element={<QuestionDetail />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin/subjects" element={<AdminSubjects />} />
          <Route path="/admin/topics" element={<AdminTopics />} />
          <Route path="/admin/subtopics" element={<AdminSubtopics />} />
          <Route path="/admin/questions" element={<AdminQuestions />} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRouter;
