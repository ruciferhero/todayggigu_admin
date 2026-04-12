"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Plus, Eye, PlusCircle, Pencil, RotateCcw, Power, Trash2, X, Save } from "lucide-react";

interface RackRecord {
  id: string;
  rackDefinition: string;
  rackCode: string;
  size: string;
  startNumber: number;
  endNumber: number;
  totalRacks: number;
  usedRacks: number;
  isActive: boolean;
  registrationDate: string;
}

const RackManagement: React.FC = () => {
  const { t } = useLocale();
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRack, setSelectedRack] = useState<RackRecord | null>(null);

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    rackCode1: "",
    rackCode2: "",
    startNumber: "",
    endNumber: "",
    size: "",
    useCategory: "",
  });

  // Add form state
  const [addForm, setAddForm] = useState({ addCount: "" });

  // Edit form state
  const [editForm, setEditForm] = useState({ size: "", isActive: true });

  const [records] = useState<RackRecord[]>([
    { id: "1", rackDefinition: "China Omnicor", rackCode: "BB-B", size: "0*0", startNumber: 1, endNumber: 999, totalRacks: 999, usedRacks: 0, isActive: true, registrationDate: "April 04, 2025" },
    { id: "2", rackDefinition: "No data", rackCode: "A-A", size: "0*0", startNumber: 1, endNumber: 999, totalRacks: 999, usedRacks: 0, isActive: true, registrationDate: "April 04, 2025" },
    { id: "3", rackDefinition: "No data", rackCode: "AA-Q", size: "0*0", startNumber: 1, endNumber: 200, totalRacks: 200, usedRacks: 0, isActive: true, registrationDate: "April 04, 2025" },
    { id: "4", rackDefinition: "No data", rackCode: "AA-Q", size: "Other", startNumber: 1, endNumber: 720, totalRacks: 720, usedRacks: 0, isActive: true, registrationDate: "April 04, 2025" },
    { id: "5", rackDefinition: "number", rackCode: "dan-C", size: "Other", startNumber: 1, endNumber: 999, totalRacks: 999, usedRacks: 0, isActive: true, registrationDate: "April 04, 2025" },
  ]);

  const [rackDetails] = useState([
    { rackNumber: "BB-B-001", status: "Available" },
    { rackNumber: "BB-B-002", status: "Available" },
    { rackNumber: "BB-B-005", status: "Available" },
    { rackNumber: "BB-B-007", status: "Available" },
    { rackNumber: "BB-B-008", status: "Available" },
    { rackNumber: "BB-B-010", status: "Available" },
    { rackNumber: "BB-B-013", status: "Available" },
    { rackNumber: "BB-B-016", status: "Available" },
  ]);

  const handleRegister = () => {
    setRegisterForm({ rackCode1: "", rackCode2: "", startNumber: "", endNumber: "", size: "", useCategory: "" });
    setRegisterModalVisible(true);
  };

  const handleRegisterSubmit = () => {
    console.log("Register:", registerForm);
    setRegisterModalVisible(false);
  };

  const handleViewDetails = (record: RackRecord) => {
    setSelectedRack(record);
    setDetailModalVisible(true);
  };

  const handleAddRack = (record: RackRecord) => {
    setSelectedRack(record);
    setAddForm({ addCount: "" });
    setAddModalVisible(true);
  };

  const handleAddSubmit = () => {
    console.log("Add rack:", addForm);
    setAddModalVisible(false);
  };

  const handleEdit = (record: RackRecord) => {
    setSelectedRack(record);
    setEditForm({ size: record.size, isActive: record.isActive });
    setEditModalVisible(true);
  };

  const handleEditSubmit = () => {
    console.log("Edit rack:", editForm);
    setEditModalVisible(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t("rack.management.title")}</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <button onClick={handleRegister} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            {t("rack.management.register")}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("rack.management.rackDefinition")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("rack.management.rackCode")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("rack.management.size")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("rack.management.range")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.management.totalRacks")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.management.usedRacks")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.management.isActive")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("rack.management.registrationDate")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.management.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{record.rackDefinition}</td>
                  <td className="px-4 py-3">{record.rackCode}</td>
                  <td className="px-4 py-3">{record.size}</td>
                  <td className="px-4 py-3">{record.startNumber} ~ {record.endNumber}</td>
                  <td className="px-4 py-3 text-center">{record.totalRacks}</td>
                  <td className="px-4 py-3 text-center">{record.usedRacks}</td>
                  <td className="px-4 py-3 text-center">{record.isActive ? t("rack.management.yes") : t("rack.management.no")}</td>
                  <td className="px-4 py-3">{record.registrationDate}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      <button onClick={() => handleViewDetails(record)} className="text-blue-600 hover:text-blue-800 text-xs px-1">{t("rack.management.rackDetails")}</button>
                      <button onClick={() => handleAddRack(record)} className="text-blue-600 hover:text-blue-800 text-xs px-1">{t("rack.management.addRack")}</button>
                      <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800 text-xs px-1">{t("rack.management.correction")}</button>
                      <button className="text-red-600 hover:text-red-800 text-xs px-1">{t("rack.management.reset")}</button>
                      <button className="text-blue-600 hover:text-blue-800 text-xs px-1">{record.isActive ? t("rack.management.notInUse") : t("rack.management.use")}</button>
                      <button className="text-red-600 hover:text-red-800 text-xs px-1">{t("rack.management.delete")}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
      {registerModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t("rack.management.registerModal")}</h2>
              <button onClick={() => setRegisterModalVisible(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.rackCode1")}</label>
                <input value={registerForm.rackCode1} onChange={(e) => setRegisterForm({ ...registerForm, rackCode1: e.target.value })} placeholder="ex) AA, AB, AC, etc." className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.rackCode2")}</label>
                <input value={registerForm.rackCode2} onChange={(e) => setRegisterForm({ ...registerForm, rackCode2: e.target.value })} placeholder="ex) A, B, C, 1, 2, 3 etc." className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.startNumber")}</label>
                <input type="number" min={1} value={registerForm.startNumber} onChange={(e) => setRegisterForm({ ...registerForm, startNumber: e.target.value })} placeholder="Min: 1" className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.endNumber")}</label>
                <input type="number" min={1} value={registerForm.endNumber} onChange={(e) => setRegisterForm({ ...registerForm, endNumber: e.target.value })} placeholder="Max: 999" className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.size")}</label>
                <select value={registerForm.size} onChange={(e) => setRegisterForm({ ...registerForm, size: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
                  <option value="">{t("rack.management.select")}</option>
                  <option value="small">{t("rack.management.sizeSmall")}</option>
                  <option value="medium">{t("rack.management.sizeMedium")}</option>
                  <option value="large">{t("rack.management.sizeLarge")}</option>
                  <option value="lcl">{t("rack.management.sizeLCL")}</option>
                </select>
              </div>
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.useCategory")}</label>
                <select value={registerForm.useCategory} onChange={(e) => setRegisterForm({ ...registerForm, useCategory: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
                  <option value="">{t("rack.management.select")}</option>
                  <option value="use">{t("rack.management.use")}</option>
                  <option value="notUse">{t("rack.management.notUse")}</option>
                </select>
              </div>
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.combination")}</label>
                <div className="text-sm text-gray-500">ex) AA-1-001, etc.</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setRegisterModalVisible(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">{t("rack.management.close")}</button>
              <button onClick={handleRegisterSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">{t("rack.management.save")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailModalVisible && selectedRack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t("rack.management.detailsModal")}</h2>
              <button onClick={() => setDetailModalVisible(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="flex gap-6 mb-4 text-sm">
                <span><strong>{t("rack.management.rackCode")}:</strong> {selectedRack.rackCode}</span>
                <span><strong>{t("rack.management.totalRacks")}:</strong> {selectedRack.totalRacks}</span>
              </div>
              <div className="flex gap-6 mb-4 text-sm">
                <span><strong>{t("rack.management.availableRacks")}:</strong> {selectedRack.totalRacks - selectedRack.usedRacks}</span>
                <span><strong>{t("rack.management.usedRacks")}:</strong> {selectedRack.usedRacks}</span>
              </div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    {[0, 1, 2].map((col) => (
                      <React.Fragment key={col}>
                        <th className="px-3 py-2 border text-left">{t("rack.management.rackNumber")}</th>
                        <th className="px-3 py-2 border text-center">{t("rack.management.detail")}</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.ceil(rackDetails.length / 3) }).map((_, rowIdx) => (
                    <tr key={rowIdx}>
                      {[0, 1, 2].map((colIdx) => {
                        const detail = rackDetails[rowIdx * 3 + colIdx];
                        return detail ? (
                          <React.Fragment key={colIdx}>
                            <td className="px-3 py-2 border">{detail.rackNumber}</td>
                            <td className="px-3 py-2 border text-center">
                              <button className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded">{t("rack.management.reset")}</button>
                            </td>
                          </React.Fragment>
                        ) : (
                          <React.Fragment key={colIdx}>
                            <td className="px-3 py-2 border" />
                            <td className="px-3 py-2 border" />
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end p-4 border-t">
              <button onClick={() => setDetailModalVisible(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">{t("rack.management.close")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Rack Modal */}
      {addModalVisible && selectedRack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t("rack.management.addRackModal")}</h2>
              <button onClick={() => setAddModalVisible(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.rackCode")}</label>
                <input value={selectedRack.rackCode} disabled className="border rounded-md px-3 py-2 text-sm bg-gray-100" />
              </div>
              <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.totalRacks")}</label>
                <input value={selectedRack.totalRacks} disabled className="border rounded-md px-3 py-2 text-sm bg-gray-100" />
              </div>
              <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.startNumber")}</label>
                <input value="1" disabled className="border rounded-md px-3 py-2 text-sm bg-gray-100" />
              </div>
              <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.endNumber")}</label>
                <input value="999" disabled className="border rounded-md px-3 py-2 text-sm bg-gray-100" />
              </div>
              <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.addRackCount")}</label>
                <input type="number" min={1} value={addForm.addCount} onChange={(e) => setAddForm({ addCount: e.target.value })} placeholder={t("rack.management.enterAddCount")} className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.maxAddable")}</label>
                <div className="text-sm">0</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setAddModalVisible(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">{t("rack.management.close")}</button>
              <button onClick={handleAddSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">{t("rack.management.save")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalVisible && selectedRack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t("rack.management.correctionModal")}</h2>
              <button onClick={() => setEditModalVisible(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.rackCode")}</label>
                <input value={selectedRack.rackCode} disabled className="border rounded-md px-3 py-2 text-sm bg-gray-100" />
              </div>
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.size")}</label>
                <select value={editForm.size} onChange={(e) => setEditForm({ ...editForm, size: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
                  <option value="small">{t("rack.management.sizeSmall")}</option>
                  <option value="medium">{t("rack.management.sizeMedium")}</option>
                  <option value="large">{t("rack.management.sizeLarge")}</option>
                  <option value="lcl">{t("rack.management.sizeLCL")}</option>
                </select>
              </div>
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("rack.management.useCategory")}</label>
                <button
                  onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.isActive ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.isActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className="text-sm col-start-2">{editForm.isActive ? t("rack.management.use") : t("rack.management.notUse")}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setEditModalVisible(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">{t("rack.management.close")}</button>
              <button onClick={handleEditSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">{t("rack.management.save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RackManagement;
