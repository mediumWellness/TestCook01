import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecipes } from '../api/recipes';
import RecipeCard from '../components/RecipeCard';

export default function RecipeListPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRecipes()
      .then(setRecipes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Recipes</h1>
        <Link to="/recipes/new" className="button-link">
          + New recipe
        </Link>
      </div>

      {loading && <p>Loading recipes…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && recipes.length === 0 && (
        <p>No recipes yet. Create your first one!</p>
      )}

      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
