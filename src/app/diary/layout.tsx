import { TabBar } from "@/components/TabBar";

export default function GenericLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-32">
      {children}
      <TabBar />
    </div>
  );
}
