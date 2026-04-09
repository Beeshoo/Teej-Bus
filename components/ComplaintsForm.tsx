
import React, { useState, useEffect } from 'react';
import { User, Complaint } from '../types';
import { BackendAPI } from '../services/api';

interface ComplaintsFormProps {
  user: User;
}

const ComplaintsForm: React.FC<ComplaintsFormProps> = ({ user }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await BackendAPI.getUserComplaints(user.id);
        setComplaints(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComplaints(false);
      }
    };
    fetchComplaints();
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    if (subject.length < 5) {
      alert('الموضوع قصير جداً، يرجى كتابة 5 أحرف على الأقل');
      return;
    }

    if (message.length < 10) {
      alert('تفاصيل الشكوى قصيرة جداً، يرجى كتابة 10 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      const result = await BackendAPI.submitComplaint({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        subject,
        message
      });
      if (result.success) {
        setSuccess(result.message);
        setSubject('');
        setMessage('');
        // Refresh complaints list
        const updated = await BackendAPI.getUserComplaints(user.id);
        setComplaints(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Form Section */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
          <div className="mb-8">
            <h2 className="text-4xl font-black text-blue-900 mb-2">نظام الشكاوي</h2>
            <p className="text-gray-500 text-base md:text-lg">نحن هنا للاستماع إليك. يرجى تزويدنا بالتفاصيل وسنقوم بالرد عليك في أقرب وقت.</p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-center space-y-4">
              <div className="text-4xl">✅</div>
              <p className="text-green-800 font-bold">{success}</p>
              <button 
                onClick={() => setSuccess(null)}
                className="text-green-600 text-sm font-bold underline"
              >
                إرسال شكوى أخرى
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-base md:text-lg font-bold text-gray-700 mr-2">موضوع الشكوى</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثلاً: تأخر الحافلة، مشكلة في الحجز..."
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition-all text-base md:text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-base md:text-lg font-bold text-gray-700 mr-2">تفاصيل الشكوى</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب هنا كل ما واجهته من صعوبات..."
                  rows={5}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition-all text-base md:text-lg resize-none"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-800 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال الشكوى'}
              </button>
            </form>
          )}
        </div>

        {/* History Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-blue-900 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="9"></circle></svg>
            شكاويك السابقة
          </h3>

          {loadingComplaints ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-blue-50 p-10 rounded-[2rem] text-center border border-blue-100">
              <p className="text-blue-900 text-lg md:text-xl font-bold opacity-50">لا يوجد شكاوي سابقة. نتمنى أن تكون خدماتنا دائماً عند حسن ظنك!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {complaints.map((c) => (
                <div key={c.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs md:text-sm px-3 py-1 rounded-full font-black ${
                      c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {c.status === 'pending' ? 'قيد المراجعة' : 
                       c.status === 'resolved' ? 'تم الحل' : 'تم التجاهل'}
                    </span>
                    <span className="text-xs md:text-sm text-gray-400">{new Date(c.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <h4 className="font-black text-blue-900 mb-2">{c.subject}</h4>
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed line-clamp-2">{c.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsForm;
