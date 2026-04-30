import AdminResourcePage from "./AdminResourcePage";

const fields = [
  { name: "subjectId", label: "Subject", type: "select", lookupResource: "subjects", required: true },
  { name: "topicId", label: "Topic", type: "select", lookupResource: "topics", required: true },
  { name: "subtopicId", label: "Subtopic", type: "select", lookupResource: "subtopics", required: true },
  {
    name: "type",
    label: "Type",
    type: "select",
    required: true,
    options: [
      { value: "mcq", label: "MCQ" },
      { value: "descriptive", label: "Descriptive" },
      { value: "conceptual", label: "Conceptual" },
      { value: "coding", label: "Coding" }
    ]
  },
  {
    name: "difficulty",
    label: "Difficulty",
    type: "select",
    required: true,
    options: [
      { value: "easy", label: "Easy" },
      { value: "medium", label: "Medium" },
      { value: "hard", label: "Hard" }
    ]
  },
  { name: "title", label: "Title" },
  { name: "prompt", label: "Prompt", type: "textarea", required: true },
  { name: "options", label: "MCQ options JSON", type: "json" },
  { name: "expectedAnswer", label: "Expected answer", type: "textarea" },
  { name: "explanation", label: "Explanation", type: "textarea" },
  { name: "commonMistakes", label: "Common mistakes", type: "array" },
  { name: "followUps", label: "Follow-ups JSON", type: "json" },
  { name: "tags", label: "Tags", type: "array" },
  { name: "concepts", label: "Concepts", type: "array" },
  { name: "estimatedMinutes", label: "Estimated minutes", type: "number", defaultValue: 0 },
  { name: "source", label: "Source" },
  { name: "isPublished", label: "Status", type: "boolean", defaultValue: "false" }
];

const columns = [
  { key: "title", label: "Title" },
  { key: "difficulty", label: "Difficulty" },
  { key: "type", label: "Type" },
  { key: "subtopicId", label: "Subtopic", lookupResource: "subtopics" },
  { key: "isPublished", label: "Status" }
];

const AdminQuestions = () => (
  <AdminResourcePage
    title="Admin Questions"
    resource="questions"
    fields={fields}
    columns={columns}
    lookups={[{ resource: "subjects" }, { resource: "topics" }, { resource: "subtopics" }]}
  />
);

export default AdminQuestions;
