import { TabBar } from "@/components/TabBar";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen pb-32">{children}<TabBar /></div>;
}
