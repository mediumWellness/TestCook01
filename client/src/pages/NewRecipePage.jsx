import RecipeForm from '../components/RecipeForm';
import { createRecipe } from '../api/recipes';

export default function NewRecipePage() {
  return (
    <div>
      <h1>New recipe</h1>
      <RecipeForm onSubmit={createRecipe} submitLabel="Create recipe" />
    </div>
  );
}
