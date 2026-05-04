import { Outlet } from 'react-router-dom';
import { useTheme } from '../theme/theme.jsx';
import Nav from './Nav.jsx';

// Shared shell for every authenticated screen: top nav + page body.
//
// <Outlet /> is react-router's "render the matching child route here"
// placeholder. We use it together with nested <Route> in App.jsx:
//
//   <Route element={<Layout/>}>          ← parent supplies the chrome
//     <Route path="/matches" element={<Matches/>} />     ← child
//     <Route path="/skills"  element={<Skills/>}  />
//   </Route>
//
// Both /matches and /skills get the same Nav for free.

export default function Layout() {
  const { m } = useTheme();
  return (
    <div
      style={{
        minHeight: '100vh',
        background: m.bg,
        color: m.ink,
        fontFamily: m.font,
      }}
    >
      <Nav />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
