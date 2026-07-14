import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { sendMessageApi } from '../api/agentApi';
import { showNotification } from '../features/notification/notificationSlice';

const MAX_MESSAGE_LENGTH = 500;
const STORAGE_KEY = 'luxelodging_chat_interaction_id';

const greeting = () => ({
  role: 'assistant',
  text: "Hi! I'm your LuxeLodging concierge. Ask me to find a stay, check availability, or get a booking quote.",
  time: new Date(),
});

const BookingProposalCard = ({ proposal }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-2 bg-white border border-border rounded-lg overflow-hidden">
      <div className="p-3">
        <p className="font-mono text-xs text-muted uppercase tracking-wide">Quote</p>
        <p className="font-display text-base font-semibold text-ink">{proposal.propertyTitle}</p>
        <p className="text-xs text-muted font-sans">{proposal.city}</p>
      </div>
      <div className="relative">
        <div className="absolute -left-2 -top-2 w-4 h-4 bg-paper rounded-full"></div>
        <div className="absolute -right-2 -top-2 w-4 h-4 bg-paper rounded-full"></div>
        <div className="border-t-2 border-dashed border-border mx-2"></div>
      </div>
      <div className="p-3 font-mono text-xs text-ink space-y-1">
        <div className="flex justify-between">
          <span>
            {new Date(proposal.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            {' → '}
            {new Date(proposal.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
          <span>{proposal.nights} nights</span>
        </div>
        <div className="flex justify-between font-semibold text-sm pt-1">
          <span>Total</span>
          <span className="text-accent">₹{Number(proposal.totalPrice).toLocaleString('en-IN')}</span>
        </div>
      </div>
      <button
        onClick={() =>
          navigate(`/properties/${proposal.propertyId}/book`, {
            state: {
              checkIn: proposal.checkIn,
              checkOut: proposal.checkOut,
              numberOfGuests: proposal.numberOfGuests,
            },
          })
        }
        className="w-full py-2 bg-primary text-white text-sm font-sans hover:bg-primary-dark transition-colors"
      >
        Review & Book →
      </button>
    </div>
  );
};

const ChatWidget = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([greeting()]);
  const [interactionId, setInteractionId] = useState(() => sessionStorage.getItem(STORAGE_KEY) || null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (interactionId) {
      sessionStorage.setItem(STORAGE_KEY, interactionId);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [interactionId]);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      setMessages([greeting()]);
      setInteractionId(null);
      sessionStorage.removeItem(STORAGE_KEY);
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      dispatch(showNotification({
        message: `Message is too long — please keep it under ${MAX_MESSAGE_LENGTH} characters`,
        type: 'error',
      }));
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', text: trimmed, time: new Date() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendMessageApi(trimmed, interactionId);
      const { reply, interactionId: newId, bookingProposal } = res.data.data;
      setInteractionId(newId);
      setMessages((prev) => [...prev, { role: 'assistant', text: reply, bookingProposal, time: new Date() }]);
    } catch (err) {
      const msg = err.response?.data?.message || "Sorry, I'm having trouble right now — try again in a moment.";
      setMessages((prev) => [...prev, { role: 'assistant', text: msg, time: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-colors flex items-center justify-center z-40"
        aria-label="Open AI concierge"
      >
        {open ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-112 bg-white border border-border rounded-xl shadow-xl flex flex-col z-40 overflow-hidden">
          <div className="bg-primary text-white px-4 py-3">
            <p className="font-display text-base font-semibold">LuxeLodging Concierge</p>
            <p className="text-xs opacity-80 font-sans">Ask me to find or book a stay</p>
          </div>

          {!isAuthenticated ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm text-muted font-sans">Log in to chat with the concierge and get booking quotes.</p>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-md bg-primary text-white text-sm font-sans hover:bg-primary-dark transition-colors"
              >
                Log in
              </Link>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${m.role === 'user' ? '' : 'w-full'}`}>
                      <div
                        className={`px-3 py-2 rounded-lg text-sm font-sans ${
                          m.role === 'user'
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-paper text-ink rounded-bl-none border border-border'
                        }`}
                      >
                        {m.text}
                      </div>
                      <p className={`text-[10px] text-muted font-mono mt-0.5 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatTime(m.time)}
                      </p>
                      {m.bookingProposal && <BookingProposalCard proposal={m.bookingProposal} />}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-lg text-sm font-sans bg-paper border border-border text-muted">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSend} className="border-t border-border p-2 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={MAX_MESSAGE_LENGTH}
                  placeholder="Find a stay in Goa..."
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;