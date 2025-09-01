"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { getCookie } from "@/utils/cookie";

interface Country {
  _id: string;
  name: string;
  code: string;
  dial: number;
  flag: string;
  active: boolean;
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Country>>({});
  const token = getCookie("token");

  useEffect(() => {
    setLoading(true);
    fetch("/api/countries/all", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCountries(data.countries);
      })
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (country: Country) => {
    setEditId(country._id);
    setEditData({
      name: country.name,
      code: country.code,
      dial: country.dial,
      flag: country.flag,
      active: country.active,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const handleChange = (field: keyof Country, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/countries/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      if (updated.success) {
        setCountries((prev) =>
          prev.map((c) =>
            c._id === id ? ({ ...c, ...editData } as Country) : c
          )
        );
        cancelEdit();
      } else {
        alert(updated.error || "Update failed");
      }
    } catch (err) {
      alert("Failed to update country");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this country?")) return;

    const res = await fetch(`/api/countries/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      setCountries((prev) => prev.filter((c) => c._id !== id));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Countries</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : countries.length === 0 ? (
          <p className="text-center text-gray-500">No countries found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flag</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Dial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((country) => {
                const isEditing = editId === country._id;
                return (
                  <TableRow key={country._id}>
                    <TableCell>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.flag || ""}
                          onChange={(e) => handleChange("flag", e.target.value)}
                          className="border rounded px-1 w-32"
                          placeholder="Image URL"
                        />
                      ) : (
                        <img
                          src={country.flag}
                          alt={`${country.name} flag`}
                          className="w-8 h-6 object-cover rounded"
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name || ""}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className="border rounded px-1"
                        />
                      ) : (
                        country.name
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.code || ""}
                          onChange={(e) => handleChange("code", e.target.value)}
                          className="border rounded px-1 uppercase"
                          maxLength={3}
                        />
                      ) : (
                        country.code
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.dial || ""}
                          onChange={(e) =>
                            handleChange("dial", Number(e.target.value))
                          }
                          className="border rounded px-1 w-20"
                        />
                      ) : (
                        `+${country.dial}`
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <select
                          value={editData.active ? "active" : "inactive"}
                          onChange={(e) =>
                            handleChange("active", e.target.value === "active")
                          }
                          className="border rounded px-1"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : country.active ? (
                        "Active"
                      ) : (
                        "Inactive"
                      )}
                    </TableCell>

                    <TableCell className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => saveEdit(country._id)}
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={cancelEdit}
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => startEdit(country)}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(country._id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
