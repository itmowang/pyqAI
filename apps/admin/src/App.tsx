import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostList from './pages/posts/PostList';
import PostCreate from './pages/posts/PostCreate';
import PostEdit from './pages/posts/PostEdit';
import TagList from './pages/tags/TagList';
import CommentList from './pages/comments/CommentList';
import ThemeSettings from './pages/theme/ThemeSettings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="posts" element={<PostList />} />
        <Route path="posts/create" element={<PostCreate />} />
        <Route path="posts/edit/:id" element={<PostEdit />} />
        <Route path="tags" element={<TagList />} />
        <Route path="comments" element={<CommentList />} />
        <Route path="theme" element={<ThemeSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
