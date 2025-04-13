import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import CheckUserOrServicer from "./components/checkUserOrServicer";
import CheckSignInOrSignUp from "./components/checkSignInOrSignUp";
import Login from "./components/login";
import Register from "./components/register";
import RegisterUser from "./components/registerUser";
import Home from "./components/homePage";
import ServicesJobs from "./components/servicesJobs";
import ServicerPage from "./components/servicerPage";
import BookPage from "./components/bookPage";
import ChatPage from "./components/chat";
import ChatsListPage from "./components/chatList";
import SettingsPage from "./components/SettingsPage";
import Contact from "./components/contact";
import ComplaintsPage  from "./components/ComplaintsPage";
import Admin  from "./components/adminDashBoard";


const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
       <Route path="/check_sign" element={<CheckSignInOrSignUp/>} />
        <Route path="/check_user" element={<CheckUserOrServicer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register_user" element={<RegisterUser />} />
        <Route path="/services_jobs/:serviceType" element={<ServicesJobs />} />
        <Route path="/servicer_page" element={<ServicerPage />} />
        <Route path="/book_page/:providerId" element={<BookPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/chat/:providerId" element={<ChatPage />} />
        <Route path="/chats" element={<ChatsListPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route path="/admin" element={<Admin />} />
      </>
    )
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App