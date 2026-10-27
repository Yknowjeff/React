import { useEffect } from "react";
import FormField from "./FormField.jsx";
import { useValidatedField } from "../hooks/useValidatedField.js";

/**
 * Registers a new category, or edits one when `editingCategory` is provided.
 * Validation rule is unchanged from the midterm: both fields must be non-blank.
 */
export default function CategoryForm({ onAdd, onUpdate, editingCategory, onCancelEdit }) {
  const name = useValidatedField();
  const desc = useValidatedField();
  const isEditing = Boolean(editingCategory);

  // Fill the form when edit starts, clear it when edit ends.
  useEffect(() => {
    name.reset(editingCategory?.name ?? "");
    desc.reset(editingCategory?.description ?? "");
    if (editingCategory) name.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingCategory?.id]);

  const handleSave = () => {
    const nameOk = name.validate();
    const descOk = desc.validate();

    // Guard clause: inline feedback, focus first invalid field
    if (!nameOk || !descOk) {
      (!nameOk ? name : desc).focus();
      return;
    }

    const data = { name: name.value.trim(), description: desc.value.trim() };

    if (isEditing) {
      onUpdate(editingCategory.id, data);
    } else {
      onAdd(data);
    }

    // Reset inputs, clear validation styles, refocus
    name.reset();
    desc.reset();
    name.focus();
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white py-3">
        <h2 className="fs-6 mb-0 fw-bold">
          {isEditing ? "Edit Income Category" : "Income Category Registration"}
        </h2>
      </div>
      <div className="card-body">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <FormField
            id="txtCatName"
            label="Category Name"
            placeholder="e.g., Consulting"
            errorMessage="Please enter a category name."
            ref={name.ref}
            value={name.value}
            status={name.status}
            onChange={name.onChange}
            onBlur={name.onBlur}
          />
          <FormField
            id="txtCatDesc"
            label="Description"
            placeholder="e.g., Enterprise technical support contract"
            errorMessage="Please enter a description."
            ref={desc.ref}
            value={desc.value}
            status={desc.status}
            onChange={desc.onChange}
            onBlur={desc.onBlur}
          />
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary px-4 fw-semibold">
              {isEditing ? "Update Category" : "Save Category"}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-outline-secondary" onClick={onCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
