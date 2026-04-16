import { useEffect, useState } from 'react';
import { Headset, PhoneCall, Mail, MessageCircleQuestion } from 'lucide-react';
import { getSupportFaqs } from '../services/api';

export default function CustomerServicePage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupportFaqs()
      .then(setFaqs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#f3f5f8', minHeight: '100vh', padding: '20px 16px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(125deg, #13233a 0%, #1f3f6a 58%, #325f96 100%)',
          color: 'white',
          borderRadius: 14,
          padding: '26px 24px',
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Headset size={24} />
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>Customer Service</h1>
          </div>
          <p style={{ margin: 0, color: '#d8e8ff', fontSize: 15 }}>
            Need help with orders, payments, returns, or Prime? We are here for you.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 18 }}>
          {[
            { icon: <PhoneCall size={18} color="#134a8a" />, title: 'Call Us', body: '+91 98765 43210 (9 AM - 9 PM)' },
            { icon: <Mail size={18} color="#134a8a" />, title: 'Email', body: 'support@amazon-clone.in' },
            { icon: <MessageCircleQuestion size={18} color="#134a8a" />, title: 'Live Chat', body: 'Available for signed-in users' },
          ].map((c) => (
            <div key={c.title} style={{ background: 'white', border: '1px solid #dce3eb', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {c.icon}
                <strong>{c.title}</strong>
              </div>
              <div style={{ fontSize: 13, color: '#344455' }}>{c.body}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #dce3eb', padding: 18 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 22 }}>Frequently Asked Questions</h2>
          {loading ? (
            <p style={{ margin: 0, color: '#556372' }}>Loading FAQs...</p>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {faqs.map((f) => (
                <details key={f.id} style={{ border: '1px solid #e3e8ee', borderRadius: 8, padding: '10px 12px', background: '#fcfdff' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#13233a' }}>{f.title}</summary>
                  <p style={{ margin: '8px 0 0', fontSize: 14, color: '#33414f', lineHeight: 1.5 }}>{f.body}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
