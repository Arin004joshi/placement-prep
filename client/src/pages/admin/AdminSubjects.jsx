import AdminResourcePage from "./AdminResourcePage";

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "displayOrder", label: "Display order", type: "number", defaultValue: 0 },
  { name: "isPublished", label: "Status", type: "boolean", defaultValue: "false" }
];

const columns = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "displayOrder", label: "Order" },
  { key: "isPublished", label: "Status" }
];

const AdminSubjects = () => (
  <AdminResourcePage title="Admin Subjects" resource="subjects" fields={fields} columns={columns} />
);

export default AdminSubjects;
