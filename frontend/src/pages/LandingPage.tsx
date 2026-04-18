import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import axios from 'axios';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const passcodeRef = useRef<HTMLInputElement>(null);

  // Form State
  const [passcode, setPasscode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Guard Behavior: Kiểm tra nếu là Teacher đã login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // Giả sử nhóm lưu role vào đây
    if (token && role === 'TEACHER') {
      navigate('/dashboard');
    }
    
    // Autofocus field Passcode khi load trang
    passcodeRef.current?.focus();
  }, [navigate]);

  // 2. Xử lý logic Submit
  const handleStartTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = studentName.trim();
    const trimmedPasscode = passcode.trim();

    if (!trimmedName || !trimmedPasscode) return;

    setIsLoading(true);
    try {
      // Gọi API theo đặc tả Notion
      const response = await axios.post('/api/student/access', {
        passcode: trimmedPasscode,
        name: trimmedName
      });

      // Giả sử API trả về { token: '...', testId: 123 }
      const { token, testId } = response.data;
      
      localStorage.setItem('student_token', token);
      navigate(`/test/${testId}`);
      
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 401) {
        setError("Invalid passcode. Check with your teacher.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Nút Start Test bị disabled nếu 1 trong 2 field trống (sau khi trim)
  const isButtonDisabled = !passcode.trim() || !studentName.trim() || isLoading;

  return (
    <div style={styles.container}>
      <PublicHeader />
      
      <main style={styles.hero}>
        <h1 style={styles.headline}>Enter your test passcode to begin</h1>
        <p style={styles.subline}>No account needed — just your name and the code from your teacher</p>

        <form onSubmit={handleStartTest} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              ref={passcodeRef}
              type="text"
              placeholder="Test Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              maxLength={20}
              autoComplete="off"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Your Full Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              maxLength={100}
              autoComplete="name"
              style={styles.input}
            />
          </div>

          {error && <div style={styles.errorMsg}>{error}</div>}

          <button 
            type="submit" 
            disabled={isButtonDisabled}
            style={{
              ...styles.submitBtn,
              backgroundColor: isButtonDisabled ? '#ccc' : '#007bff',
              cursor: isButtonDisabled ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Processing...' : 'Start Test'}
          </button>
        </form>
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9' },
  hero: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' },
  headline: { fontSize: '32px', marginBottom: '10px', color: '#1a1a1a', textAlign: 'center' },
  subline: { fontSize: '18px', color: '#666', marginBottom: '30px', textAlign: 'center' },
  form: { width: '100%', maxWidth: '400px', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  inputGroup: { marginBottom: '15px' },
  input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box' },
  errorMsg: { color: '#d93025', fontSize: '14px', marginBottom: '15px', textAlign: 'left' },
  submitBtn: { width: '100%', padding: '14px', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', transition: '0.3s' }
};

export default LandingPage;