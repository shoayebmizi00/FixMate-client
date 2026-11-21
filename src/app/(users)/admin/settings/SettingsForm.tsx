"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { toast } from "@/components/ui/toast";
import { SERVICE_CATEGORIES, SERVICE_MODES } from "@/lib/categories";

export default function SettingsForm() {
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customModes, setCustomModes] = useState<string[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [modeName, setModeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings");
        const data = (await response.json()) as {
          categories?: string[];
          modes?: string[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Could not load settings.");
        }

        setCustomCategories(data.categories ?? []);
        setCustomModes(data.modes ?? []);
      } catch (error) {
        toast.add({
          title: "Settings unavailable",
          description:
            error instanceof Error ? error.message : "Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    void loadSettings();
  }, []);

  async function saveSettings(
    nextCategories: string[],
    nextModes: string[]
  ) {
    setSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: nextCategories,
          modes: nextModes,
        }),
      });
      const data = (await response.json()) as {
        categories?: string[];
        modes?: string[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save settings.");
      }

      setCustomCategories(data.categories ?? nextCategories);
      setCustomModes(data.modes ?? nextModes);
    } catch (error) {
      toast.add({
        title: "Could not save",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = categoryName.trim();

    if (!name) return;

    const known = [...SERVICE_CATEGORIES, ...customCategories].some(
      (item) => item.toLowerCase() === name.toLowerCase()
    );

    if (known) {
      toast.add({
        title: "Category already exists",
        description: "Choose a different category name.",
        type: "error",
      });
      return;
    }

    await saveSettings([...customCategories, name], customModes);
    setCategoryName("");
    toast.add({
      title: "Category added",
      description: `${name} is now available to technicians.`,
      type: "success",
    });
  }

  async function addMode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = modeName.trim();

    if (!name) return;

    const known = [...SERVICE_MODES, ...customModes].some(
      (item) => item.toLowerCase() === name.toLowerCase()
    );

    if (known) {
      toast.add({
        title: "Service mode already exists",
        description: "Choose a different service mode name.",
        type: "error",
      });
      return;
    }

    await saveSettings(customCategories, [...customModes, name]);
    setModeName("");
    toast.add({
      title: "Service mode added",
      description: `${name} is now available to technicians.`,
      type: "success",
    });
  }

  async function removeCategory(name: string) {
    await saveSettings(
      customCategories.filter((item) => item !== name),
      customModes
    );
  }

  async function removeMode(name: string) {
    await saveSettings(
      customCategories,
      customModes.filter((item) => item !== name)
    );
  }

  if (loading) {
    return (
      <div className="h-72 animate-pulse rounded-xl bg-white" role="status">
        Loading settings
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-[15px] font-semibold text-slate-900">Custom categories</h2>
        <p className="mt-1 text-[12.5px] text-slate-500">
          Built-in categories are listed below. Add categories that technicians can select.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[...SERVICE_CATEGORIES, ...customCategories].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-700"
            >
              {item}
              {customCategories.includes(item) ? (
                <button
                  type="button"
                  onClick={() => void removeCategory(item)}
                  disabled={saving}
                  className="text-rose-500 hover:text-rose-700"
                  aria-label={`Remove ${item}`}
                >
                  ×
                </button>
              ) : null}
            </span>
          ))}
        </div>

        <form onSubmit={addCategory} className="mt-5 flex gap-2">
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="New category"
            className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-400"
          />
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Add"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-[15px] font-semibold text-slate-900">Custom service modes</h2>
        <p className="mt-1 text-[12.5px] text-slate-500">
          Built-in modes are listed below. Add modes that technicians can select.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[...SERVICE_MODES, ...customModes].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-700"
            >
              {item}
              {customModes.includes(item) ? (
                <button
                  type="button"
                  onClick={() => void removeMode(item)}
                  disabled={saving}
                  className="text-rose-500 hover:text-rose-700"
                  aria-label={`Remove ${item}`}
                >
                  ×
                </button>
              ) : null}
            </span>
          ))}
        </div>

        <form onSubmit={addMode} className="mt-5 flex gap-2">
          <input
            value={modeName}
            onChange={(event) => setModeName(event.target.value)}
            placeholder="New service mode"
            className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-400"
          />
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Add"}
          </button>
        </form>
      </section>
    </div>
  );
}
