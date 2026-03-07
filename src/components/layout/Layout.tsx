import { ReactNode } from "react";
import TopBar from "@/components/medico/TopBar";
import HeaderInfo from "@/components/medico/HeaderInfo";
import Navbar from "@/components/medico/Navbar";
import FooterMedico from "@/components/medico/FooterMedico";
import WhatsAppButton from "./WhatsAppButton";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <HeaderInfo />
      <Navbar />
      <main className="flex-1">{children}</main>
      <FooterMedico />
      <WhatsAppButton />
    </div>
  );
};

export default Layout;
