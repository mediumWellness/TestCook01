import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteRecipe, getRecipe } from '../api/recipes';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getRecipe(id)
      .then(setRecipe)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Delete "${recipe.title}"? This cannot be undone.`)) return;
    try {
      await deleteRecipe(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading recipe…</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!recipe) return null;

  return (
    <div className="recipe-detail">
      <Link to="/">← Back to recipes</Link>
      <div className="page-header">
        <h1>{recipe.title}</h1>
        <div className="actions">
          <Link to={`/recipes/${recipe.id}/edit`} className="button-link">
            Edit
          </Link>
          <button onClick={handleDelete} className="button-danger">
            Delete
          </button>
        </div>
      </div>

      {recipe.description && <p className="recipe-description">{recipe.description}</p>}

      <div className="recipe-meta">
        {recipe.servings != null && <span>🍽 Servings: {recipe.servings}</span>}
        {recipe.cookTimeMinutes != null && <span>⏱ Cook time: {recipe.cookTimeMinutes} min</span>}
      </div>

      <h2>Ingredients</h2>
      <ul>
        {recipe.ingredients.map((ingredient, idx) => (
          <li key={idx}>{ingredient}</li>
        ))}
      </ul>

      <h2>Instructions</h2>
      <p className="recipe-instructions">{recipe.instructions}</p>
    </div>
  );
}
