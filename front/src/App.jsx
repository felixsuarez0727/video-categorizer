import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import Loader from './components/Loader';
import Video from './pages/Video';

const routes = [
  {
    path: '/',
    title: 'Index',
    element: <Index />
  },
  {
    path: '/:videoUuid',
    title: 'Video',
    element: <Video />
  },
 
];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 0);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
     
        <Routes>
          {routes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <>
                  
                    {
                      element
                    }

                </>
              }
            />
          ))}
        </Routes>
     
    </>
  );
}

export default Dashboard;