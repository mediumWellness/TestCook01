import { lazy, Suspense } from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import './App.css';

const RecipeListPage = lazy(() => import('./pages/RecipeListPage'));
const RecipeDetailPage = lazy(() => import('./pages/RecipeDetailPage'));
const NewRecipePage = lazy(() => import('./pages/NewRecipePage'));
const EditRecipePage = lazy(() => import('./pages/EditRecipePage'));
const MrTestyPage = lazy(() => import('./pages/MrTestyPage'));

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
        <Suspense fallback={<p>Loading page…</p>}>
          <Routes>
            <Route path="/" element={<RecipeListPage />} />
            <Route path="/mr-testy" element={<MrTestyPage />} />
            <Route path="/recipes/new" element={<NewRecipePage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
