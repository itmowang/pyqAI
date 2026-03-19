import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import MomentsTheme from './themes/moments/MomentsTheme';
import PostDetail from './themes/moments/components/PostDetail';

function App() {
  useTheme(); // 加载主题

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MomentsTheme />} />
        <Route path="/post/:postId" element={<PostDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
