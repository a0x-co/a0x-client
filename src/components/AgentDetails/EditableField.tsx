import React, { useState } from "react";
import { Badge } from "../shadcn/badge";
import { Check, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  id: string;
  label: string;
  sublabel: string;
  value: string | string[];
  onChange: (value: string, index?: number) => void;
  onDelete?: (value: string) => void;
  isTextarea?: boolean;
  isBadges?: boolean;
  editableIndex: string | null;
  setEditableIndex: (index: string | null) => void;
  addableIndex: string | null;
  setAddableIndex: (index: string | null) => void;
  addableValue: string;
  setAddableValue: (value: string) => void;
  isOwner: boolean;
  themes: Record<
    string,
    {
      container: string;
      tabs: string;
      tabActive: string;
      tabInactive: string;
      tabIconActive: string;
      tabIconInactive: string;
      textTitles: string;
      card: string;
    }
  >;
  from: "dashboard" | "personality-page";
  editingBadgeValue: string;
  setEditingBadgeValue: (value: string) => void;
  sizeBadge?: string;
  icon?: React.ElementType;
}

const EditableField: React.FC<EditableFieldProps> = ({
  id,
  label,
  sublabel,
  value,
  onChange,
  onDelete,
  isTextarea,
  isBadges,
  editableIndex,
  setEditableIndex,
  addableIndex,
  setAddableIndex,
  addableValue,
  setAddableValue,
  isOwner,
  from,
  themes,
  editingBadgeValue,
  setEditingBadgeValue,
  sizeBadge = "text-base",
  icon: Icon,
}) => {
  return (
    <div className="flex flex-col gap-2 group/editable">
      <div className="flex justify-between items-center">
        <h2
          className={`text-lg font-medium flex items-center gap-2 ${themes[from].textTitles}`}
        >
          {Icon && <Icon className={`w-5 h-5 ${themes[from].tabIconActive}`} />}
          {label}
        </h2>

        <p className="ml-auto text-sm text-gray-500">{sublabel}</p>
        {!isBadges && isOwner && (
          <button
            onClick={() =>
              setEditableIndex(editableIndex === null ? `${id}-${label}` : null)
            }
            className="ml-2 p-2 rounded-xl text-sm font-normal text-white bg-blue-500 hover:bg-blue-600 transition-all duration-300 group-hover/editable:opacity-100 opacity-0"
          >
            {editableIndex === `${id}-${label}` ? (
              <Check className="w-4 h-4" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {editableIndex === `${id}-${label}` && isOwner ? (
        isTextarea ? (
          <textarea
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-full px-3 py-2 rounded-xl border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-36 text-black",
              themes[from].card
            )}
            placeholder={`e.g., ${label}...`}
          />
        ) : (
          <input
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-full px-3 py-2 rounded-xl border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black",
              themes[from].card
            )}
            placeholder={`e.g., ${label}...`}
          />
        )
      ) : isBadges ? (
        <div className="flex flex-wrap gap-2 group/list">
          {(value as string[]).map((trait, index) => (
            <Badge
              key={trait}
              className={cn(
                "p-3 rounded-xl transition-all duration-300 inline-flex items-center group/badge relative w-full",
                themes[from].card,
                sizeBadge,
                editableIndex === `${id}-${label}-${trait}` &&
                  "from-blue-50/50 to-white border-blue-400 shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_8px_20px_rgba(59,130,246,0.1)]"
              )}
              onClick={() => {
                setEditableIndex(`${id}-${label}-${trait}`);
                setEditingBadgeValue(trait);
              }}
            >
              {editableIndex === `${id}-${label}-${trait}` ? (
                <input
                  type="text"
                  autoFocus
                  value={editingBadgeValue}
                  onChange={(e) => setEditingBadgeValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && editingBadgeValue.trim() !== "") {
                      onChange(editingBadgeValue, index);
                      setEditableIndex(null);
                    }
                  }}
                  onBlur={() => {
                    if (editingBadgeValue.trim() !== "") {
                      onChange(editingBadgeValue, index);
                      setEditableIndex(null);
                    }
                  }}
                  className={cn(
                    "min-w-96 w-full px-3 rounded-xl bg-transparent focus:ring-0 focus:outline-none focus:border-transparent transition-all",
                    from === "personality-page" ? "text-black" : "text-white"
                  )}
                  placeholder={`e.g., ${label}...`}
                />
              ) : (
                <span className={cn("px-2", themes[from].textTitles)}>
                  {trait}
                </span>
              )}
              {isOwner && editableIndex !== `${id}-${label}-${trait}` ? (
                <button
                  onClick={() => {
                    setEditableIndex(`${id}-${label}-${trait}`);
                    setEditingBadgeValue(trait);
                  }}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 flex items-center justify-center bg-gray-900/90 text-white rounded-full w-0 h-0 opacity-0 group-hover/badge:w-6 group-hover/badge:h-6 group-hover/badge:opacity-100 group-hover/badge:translate-x-0 transition-all duration-300 z-10 hover:bg-blue-500"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onChange(editingBadgeValue, index);
                    setEditableIndex(null);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center bg-gray-900/90 text-white rounded-full w-0 h-0 opacity-0 group-hover/badge:w-6 group-hover/badge:h-6 group-hover/badge:opacity-100 group-hover/badge:translate-x-0 transition-all duration-300 z-10 hover:bg-blue-500"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {onDelete &&
                isOwner &&
                editableIndex !== `${id}-${label}-${trait}` && (
                  <button
                    onClick={() => onDelete(trait)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center bg-gray-900/90 text-white rounded-full w-0 h-0 opacity-0 group-hover/badge:w-6 group-hover/badge:h-6 group-hover/badge:opacity-100 group-hover/badge:translate-x-0 transition-all duration-300 z-10 hover:bg-rose-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
            </Badge>
          ))}
          {addableIndex === `${id}-${label}` && isOwner ? (
            <>
              <input
                type="text"
                value={addableValue}
                onChange={(e) => setAddableValue(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-xl  focus:border-transparent transition-all",
                  from === "dashboard"
                    ? "bg-transparent border border-green-500 text-gray-100 focus:ring-0"
                    : "bg-gray-800/50 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
                )}
                placeholder={`e.g., ${label}...`}
              />
              <button
                onClick={() => setAddableIndex(null)}
                className="text-gray-200 px-2.5 border border-transparent bg-blue-500 hover:bg-blue-600 transition-colors rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (addableValue.trim() !== "") {
                    onChange(addableValue);
                    setAddableIndex(null);
                    setAddableValue("");
                  }
                }}
                className={cn(
                  "text-gray-200 px-2.5 border border-transparent  transition-colors rounded-xl",
                  from === "dashboard"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-blue-500 hover:bg-blue-600"
                )}
              >
                Add
              </button>
            </>
          ) : isOwner ? (
            <button
              onClick={() => setAddableIndex(`${id}-${label}`)}
              className={cn(
                "invisible group-hover/list:visible text-gray-200 px-2.5 border border-transparent transition-all rounded-xl",
                from === "dashboard"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              )}
            >
              Add
            </button>
          ) : null}
        </div>
      ) : (
        <p className="text-gray-900 py-2 border border-transparent font-medium">
          {value || `No ${label.toLowerCase()} provided`}
        </p>
      )}
    </div>
  );
};

export default EditableField;
