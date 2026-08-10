"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, Mail, Shield, Building2, UserCheck, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";

const roles = ["ALL", "BUYER", "SELLER", "ADMIN", "SUPER_ADMIN"];

export default function AdminAllUsersPage() {
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data: session } = useSession();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin", "all-users", selectedRole],
    queryFn: async () => {
      const url = selectedRole === "ALL" ? "/api/admin/users" : `/api/admin/users?role=${selectedRole}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account? This will cascade delete their associated company profiles and product listings. This action is irreversible.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        refetch();
      } else {
        const json = await res.json();
        alert(json.error ?? "Failed to delete user account.");
      }
    } catch (err) {
      alert("An unexpected error occurred while attempting deletion.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = (users ?? []).filter((u: Record<string, unknown>) => {
    const name = String(u.name ?? "").toLowerCase();
    const email = String(u.email ?? "").toLowerCase();
    const role = String(u.role ?? "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || role.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">
            User Account Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Directory of all registered buyers, sellers, and admin accounts.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Role filter buttons */}
      <div className="flex flex-wrap gap-2">
        {roles.map((r) => (
          <Button
            key={r}
            size="sm"
            variant={selectedRole === r ? "default" : "outline"}
            onClick={() => setSelectedRole(r)}
            className="text-xs"
          >
            {r.replace("_", " ")}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">
          Loading user database...
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold font-heading mb-1">No Users Found</h3>
            <p className="text-sm text-muted-foreground">No accounts match the criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((user: Record<string, unknown>) => {
            const role = String(user.role);
            return (
              <Card key={String(user._id)}>
                <CardContent className="p-5 flex items-start gap-4 justify-between">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {String(user.name).charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold font-heading text-sm truncate">
                          {String(user.name)}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            role === "SUPER_ADMIN" || role === "ADMIN"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                              : role === "SELLER"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "status-approved"
                          }`}
                        >
                          {role.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {String(user.email)}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 pt-1">
                        Joined: {new Date(String(user.createdAt)).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {session?.user?.role === "SUPER_ADMIN" &&
                    String(user._id) !== session?.user?.id &&
                    role !== "SUPER_ADMIN" && (
                      <button
                        onClick={() => handleDelete(String(user._id))}
                        disabled={deletingId === String(user._id)}
                        className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 self-center disabled:opacity-50"
                        title="Permanently delete user account"
                      >
                        {deletingId === String(user._id) ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
