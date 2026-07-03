import { Link } from 'react-router-dom';

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipes/${recipe.id}`} className="recipe-card">
      <h3>{recipe.title}</h3>
      {recipe.description && <p className="recipe-card-description">{recipe.description}</p>}
      <div className="recipe-card-meta">
        {recipe.cookTimeMinutes != null && <span>⏱ {recipe.cookTimeMinutes} min</span>}
        {recipe.servings != null && <span>🍽 {recipe.servings} servings</span>}
      </div>
    </Link>
  );
}
