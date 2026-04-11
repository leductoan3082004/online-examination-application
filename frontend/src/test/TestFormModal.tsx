// src/components/test/TestFormModal.tsx
import React, { useState, useEffect } from 'react';
import type { TestFormData, TestItem } from '../../types/test'; // Nhớ import hoặc định nghĩa tại đây

interface TestFormModalProps {
  isOpen: boolean;
  initialData: TestItem | null;
  onClose: () => void;
  onSave: (data: TestFormData) => void;
}

const TestFormModal: React.FC<TestFormModalProps> = ({ isOpen, initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState<TestFormData>({ title: '', description: '', passcode: '' });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        passcode: initialData.passcode
      });
    } else {
      setFormData({ title: '', description: '', passcode: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Ép kiểu Event chuẩn của React cho thẻ Input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Ép kiểu Event chuẩn cho Form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={{ marginTop: 0 }}>{initialData ? 'Sửa bài thi' : 'Tạo bài thi mới'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label>Tên bài thi:</label>
            <input required type="text" name="title" value={formData.title} onChange={handleChange} style={styles.input} />
          </div>
          
          <div style={styles.formGroup}>
            <label>Mô tả:</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} style={styles.input} />
          </div>
          
          <div style={styles.formGroup}>
            <label>Passcode (Mã vào thi):</label>
            <input required type="text" name="passcode" value={formData.passcode} onChange={handleChange} style={styles.input} />
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Hủy</button>
            <button type="submit" style={styles.saveBtn}>Lưu lại</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px' },
  formGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' },
  input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
  buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
  cancelBtn: { padding: '8px 16px', cursor: 'pointer', border: '1px solid #ccc', background: 'white', borderRadius: '4px' },
  saveBtn: { padding: '8px 16px', cursor: 'pointer', border: 'none', background: '#0275d8', color: 'white', borderRadius: '4px' }
};

export default TestFormModal;