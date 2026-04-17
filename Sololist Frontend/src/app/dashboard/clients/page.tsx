"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ClientList } from "@/components/dashboard/ClientList";
import { ClientDetail } from "@/components/dashboard/ClientDetail";
import { AddClientDrawer } from "@/components/dashboard/AddClientDrawer";
import { getClients, ClientResponse } from "@/lib/api";

function ClientsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const fetchClientsList = async () => {
    try {
      const data = await getClients();
      setClients(data);
      if (data.length > 0 && selectedClientId === null) {
        setSelectedClientId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsList();
  }, []);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setIsAddDrawerOpen(true);
      // Clear the param
      router.replace("/dashboard/clients");
    }
  }, [searchParams]);

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const handleSelectClient = (id: number) => {
    setSelectedClientId(id);
  };

  return (
    <div className="flex h-[calc(100vh-72px)] overflow-hidden">
      <ClientList 
        clients={clients} 
        activeId={selectedClientId} 
        onSelect={handleSelectClient} 
        onClientAdded={fetchClientsList}
      />

      {selectedClient && <ClientDetail client={selectedClient} />}
      
      {/* Explicit drawer controlled by search params or page state */}
      <AddClientDrawer 
        open={isAddDrawerOpen} 
        onOpenChange={setIsAddDrawerOpen} 
        onClientAdded={fetchClientsList}
        trigger={null} 
      />
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading Hub...</div>}>
      <ClientsContent />
    </Suspense>
  );
}
