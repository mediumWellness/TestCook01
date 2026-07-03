import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import { getRecipe, updateRecipe } from '../api/recipes';

export default function EditRecipePage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRecipe(id)
      .then(setRecipe)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading recipe…</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!recipe) return null;

  return (
    <div>
      <h1>Edit recipe</h1>
      <RecipeForm
        initialValues={recipe}
        onSubmit={(payload) => updateRecipe(id, payload)}
        submitLabel="Save changes"
      />
    </div>
  );
}
