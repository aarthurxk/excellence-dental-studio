import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/layout/ScrollToTop";
import PageTransition from "@/components/layout/PageTransition";
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
import AdminResetPassword from "./pages/admin/AdminResetPassword";
import AdminBeforeAfter from "./pages/admin/AdminBeforeAfter";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import SiteChatWidget from "./components/layout/SiteChatWidget";
import WhatsAppButton from "./components/layout/WhatsAppButton";
import AnalyticsProvider from "./components/analytics/AnalyticsProvider";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminConversasVera from "./pages/admin/AdminConversasVera";
import AdminWhatsApp from "./pages/admin/AdminWhatsApp";
import AdminConversas from "./pages/admin/AdminConversas";

const queryClient = new QueryClient();

function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/sobre" element={<PageTransition><About /></PageTransition>} />
        <Route path="/equipe" element={<PageTransition><TeamPage /></PageTransition>} />
        <Route path="/tratamentos" element={<PageTransition><ServicesPage /></PageTransition>} />
        <Route path="/depoimentos" element={<PageTransition><TestimonialsPage /></PageTransition>} />
        <Route path="/videos" element={<PageTransition><VideosPage /></PageTransition>} />
        <Route path="/eventos" element={<PageTransition><EventsPage /></PageTransition>} />
        <Route path="/contato" element={<PageTransition><ContactPage /></PageTransition>} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
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
        <Route path="/admin/antes-depois" element={<AdminPage><AdminBeforeAfter /></AdminPage>} />
        <Route path="/admin/analytics" element={<AdminPage><AdminAnalytics /></AdminPage>} />
        <Route path="/admin/conversas-vera" element={<AdminPage><AdminConversasVera /></AdminPage>} />
        <Route path="/admin/whatsapp" element={<AdminPage><AdminWhatsApp /></AdminPage>} />
        <Route path="/admin/conversas" element={<AdminPage><AdminConversas /></AdminPage>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
          <AnalyticsProvider />
          <SiteChatWidget />
          <WhatsAppButton />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
