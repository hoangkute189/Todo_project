import MainPage from "./pages/MainPage";
import { createBrowserRouter } from "react-router-dom";

const App = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
]);

// const App = () => {
//   return (
//     <>
//       <MainPage />
//     </>
//   );
// };

export default App;
