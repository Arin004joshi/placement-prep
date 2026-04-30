import AdminResourcePage from "./AdminResourcePage";

const fields = [
  { name: "subjectId", label: "Subject", type: "select", lookupResource: "subjects", required: true },
  { name: "topicId", label: "Topic", type: "select", lookupResource: "topics", required: true },
  { name: "title", label: "Title", required: true },
  { name: "shortTheory", label: "Short theory", type: "textarea" },
  { name: "displayOrder", label: "Display order", type: "number", defaultValue: 0 },
  { name: "isPublished", label: "Status", type: "boolean", defaultValue: "false" }
];

const columns = [
  { key: "title", label: "Title" },
  { key: "subjectId", label: "Subject", lookupResource: "subjects" },
  { key: "topicId", label: "Topic", lookupResource: "topics" },
  { key: "isPublished", label: "Status" }
];

const AdminSubtopics = () => (
  <AdminResourcePage
    title="Admin Subtopics"
    resource="subtopics"
    fields={fields}
    columns={columns}
    lookups={[{ resource: "subjects" }, { resource: "topics" }]}
  />
);

export default AdminSubtopics;
