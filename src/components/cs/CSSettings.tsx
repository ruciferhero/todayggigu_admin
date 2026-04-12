"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Save, RotateCcw } from "lucide-react";

export default function CSSettings() {
  const { t } = useLocale();

  const settings = [
    { key: "autoReply", label: "Auto Reply", description: "Enable automatic reply for common inquiries", type: "toggle", value: true },
    { key: "responseTime", label: "Response Time Target (hours)", description: "Target hours to respond to inquiries", type: "number", value: "24" },
    { key: "notifyEmail", label: "Notification Email", description: "Email to receive CS notifications", type: "text", value: "" },
    { key: "workingHours", label: "Working Hours", description: "CS operating hours", type: "text", value: "09:00 - 18:00" },
    { key: "holidayMessage", label: "Holiday Auto Message", description: "Message displayed during holidays", type: "textarea", value: "" },
    { key: "maxAttachments", label: "Max Attachments", description: "Maximum number of file attachments per inquiry", type: "number", value: "5" },
    { key: "chatEnabled", label: "Live Chat", description: "Enable real-time chat support", type: "toggle", value: false },
    { key: "satisfactionSurvey", label: "Satisfaction Survey", description: "Send survey after inquiry resolution", type: "toggle", value: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Customer Service Settings</h1>
        <div className="flex gap-2">
          <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />Reset</button>
          <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Save className="w-3.5 h-3.5" />Save Changes</button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {settings.map((s) => (
          <div key={s.key} className="flex items-center justify-between px-6 py-4">
            <div className="flex-1"><div className="text-sm font-medium text-gray-900">{s.label}</div><div className="text-xs text-gray-500 mt-0.5">{s.description}</div></div>
            <div className="ml-4 w-64">
              {s.type === "toggle" ? (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={s.value as boolean} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              ) : s.type === "textarea" ? (
                <textarea defaultValue={s.value as string} rows={2} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md" />
              ) : s.type === "number" ? (
                <input type="number" defaultValue={s.value as string} className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" />
              ) : (
                <input type="text" defaultValue={s.value as string} className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
