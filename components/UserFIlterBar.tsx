'use client';

import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
}

export default function UserFilterBar({ search, setSearch, sortBy, setSortBy }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <Input
        placeholder="Search by email or username"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-gray-900 border-gray-800 text-white"
      />
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-48 bg-gray-900 border-gray-800 text-white">
          Sort by
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Newest</SelectItem>
          <SelectItem value="username">Username</SelectItem>
          <SelectItem value="email">Email</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
