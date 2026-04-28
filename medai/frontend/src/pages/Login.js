import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      return toast.error("Please fill all fields");
    }

    const result = await login(form.email, form.password);

    if (result.success) {
      toast.success("Welcome back! 👋");
      navigate("/dashboard");
    } else {
      toast.error(result.message || "Login failed");
    }
  };

  return (
    <div style={{
      minHeight:'100vh',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      padding:'24px'
    }}>
      <motion.div
        initial={{ opacity:0, y:30 }}
        animate={{ opacity:1, y:0 }}
        className="glass-card"
        style={{
          width:'100%',
          maxWidth:420,
          padding:'40px 36px'
        }}
      >
        <h2 style={{ textAlign:'center', marginBottom:'20px' }}>
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} style={{
          display:'flex',
          flexDirection:'column',
          gap:'16px'
        }}>
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={form.email}
            onChange={(e)=>
              setForm({...form, email:e.target.value})
            }
          />

          <div style={{ position:'relative' }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              className="input-field"
              value={form.password}
              onChange={(e)=>
                setForm({...form, password:e.target.value})
              }
            />

            <button
              type="button"
              onClick={()=>setShowPass(!showPass)}
              style={{
                position:'absolute',
                right:12,
                top:10,
                background:'none',
                border:'none',
                color:'white'
              }}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:18 }}>
          Don't have account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;