import AdminResourcePage from "./AdminResourcePage";

const fields = [
  { name: "subjectId", label: "Subject", type: "select", lookupResource: "subjects", required: true },
  { name: "title", label: "Title", required: true },
  { name: "shortTheory", label: "Short theory", type: "textarea" },
  { name: "displayOrder", label: "Display order", type: "number", defaultValue: 0 },
  { name: "estimatedMinutes", label: "Estimated minutes", type: "number", defaultValue: 0 },
  { name: "isPublished", label: "Status", type: "boolean", defaultValue: "false" }
];

const columns = [
  { key: "title", label: "Title" },
  { key: "subjectId", label: "Subject", lookupResource: "subjects" },
  { key: "displayOrder", label: "Order" },
  { key: "isPublished", label: "Status" }
];

const AdminTopics = () => (
  <AdminResourcePage
    title="Admin Topics"
    resource="topics"
    fields={fields}
    columns={columns}
    lookups={[{ resource: "subjects" }]}
  />
);

export default AdminTopics;
