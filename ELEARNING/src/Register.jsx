import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import "./AuthForm.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'etudiant',
    speciality: '',
    level: '',
  });

  const [levels, setLevels] = useState([]);
  const [specialities, setSpecialities] = useState([]);

  const token = localStorage.getItem("accessToken"); // ⬅️ Récupère le token

  /*useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/courses/levels/', {
      headers: {
        Authorization: `Bearer ${token}`, // ⬅️ Ajoute le token ici
      },
    })
      .then(res => {
        setLevels(res.data);
      })
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/courses/levels/')
      .then(res => setLevels(res.data))
      .catch(err => console.error('Erreur niveaux:', err));

    axios.get('http://127.0.0.1:8000/api/courses/specialities/',{
      headers: {
        Authorization: `Bearer ${token}`, // ⬅️ Ajoute le token ici
      },
    })
      .then(res => setSpecialities(res.data))
      .catch(err => console.error('Erreur spécialités:', err));
  }, []);*/

  
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/courses/levels/')
      .then(res => setLevels(res.data))
      .catch(err => console.error('Erreur niveaux:', err));
  
    axios.get('http://127.0.0.1:8000/api/courses/specialities/')
      .then(res => setSpecialities(res.data))
      .catch(err => console.error('Erreur spécialités:', err));
  }, []);
  



  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") {
      setFormData({ ...formData, role: value, level: '', speciality: '' });
    } else if (name === "speciality") {
      setFormData({ ...formData, speciality: value, level: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    const payload = {
      first_name: formData.prenom,
      last_name: formData.nom,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      user_type: formData.role === "etudiant" ? "student" : "professor",
      speciality: formData.role === "etudiant" ? formData.speciality : null,
      level: formData.role === "etudiant" ? formData.level : null,
    };

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/register/', payload);
      console.log('✅ Inscription réussie:', response.data);
      navigate(formData.role === 'etudiant' ? '/student' : '/login');
    } catch (error) {
      console.error("❌ Erreur d'inscription:", error.response?.data || error.message);
      alert("Erreur: " + JSON.stringify(error.response?.data));
    }
  };

  // ➡️ Gestion affichage niveau selon la spécialité
  const selectedSpeciality = specialities.find(s => String(s.id) === formData.speciality);
  const specialityName = selectedSpeciality?.name.toLowerCase() || '';

  const availableLevels = levels.filter(level => {
    if (specialityName.includes("tronc")) {
      return level.name.startsWith("L1");
    } else {
      return level.name.startsWith("L2");
    }
  });

  return (
    <motion.div
      className="auth-container"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="auth-left">
        <h1>Bienvenue !</h1>
        <p>Crée ton compte pour commencer</p>
        <button className="auth-button-outlined" onClick={() => navigate('/login')}>
          Se connecter
        </button>
      </div>

      <div className="auth-right">
        <h2>Inscription</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} required />
          <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
          <input type="text" name="username" placeholder="Nom d'utilisateur" value={formData.username} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Adresse email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirmer mot de passe" value={formData.confirmPassword} onChange={handleChange} required />

          {/* ➡️ Afficher spécialité puis niveau si étudiant */}
          {formData.role === "etudiant" && (
            <>
              <select name="speciality" value={formData.speciality} onChange={handleChange} required>
                <option value="">Choisir une spécialité</option>
                {specialities.map(spec => (
                  <option key={spec.id} value={spec.id}>{spec.name}</option>
                ))}
              </select>

              {/* ➡️ Afficher niveaux seulement si spécialité choisie */}
              {formData.speciality && (
                <select name="level" value={formData.level} onChange={handleChange} required>
                  <option value="">Choisir un niveau</option>
                  {availableLevels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              )}
            </>
          )}

          <div className="role-select">
            <label>
              <input type="radio" name="role" value="etudiant" checked={formData.role === 'etudiant'} onChange={handleChange} />
              Étudiant
            </label>
            <label>
              <input type="radio" name="role" value="professeur" checked={formData.role === 'professeur'} onChange={handleChange} />
              Professeur
            </label>
          </div>

          <button className="auth-button-filled" type="submit">S'inscrire</button>
        </form>
      </div>
    </motion.div>
  );
};

export default Register;
