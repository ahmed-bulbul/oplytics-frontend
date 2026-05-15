"use client"

import * as React from "react"
import { createContext, useContext, useState, useCallback } from "react"

export interface Tag {
  id: string
  name: string
  color: string
}

interface TagAssignment {
  itemId: string
  tagIds: string[]
}

interface TagContextType {
  tags: Tag[]
  assignments: TagAssignment[]
  addTag: (name: string, color: string) => Tag
  removeTag: (tagId: string) => void
  assignTag: (itemId: string, tagId: string) => void
  unassignTag: (itemId: string, tagId: string) => void
  getTagsForItem: (itemId: string) => Tag[]
  getItemsWithTag: (tagId: string) => string[]
}

const TagContext = createContext<TagContextType | undefined>(undefined)

// Predefined color options for tags
export const TAG_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
]

// Default tags
const defaultTags: Tag[] = [
  { id: "high-performer", name: "High Performer", color: "#10b981" },
  { id: "needs-attention", name: "Needs Attention", color: "#f59e0b" },
  { id: "testing", name: "Testing", color: "#3b82f6" },
  { id: "seasonal", name: "Seasonal", color: "#8b5cf6" },
  { id: "evergreen", name: "Evergreen", color: "#22c55e" },
]

export function TagProvider({ children }: { children: React.ReactNode }) {
  const [tags, setTags] = useState<Tag[]>(defaultTags)
  const [assignments, setAssignments] = useState<TagAssignment[]>([])

  const addTag = useCallback((name: string, color: string): Tag => {
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name,
      color,
    }
    setTags((prev) => [...prev, newTag])
    return newTag
  }, [])

  const removeTag = useCallback((tagId: string) => {
    setTags((prev) => prev.filter((t) => t.id !== tagId))
    setAssignments((prev) =>
      prev.map((a) => ({
        ...a,
        tagIds: a.tagIds.filter((id) => id !== tagId),
      })).filter((a) => a.tagIds.length > 0)
    )
  }, [])

  const assignTag = useCallback((itemId: string, tagId: string) => {
    setAssignments((prev) => {
      const existing = prev.find((a) => a.itemId === itemId)
      if (existing) {
        if (existing.tagIds.includes(tagId)) return prev
        return prev.map((a) =>
          a.itemId === itemId
            ? { ...a, tagIds: [...a.tagIds, tagId] }
            : a
        )
      }
      return [...prev, { itemId, tagIds: [tagId] }]
    })
  }, [])

  const unassignTag = useCallback((itemId: string, tagId: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.itemId === itemId
          ? { ...a, tagIds: a.tagIds.filter((id) => id !== tagId) }
          : a
      ).filter((a) => a.tagIds.length > 0)
    )
  }, [])

  const getTagsForItem = useCallback((itemId: string): Tag[] => {
    const assignment = assignments.find((a) => a.itemId === itemId)
    if (!assignment) return []
    return tags.filter((t) => assignment.tagIds.includes(t.id))
  }, [assignments, tags])

  const getItemsWithTag = useCallback((tagId: string): string[] => {
    return assignments
      .filter((a) => a.tagIds.includes(tagId))
      .map((a) => a.itemId)
  }, [assignments])

  return (
    <TagContext.Provider
      value={{
        tags,
        assignments,
        addTag,
        removeTag,
        assignTag,
        unassignTag,
        getTagsForItem,
        getItemsWithTag,
      }}
    >
      {children}
    </TagContext.Provider>
  )
}

export function useTags() {
  const context = useContext(TagContext)
  if (!context) {
    throw new Error("useTags must be used within a TagProvider")
  }
  return context
}
