// import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { complaintAPI } from '../../services/complaintService';
// import { useAuthStore } from '../../store/authStore';
// import Modal from '../../components/common/Modal';
// import {
//   Plus,
//   ClipboardList,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   Bell,
//   CreditCard,
//   History,
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// const statusColors = {
//   open: 'bg-yellow-100 text-yellow-700',
//   assigned: 'bg-blue-100 text-blue-700',
//   in_progress: 'bg-purple-100 text-purple-700',
//   resolved: 'bg-green-100 text-green-700',
//   closed: 'bg-gray-100 text-gray-700',
// };

// export default function CustomerDashboard() {
//   const { user } = useAuthStore();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     category: 'general',
//     priority: 'medium',
//     building: '',
//   });

//   const { data, isLoading, refetch } = useQuery({
//     queryKey: ['customer-complaints'],
//     queryFn: () => complaintAPI.getComplaints({ page: 1, limit: 20 }).then((res) => res.data),
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await complaintAPI.createComplaint(formData);
//       toast.success('Complaint raised successfully!');
//       setIsModalOpen(false);
//       setFormData({ title: '', description: '', category: 'general', priority: 'medium', building: '' });
//       refetch();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to raise complaint');
//     }
//   };

//   const complaints = data?.data || [];
//   const openCount = complaints.filter(c => ['open', 'assigned', 'in_progress'].includes(c.status)).length;
//   const resolvedCount = complaints.filter(c => ['resolved', 'closed'].includes(c.status)).length;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200 px-4 py-4">
//         <div className="flex items-center justify-between max-w-4xl mx-auto">
//           <div>
//             <h1 className="text-xl font-bold text-gray-900">Customer Portal</h1>
//             <p className="text-sm text-gray-500">{user?.companyName || user?.name}</p>
//           </div>
//           <div className="flex items-center gap-3">
//             <button className="relative p-2 hover:bg-gray-100 rounded-lg">
//               <Bell className="w-5 h-5 text-gray-600" />
//             </button>
//             <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
//               {user?.name?.charAt(0)}
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="p-4 max-w-4xl mx-auto space-y-6">
//         {/* Quick Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="card p-4">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-50 rounded-lg">
//                 <ClipboardList className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-xl font-bold text-gray-900">{complaints.length}</p>
//                 <p className="text-xs text-gray-500">Total</p>
//               </div>
//             </div>
//           </div>
//           <div className="card p-4">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-yellow-50 rounded-lg">
//                 <Clock className="w-5 h-5 text-yellow-600" />
//               </div>
//               <div>
//                 <p className="text-xl font-bold text-gray-900">{openCount}</p>
//                 <p className="text-xs text-gray-500">Open</p>
//               </div>
//             </div>
//           </div>
//           <div className="card p-4">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-green-50 rounded-lg">
//                 <CheckCircle className="w-5 h-5 text-green-600" />
//               </div>
//               <div>
//                 <p className="text-xl font-bold text-gray-900">{resolvedCount}</p>
//                 <p className="text-xs text-gray-500">Resolved</p>
//               </div>
//             </div>
//           </div>
//           <div className="card p-4">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-purple-50 rounded-lg">
//                 <CreditCard className="w-5 h-5 text-purple-600" />
//               </div>
//               <div>
//                 <p className="text-xl font-bold text-gray-900">₹0</p>
//                 <p className="text-xs text-gray-500">Due</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex gap-4">
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
//           >
//             <Plus className="w-5 h-5" />
//             Raise Complaint
//           </button>
//           <button className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2">
//             <CreditCard className="w-5 h-5" />
//             Pay Bill
//           </button>
//         </div>

//         {/* Complaints List */}
//         <div className="card">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">My Complaints</h3>
//           <div className="space-y-3">
//             {complaints.map((complaint) => (
//               <div key={complaint._id} className="p-4 bg-gray-50 rounded-lg">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-sm font-medium text-primary-600">{complaint.ticketNumber}</span>
//                       <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[complaint.status]}`}>
//                         {complaint.status.replace('_', ' ')}
//                       </span>
//                       <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
//                         complaint.priority === 'critical' ? 'bg-red-100 text-red-700' :
//                         complaint.priority === 'high' ? 'bg-orange-100 text-orange-700' :
//                         complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
//                         'bg-green-100 text-green-700'
//                       }`}>
//                         {complaint.priority}
//                       </span>
//                     </div>
//                     <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
//                     <p className="text-xs text-gray-500 mt-1">{complaint.category} • {new Date(complaint.createdAt).toLocaleDateString()}</p>
//                   </div>
//                   {complaint.status === 'resolved' && !complaint.customerRating && (
//                     <button className="px-3 py-1.5 bg-primary-50 text-primary-600 text-sm rounded-lg hover:bg-primary-100">
//                       Rate
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//             {complaints.length === 0 && (
//               <div className="text-center py-8">
//                 <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                 <p className="text-gray-500">No complaints yet</p>
//                 <p className="text-sm text-gray-400">Raise your first complaint above</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* Raise Complaint Modal */}
//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raise New Complaint" size="md">
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
//             <input
//               type="text"
//               value={formData.title}
//               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//               className="input-field"
//               placeholder="Brief description of the issue"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               className="input-field"
//               rows={3}
//               placeholder="Detailed description..."
//               required
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//               <select
//                 value={formData.category}
//                 onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                 className="input-field"
//               >
//                 <option value="cleaning">Cleaning</option>
//                 <option value="security">Security</option>
//                 <option value="plumbing">Plumbing</option>
//                 <option value="electrical">Electrical</option>
//                 <option value="hvac">HVAC</option>
//                 <option value="general">General</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
//               <select
//                 value={formData.priority}
//                 onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
//                 className="input-field"
//               >
//                 <option value="low">Low</option>
//                 <option value="medium">Medium</option>
//                 <option value="high">High</option>
//                 <option value="critical">Critical</option>
//               </select>
//             </div>
//           </div>
//           <div className="flex justify-end gap-3 pt-4">
//             <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
//               Cancel
//             </button>
//             <button type="submit" className="btn-primary">
//               Submit Complaint
//             </button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// }


// import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { complaintAPI } from '../../services/complaintService';
// import { useAuthStore } from '../../store/authStore';
// import Modal from '../../components/common/Modal';
// import {
//   Plus,
//   ClipboardList,
//   Clock,
//   CheckCircle,
//   Bell,
//   CreditCard,
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// const statusColors = {
//   open: 'bg-yellow-100 text-yellow-700',
//   assigned: 'bg-blue-100 text-blue-700',
//   in_progress: 'bg-purple-100 text-purple-700',
//   resolved: 'bg-green-100 text-green-700',
//   closed: 'bg-gray-100 text-gray-700',
// };

// export default function CustomerDashboard() {
//   const { user } = useAuthStore();
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // ✅🔥 FIX: building = null instead of ""
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     category: 'general',
//     priority: 'medium',
//     building: null,
//   });

//   const { data, isLoading, refetch } = useQuery({
//     queryKey: ['customer-complaints'],
//     queryFn: () =>
//       complaintAPI
//         .getComplaints({ page: 1, limit: 20 })
//         .then((res) => res.data),
//   });

//   // ✅🔥 FIXED SUBMIT HANDLER
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       // ✅ CLEAN PAYLOAD (prevents ObjectId error)
//       const payload = {
//         ...formData,
//         building: formData.building || null,
//       };

//       await complaintAPI.createComplaint(payload);

//       toast.success('Complaint raised successfully!');
//       setIsModalOpen(false);

//       // ✅ RESET FORM SAFELY
//       setFormData({
//         title: '',
//         description: '',
//         category: 'general',
//         priority: 'medium',
//         building: null,
//       });

//       refetch();
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message || 'Failed to raise complaint'
//       );
//     }
//   };

//   const complaints = data?.data || [];

//   const openCount = complaints.filter((c) =>
//     ['open', 'assigned', 'in_progress'].includes(c.status)
//   ).length;

//   const resolvedCount = complaints.filter((c) =>
//     ['resolved', 'closed'].includes(c.status)
//   ).length;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200 px-4 py-4">
//         <div className="flex items-center justify-between max-w-4xl mx-auto">
//           <div>
//             <h1 className="text-xl font-bold text-gray-900">
//               Customer Portal
//             </h1>
//             <p className="text-sm text-gray-500">
//               {user?.companyName || user?.name}
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <button className="relative p-2 hover:bg-gray-100 rounded-lg">
//               <Bell className="w-5 h-5 text-gray-600" />
//             </button>
//             <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
//               {user?.name?.charAt(0)}
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="p-4 max-w-4xl mx-auto space-y-6">
//         {/* Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="card p-4">
//             <p className="text-xl font-bold">{complaints.length}</p>
//             <p className="text-xs text-gray-500">Total</p>
//           </div>
//           <div className="card p-4">
//             <p className="text-xl font-bold">{openCount}</p>
//             <p className="text-xs text-gray-500">Open</p>
//           </div>
//           <div className="card p-4">
//             <p className="text-xl font-bold">{resolvedCount}</p>
//             <p className="text-xs text-gray-500">Resolved</p>
//           </div>
//           <div className="card p-4">
//             <p className="text-xl font-bold">₹0</p>
//             <p className="text-xs text-gray-500">Due</p>
//           </div>
//         </div>

//         {/* Actions */}
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="btn-primary w-full py-3 flex items-center justify-center gap-2"
//         >
//           <Plus className="w-5 h-5" />
//           Raise Complaint
//         </button>

//         {/* Complaint List */}
//         <div className="card p-4">
//           <h3 className="font-semibold mb-4">My Complaints</h3>

//           {complaints.length === 0 ? (
//             <p className="text-gray-500 text-center">
//               No complaints yet
//             </p>
//           ) : (
//             complaints.map((c) => (
//               <div key={c._id} className="mb-3 p-3 bg-gray-50 rounded">
//                 <p className="font-medium">{c.title}</p>
//                 <p className="text-xs text-gray-500">
//                   {c.category} •{' '}
//                   {new Date(c.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//             ))
//           )}
//         </div>
//       </main>

//       {/* Modal */}
//       <Modal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         title="Raise Complaint"
//       >
//         <form onSubmit={handleSubmit} className="space-y-3">
//           <input
//             type="text"
//             placeholder="Title"
//             value={formData.title}
//             onChange={(e) =>
//               setFormData({ ...formData, title: e.target.value })
//             }
//             className="input-field"
//             required
//           />

//           <textarea
//             placeholder="Description"
//             value={formData.description}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 description: e.target.value,
//               })
//             }
//             className="input-field"
//             required
//           />

//           <select
//             value={formData.category}
//             onChange={(e) =>
//               setFormData({ ...formData, category: e.target.value })
//             }
//             className="input-field"
//           >
//             <option value="general">General</option>
//             <option value="cleaning">Cleaning</option>
//             <option value="electrical">Electrical</option>
//           </select>

//           <select
//             value={formData.priority}
//             onChange={(e) =>
//               setFormData({ ...formData, priority: e.target.value })
//             }
//             className="input-field"
//           >
//             <option value="low">Low</option>
//             <option value="medium">Medium</option>
//             <option value="high">High</option>
//           </select>

//           <div className="flex justify-end gap-2">
//             <button
//               type="button"
//               onClick={() => setIsModalOpen(false)}
//               className="btn-secondary"
//             >
//               Cancel
//             </button>
//             <button type="submit" className="btn-primary">
//               Submit
//             </button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { complaintAPI } from '../../services/complaintService';
import { buildingAPI } from '../../services/buildingService';
import { useAuthStore } from '../../store/authStore';
import Modal from '../../components/common/Modal';
import {
  Plus,
  Bell,
} from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  open: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
};

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ BUILDINGS STATE (NEW)
  const [buildings, setBuildings] = useState([]);

  // ✅ FORM DATA (FIXED - building must NOT be null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    building: '', // ✅ IMPORTANT FIX
  });

  // ================= FETCH COMPLAINTS =================
  const { data, refetch } = useQuery({
    queryKey: ['customer-complaints'],
    queryFn: () =>
      complaintAPI.getComplaints({ page: 1, limit: 20 }).then((res) => res.data),
  });

  // ================= FETCH BUILDINGS =================
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const res = await buildingAPI.getBuildings();
        setBuildings(res.data.data);
      } catch (err) {
        console.error('Building load failed:', err);
      }
    };

    loadBuildings();
  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        building: formData.building, // ✅ MUST be ObjectId string
      };

      await complaintAPI.createComplaint(payload);

      toast.success('Complaint raised successfully!');
      setIsModalOpen(false);

      // reset form
      setFormData({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium',
        building: '',
      });

      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to raise complaint');
    }
  };

  const complaints = data?.data || [];

  const openCount = complaints.filter((c) =>
    ['open', 'assigned', 'in_progress'].includes(c.status)
  ).length;

  const resolvedCount = complaints.filter((c) =>
    ['resolved', 'closed'].includes(c.status)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white border-b px-4 py-4">
        <div className="flex justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">Customer Portal</h1>
            <p className="text-sm text-gray-500">
              {user?.companyName || user?.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="p-4 max-w-4xl mx-auto space-y-6">

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xl font-bold">{complaints.length}</p>
            <p className="text-xs">Total</p>
          </div>
          <div className="card p-4">
            <p className="text-xl font-bold">{openCount}</p>
            <p className="text-xs">Open</p>
          </div>
          <div className="card p-4">
            <p className="text-xl font-bold">{resolvedCount}</p>
            <p className="text-xs">Resolved</p>
          </div>
          <div className="card p-4">
            <p className="text-xl font-bold">₹0</p>
            <p className="text-xs">Due</p>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary w-full py-3 flex justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Raise Complaint
        </button>

        {/* LIST */}
        <div className="card p-4">
          <h3 className="font-semibold mb-4">My Complaints</h3>

          {complaints.length === 0 ? (
            <p className="text-gray-500 text-center">No complaints yet</p>
          ) : (
            complaints.map((c) => (
              <div key={c._id} className="mb-3 p-3 bg-gray-50 rounded">
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-gray-500">
                  {c.category} • {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Raise Complaint"
      >
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* TITLE */}
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="input-field"
            required
          />

          {/* DESCRIPTION */}
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="input-field"
            required
          />

          {/* CATEGORY */}
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="input-field"
          >
            <option value="general">General</option>
            <option value="cleaning">Cleaning</option>
            <option value="electrical">Electrical</option>
          </select>

          {/* PRIORITY */}
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value })
            }
            className="input-field"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* ✅ BUILDING DROPDOWN (FIX) */}
          <select
            value={formData.building}
            onChange={(e) =>
              setFormData({ ...formData, building: e.target.value })
            }
            className="input-field"
            required
          >
            <option value="">Select Building</option>
            {buildings.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit
            </button>
          </div>

        </form>
      </Modal>
    </div>
  );
}