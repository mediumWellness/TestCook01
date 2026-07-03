import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const emptyForm = {
  title: '',
  description: '',
  ingredients: '',
  instructions: '',
  servings: '',
  cookTimeMinutes: '',
};

export default function RecipeForm({ initialValues, onSubmit, submitLabel = 'Save recipe' }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(initialValues
      ? {
          ...initialValues,
          ingredients: Array.isArray(initialValues.ingredients)
            ? initialValues.ingredients.join('\n')
            : initialValues.ingredients || '',
          servings: initialValues.servings ?? '',
          cookTimeMinutes: initialValues.cookTimeMinutes ?? '',
        }
      : {}),
  }));
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        ingredients: form.ingredients
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0),
        instructions: form.instructions.trim(),
        servings: form.servings === '' ? null : Number(form.servings),
        cookTimeMinutes: form.cookTimeMinutes === '' ? null : Number(form.cookTimeMinutes),
      };
      const result = await onSubmit(payload);
      navigate(`/recipes/${result.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}

      <label>
        Title
        <input name="title" value={form.title} onChange={handleChange} required />
      </label>

      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} rows={2} />
      </label>

      <label>
        Ingredients (one per line)
        <textarea
          name="ingredients"
          value={form.ingredients}
          onChange={handleChange}
          rows={6}
          required
        />
      </label>

      <label>
        Instructions
        <textarea
          name="instructions"
          value={form.instructions}
          onChange={handleChange}
          rows={8}
          required
        />
      </label>

      <div className="form-row">
        <label>
          Servings
          <input
            type="number"
            min="1"
            name="servings"
            value={form.servings}
            onChange={handleChange}
          />
        </label>

        <label>
          Cook time (minutes)
          <input
            type="number"
            min="1"
            name="cookTimeMinutes"
            value={form.cookTimeMinutes}
            onChange={handleChange}
          />
        </label>
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
