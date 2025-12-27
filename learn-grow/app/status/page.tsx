import React from "react";

type Status = "online" | "healthy" | "degraded" | "down" | "active" | "inactive" | "unknown";

async function getStatus() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  const res = await fetch(`${base.replace(/\/$/, "")}/status`, { cache: "no-store" });
  return res.json();
}

const Dot = ({ status }: { status: Status }) => {
  const color = ((): string => {
    switch (status) {
      case "online":
      case "healthy":
      case "active":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "down":
      case "inactive":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  })();
  return <span className={`inline-block w-3 h-3 rounded-full ${color} mr-2`} />;
};

export default async function StatusPage() {
  const data = await getStatus();
  const server = data?.data?.server?.status ?? "unknown";
  const db = data?.data?.database?.status ?? "unknown";
  const pay = data?.data?.paymentGateway?.status ?? "unknown";

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">System Status</h1>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-md">
          <div className="flex items-center"><Dot status={server} /><span className="font-semibold">Server Status</span></div>
          <span className="capitalize text-gray-700">{String(server)}</span>
        </div>
        <div className="flex items-center justify-between p-4 border rounded-md">
          <div className="flex items-center"><Dot status={db} /><span className="font-semibold">Database</span></div>
          <span className="capitalize text-gray-700">{String(db)}</span>
        </div>
        <div className="flex items-center justify-between p-4 border rounded-md">
          <div className="flex items-center"><Dot status={pay} /><span className="font-semibold">Payment Gateway</span></div>
          <span className="capitalize text-gray-700">{String(pay)}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-6">Data is fetched live from the server.</p>
    </div>
  );
}
