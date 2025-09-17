// frontend/src/pages/admin/VerifyPage.jsx
import { useState, useEffect } from "react";
import DataTable from "../../components/table/DataTable";
import { Check, X, Eye } from "lucide-react";
import api from "../../services/api";

export default function VerifyPage() {
  const [pendingContributions, setPendingContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    const fetchPendingContributions = async () => {
      try {
        const response = await api.get("/contributions?status=pending");
        setPendingContributions(response.data);
      } catch (err) {
        setError("Failed to fetch pending contributions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingContributions();
  }, []);

  const handleVerify = async (id) => {
    try {
      await api.patch(`/contributions/${id}/verify`);
      // Update the local state to remove the verified item
      setPendingContributions((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError("Failed to verify contribution.");
      console.error(err);
    }
  };

  const handleBatchVerify = async () => {
    try {
      // Assuming a backend endpoint that accepts an array of IDs
      await api.post("/contributions/verify", { ids: selectedRows });
      // Update the local state to remove all verified items
      setPendingContributions((prev) =>
        prev.filter((item) => !selectedRows.includes(item.id))
      );
      setSelectedRows([]); // Clear selection after successful verification
    } catch (err) {
      setError("Failed to verify selected contributions.");
      console.error(err);
    }
  };

  const columns = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(pendingContributions.map((row) => row.id));
            } else {
              setSelectedRows([]);
            }
          }}
          checked={
            selectedRows.length === pendingContributions.length &&
            pendingContributions.length > 0
          }
        />
      ),
      render: (value, row) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.id)}
          onChange={() =>
            setSelectedRows((prev) =>
              prev.includes(row.id)
                ? prev.filter((id) => id !== row.id)
                : [...prev, row.id]
            )
          }
        />
      ),
    },
    { key: "member", header: "Member" },
    { key: "month", header: "Month" },
    { key: "amount", header: "Amount" },
    {
      key: "actions",
      header: "Actions",
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleVerify(row.id)}
            className="rounded-xl bg-emerald-600 p-2 text-white hover:bg-emerald-700"
            title="Verify"
          >
            <Check className="h-4 w-4" />
          </button>
          <a
            href={row.receiptUrl} // Use the actual URL from the API
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-sky-600 p-2 text-white hover:bg-sky-700"
            title="View Receipt"
          >
            <Eye className="h-4 w-4" />
          </a>
        </div>
      ),
    },
  ];

  if (loading) {
    return <p>Loading pending contributions...</p>;
  }

  if (error) {
    return <p className="text-rose-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Verify Contributions</h2>
        {selectedRows.length > 0 && (
          <button
            onClick={handleBatchVerify}
            className="rounded-xl bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
          >
            Verify selected ({selectedRows.length})
          </button>
        )}
      </div>
      <DataTable
        columns={columns}
        rows={pendingContributions}
        emptyLabel="No pending contributions"
      />
    </div>
  );
}