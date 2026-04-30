import { Edit2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createResource,
  deleteResource,
  listResource,
  updateResource
} from "../../api/content.api";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Input from "../../components/ui/Input";
import LoadingState from "../../components/ui/LoadingState";
import Select from "../../components/ui/Select";
import { getErrorMessage } from "../../utils/formatters";

const getInitialForm = (fields) =>
  Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? ""]));

const serializeValue = (field, value) => {
  if (field.type === "number") return Number(value || 0);
  if (field.type === "boolean") return value === true || value === "true";
  if (field.type === "array") {
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (field.type === "json") {
    if (!value) return [];
    return JSON.parse(value);
  }
  return value;
};

const deserializeValue = (field, value) => {
  if (field.type === "boolean") return value ? "true" : "false";
  if (field.type === "array") return Array.isArray(value) ? value.join(", ") : "";
  if (field.type === "json") return value ? JSON.stringify(value, null, 2) : "";
  return value ?? "";
};

const AdminResourcePage = ({ title, resource, fields, columns, lookups = [] }) => {
  const [items, setItems] = useState([]);
  const [lookupData, setLookupData] = useState({});
  const [form, setForm] = useState(() => getInitialForm(fields));
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const lookupMap = useMemo(() => {
    const result = {};

    for (const [key, values] of Object.entries(lookupData)) {
      result[key] = Object.fromEntries(values.map((item) => [item._id, item.name || item.title]));
    }

    return result;
  }, [lookupData]);

  const load = async () => {
    setError("");
    setIsLoading(true);

    try {
      const [resourceResponse, ...lookupResponses] = await Promise.all([
        listResource(resource, { limit: 100, sort: "createdAt" }),
        ...lookups.map((lookup) => listResource(lookup.resource, { limit: 200, sort: "displayOrder" }))
      ]);

      setItems(resourceResponse.data || []);
      setLookupData(
        Object.fromEntries(
          lookups.map((lookup, index) => [lookup.resource, lookupResponses[index]?.data || []])
        )
      );
    } catch (err) {
      setError(getErrorMessage(err, `Unable to load ${title.toLowerCase()}`));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const resetForm = () => {
    setEditingId(null);
    setForm(getInitialForm(fields));
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm(Object.fromEntries(fields.map((field) => [field.name, deserializeValue(field, item[field.name])])));
  };

  const buildPayload = () =>
    Object.fromEntries(
      fields
        .filter((field) => !field.readOnly)
        .map((field) => [field.name, serializeValue(field, form[field.name])])
        .filter(([, value]) => value !== "")
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const payload = buildPayload();

      if (editingId) {
        await updateResource(resource, editingId, payload);
      } else {
        await createResource(resource, payload);
      }

      resetForm();
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save content"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this item?");

    if (!confirmed) return;

    try {
      await deleteResource(resource, id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete content"));
    }
  };

  const renderField = (field) => {
    const value = form[field.name] ?? "";
    const onChange = (event) => setForm((current) => ({ ...current, [field.name]: event.target.value }));

    if (field.type === "select" || field.type === "boolean") {
      const options =
        field.type === "boolean"
          ? [
              { value: "false", label: "Draft" },
              { value: "true", label: "Published" }
            ]
          : field.options || lookupData[field.lookupResource]?.map((item) => ({
              value: item._id,
              label: item.name || item.title
            })) || [];

      return (
        <Select key={field.name} label={field.label} value={value} onChange={onChange} required={field.required}>
          <option value="">Select {field.label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
    }

    if (field.type === "textarea" || field.type === "json") {
      return (
        <label key={field.name} className="block">
          <span className="mb-1 block text-sm font-medium text-ink">{field.label}</span>
          <textarea
            className="min-h-28 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-100"
            value={value}
            onChange={onChange}
            required={field.required}
          />
        </label>
      );
    }

    return (
      <Input
        key={field.name}
        label={field.label}
        type={field.type === "number" ? "number" : "text"}
        value={value}
        onChange={onChange}
        required={field.required}
      />
    );
  };

  const renderCell = (item, column) => {
    const value = item[column.key];

    if (column.lookupResource) {
      return lookupMap[column.lookupResource]?.[value] || value || "-";
    }

    if (typeof value === "boolean") {
      return value ? "Published" : "Draft";
    }

    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : "-";
    }

    return value || "-";
  };

  if (isLoading) return <LoadingState label={`Loading ${title.toLowerCase()}`} />;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-1 text-sm text-muted">Create and maintain learning content for Phase 1.</p>
      </section>

      {error ? <ErrorState message={error} /> : null}

      <section className="rounded-md border border-line bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-ink">{editingId ? "Edit item" : "Create item"}</h2>
          {editingId ? (
            <Button variant="secondary" onClick={resetForm}>
              <X className="h-4 w-4" aria-hidden="true" />
              Cancel
            </Button>
          ) : null}
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          {fields.map(renderField)}
          <div className="md:col-span-2">
            <Button type="submit" disabled={isSaving}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {isSaving ? "Saving" : editingId ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-md border border-line bg-white">
        {items.length === 0 ? (
          <EmptyState title={`No ${title.toLowerCase()} yet`} message="Created items will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line bg-slate-50 text-xs uppercase tracking-wide text-muted">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="px-4 py-3 font-semibold">
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-line last:border-b-0">
                    {columns.map((column) => (
                      <td key={column.key} className="max-w-xs px-4 py-3 text-ink">
                        <span className="line-clamp-2">{renderCell(item, column)}</span>
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="secondary" className="px-3" onClick={() => handleEdit(item)}>
                          <Edit2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button variant="danger" className="px-3" onClick={() => handleDelete(item._id)}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminResourcePage;
