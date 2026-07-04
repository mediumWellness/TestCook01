import { Routes, Route, Link, NavLink } from 'react-router-dom';
import RecipeListPage from './pages/RecipeListPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import NewRecipePage from './pages/NewRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import MrTestyPage from './pages/MrTestyPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <Link to="/" className="app-title">
            🍳 TestCook01
          </Link>
          <nav className="app-nav" aria-label="Primary">
            <NavLink
              to="/"
              className={({ isActive }) => `app-nav-link${isActive ? ' is-active' : ''}`}
              end
            >
              Recipes
            </NavLink>
            <NavLink
              to="/mr-testy"
              className={({ isActive }) => `app-nav-link${isActive ? ' is-active' : ''}`}
            >
              Mr Testy
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<RecipeListPage />} />
          <Route path="/mr-testy" element={<MrTestyPage />} />
          <Route path="/recipes/new" element={<NewRecipePage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
