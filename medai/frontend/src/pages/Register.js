import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await register(form);

      if (result.success) {
        toast.success("Account created successfully 🎉");
        navigate("/login");
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Server error");
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: '#050816'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: 500,
          background: '#111827',
          padding: 35,
          borderRadius: 18,
          color: 'white',
          boxShadow: '0 0 30px rgba(37,99,235,0.25)'
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: 10 }}>
          Create Your Account
        </h1>

        <p style={{
          textAlign: 'center',
          color: '#9ca3af',
          marginBottom: 25
        }}>
          Start your AI-powered health journey
        </p>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>

          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={set('name')}
            className="input-field"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={set('email')}
            className="input-field"
          />

          <div style={{ position: 'relative' }}>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={set('password')}
              className="input-field"
              style={{ width: '100%' }}
            />

            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              style={{
                position: 'absolute',
                right: 12,
                top: 10,
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {showPwd ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: 18
        }}>
          Already have account? <Link to="/login">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;