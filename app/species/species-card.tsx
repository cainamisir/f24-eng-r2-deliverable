"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { EditSpeciesDialog } from "./edit-species-card";
import { PenIcon, Trash2Icon } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesCard({ species, sessionId }: { species: Species; sessionId: string | undefined }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const canEdit = sessionId && species.author === sessionId;
  const router = useRouter();

  const handleDelete = async () => {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("species")
      .delete()
      .eq("id", species.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete species. " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Species deleted successfully.",
      });
      router.refresh();
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="relative flex flex-col m-4 w-72 min-w-72 rounded-lg border shadow-md overflow-hidden">
      {canEdit && (
        <div className="absolute top-2 right-2 z-10 flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white bg-opacity-50 hover:bg-opacity-100"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <PenIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white bg-opacity-50 hover:bg-opacity-100"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      )}
      {species.image && (
        <div className="relative h-48 w-full">
          <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
        </div>
      )}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-xl font-semibold text-gray-800 mb-1">{species.scientific_name}</h3>
        <h4 className="text-md font-light italic text-gray-600 mb-2">{species.common_name}</h4>
        {species.endangered && (
          <Badge variant="destructive" className="mb-2 w-fit">Endangered</Badge>
        )}
        <p className="text-sm text-gray-700 flex-grow">
          {species.description ? (species.description.length > 100 ? species.description.slice(0, 100).trim() + "..." : species.description) : ""}
        </p>
        
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {species.scientific_name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => void handleDelete()}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {canEdit && (
        <EditSpeciesDialog 
          species={species} 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
        />
      )}
    </div>
  );
}