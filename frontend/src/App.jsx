import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "./components/RootLayout";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";
import AuthorProfile from "./components/AuthorProfile";
import AuthorArticles from "./components/AuthorArticles";
import AdminProfile from "./components/AdminProfile";
import ListOfUsers from "./components/ListOfUsers";
import EditArticle from "./components/EditArticle";
import WriteArticles from "./components/WriteArticles";
import ArticleByID from "./components/ArticleByID";
import Articles from "./components/Articles";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoutes";
import Unauthorized from "./components/Unauthorized";

function App() {
  const routerObj = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { path: "", element: <Home /> },
        { path: "unauthorized", element: <Unauthorized /> },
        { path: "register", element: <Register /> },
        { path: "login", element: <Login /> },

        // ✅ Public articles listing page
        { path: "articles", element: <Articles /> },

        {
          path: "user-profile",
          element: (
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserProfile />
            </ProtectedRoute>
          ),
        },
        {
          path: "author-profile",
          element: (
            <ProtectedRoute allowedRoles={["AUTHOR"]}>
              <AuthorProfile />
            </ProtectedRoute>
          ),
          children: [
            { index: true, element: <AuthorArticles /> },
            { path: "articles", element: <AuthorArticles /> },
            { path: "write-article", element: <WriteArticles /> },
          ],
        },
        {
          path: "admin-profile",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminProfile />
            </ProtectedRoute>
          ),
          children: [
            { index: true, element: <ListOfUsers /> },
            { path: "users", element: <ListOfUsers /> },
          ],
        },
        { path: "article/:id", element: <ArticleByID /> },
        { path: "edit-article", element: <EditArticle /> },
      ],
    },
  ]);

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <RouterProvider router={routerObj} />
    </div>
  );
}

export default App;