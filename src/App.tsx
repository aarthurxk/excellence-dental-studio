import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import TeamPage from "./pages/TeamPage";
import ServicesPage from "./pages/ServicesPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import VideosPage from "./pages/VideosPage";
import EventsPage from "./pages/EventsPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminServices from "./pages/admin/AdminServices";
import AdminDentists from "./pages/admin/AdminDentists";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminFeatures from "./pages/admin/AdminFeatures";
import AdminAbout from "./pages/admin/AdminAbout";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminRoadmap from "./pages/admin/AdminRoadmap";
import AdminUsers from "./pages/admin/AdminUsers";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/equipe" element={<TeamPage />} />
            <Route path="/tratamentos" element={<ServicesPage />} />
            <Route path="/depoimentos" element={<TestimonialsPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/eventos" element={<EventsPage />} />
            <Route path="/contato" element={<ContactPage />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminPage><AdminDashboard /></AdminPage>} />
            <Route path="/admin/tratamentos" element={<AdminPage><AdminServices /></AdminPage>} />
            <Route path="/admin/dentistas" element={<AdminPage><AdminDentists /></AdminPage>} />
            <Route path="/admin/depoimentos" element={<AdminPage><AdminTestimonials /></AdminPage>} />
            <Route path="/admin/videos" element={<AdminPage><AdminVideos /></AdminPage>} />
            <Route path="/admin/eventos" element={<AdminPage><AdminEvents /></AdminPage>} />
            <Route path="/admin/diferenciais" element={<AdminPage><AdminFeatures /></AdminPage>} />
            <Route path="/admin/sobre" element={<AdminPage><AdminAbout /></AdminPage>} />
            <Route path="/admin/mensagens" element={<AdminPage><AdminMessages /></AdminPage>} />
            <Route path="/admin/configuracoes" element={<AdminPage><AdminSettings /></AdminPage>} />
            <Route path="/admin/roadmap" element={<AdminPage><AdminRoadmap /></AdminPage>} />
            <Route path="/admin/usuarios" element={<AdminPage><AdminUsers /></AdminPage>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
