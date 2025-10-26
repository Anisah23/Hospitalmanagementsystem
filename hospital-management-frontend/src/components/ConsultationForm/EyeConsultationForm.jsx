import React, { useState } from "react";
import RefractionForm from "./RefractionForm/RefractionForm";
import "./EyeConsultationForm.css";

const EyeConsultationForm = ({ patientId, onSave, doctorAPI }) => {
  const [formData, setFormData] = useState({
    rightEye: {
      visualAcuity: "",
      cornea: "",
      lens: "",
      retina: "",
      intraocularPressure: "",
    },
    leftEye: {
      visualAcuity: "",
      cornea: "",
      lens: "",
      retina: "",
      intraocularPressure: "",
    },
    diagnosis: "",
    prescription: "",
    notes: "",
    amount: "",
    refraction: null,
  });

  const [showRefractionForm, setShowRefractionForm] = useState(false);

  const handleChange = (e, eye, field) => {
    setFormData((prev) => ({
      ...prev,
      [eye]: { ...prev[eye], [field]: e.target.value },
    }));
  };

  const handleRefractionSave = (data) => {
    setFormData((prev) => ({ ...prev, refraction: data }));
    setShowRefractionForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const consultationData = {
        patient_id: patientId,
        symptoms: `Right Eye: VA ${formData.rightEye.visualAcuity}, Cornea ${formData.rightEye.cornea}. Left Eye: VA ${formData.leftEye.visualAcuity}, Cornea ${formData.leftEye.cornea}`,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        notes: formData.notes,
        tests: JSON.stringify({
          rightEye: formData.rightEye,
          leftEye: formData.leftEye,
          refraction: formData.refraction,
        }),
        amount: formData.amount,
      };

      await doctorAPI.saveConsultation(consultationData);
      onSave && onSave();
    } catch (error) {
      console.error("❌ Failed to save consultation", error);
    }
  };

  return (
    <div className="consultation-form">
      <h3>👁 Eye Examination</h3>

      <form onSubmit={handleSubmit}>
        <div className="eye-sections">
          <div className="eye-section">
            <h4>Right Eye (OD)</h4>
            <input
              type="text"
              placeholder="Visual Acuity"
              value={formData.rightEye.visualAcuity}
              onChange={(e) => handleChange(e, "rightEye", "visualAcuity")}
            />
            <input
              type="text"
              placeholder="Cornea"
              value={formData.rightEye.cornea}
              onChange={(e) => handleChange(e, "rightEye", "cornea")}
            />
            <input
              type="text"
              placeholder="Lens"
              value={formData.rightEye.lens}
              onChange={(e) => handleChange(e, "rightEye", "lens")}
            />
            <input
              type="text"
              placeholder="Retina"
              value={formData.rightEye.retina}
              onChange={(e) => handleChange(e, "rightEye", "retina")}
            />
          </div>

          <div className="eye-section">
            <h4>Left Eye (OS)</h4>
            <input
              type="text"
              placeholder="Visual Acuity"
              value={formData.leftEye.visualAcuity}
              onChange={(e) => handleChange(e, "leftEye", "visualAcuity")}
            />
            <input
              type="text"
              placeholder="Cornea"
              value={formData.leftEye.cornea}
              onChange={(e) => handleChange(e, "leftEye", "cornea")}
            />
            <input
              type="text"
              placeholder="Lens"
              value={formData.leftEye.lens}
              onChange={(e) => handleChange(e, "leftEye", "lens")}
            />
            <input
              type="text"
              placeholder="Retina"
              value={formData.leftEye.retina}
              onChange={(e) => handleChange(e, "leftEye", "retina")}
            />
          </div>
        </div>

        <div className="refraction-section">
          <h4>Refraction Test</h4>
          <button
            type="button"
            className={`refraction-btn ${
              formData.refraction ? "completed" : ""
            }`}
            onClick={() => setShowRefractionForm(true)}
          >
            {formData.refraction ? "✅ Refraction Recorded" : "➕ Add Refraction"}
          </button>
        </div>

        <textarea
          placeholder="Diagnosis"
          value={formData.diagnosis}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          required
        />
        <textarea
          placeholder="Prescription"
          value={formData.prescription}
          onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
        />
        <textarea
          placeholder="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
        <input
          type="number"
          placeholder="Amount (KSH)"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />

        <button type="submit" className="save-btn">Save Consultation</button>
      </form>

      {showRefractionForm && (
        <RefractionForm
          onSave={handleRefractionSave}
          onCancel={() => setShowRefractionForm(false)}
        />
      )}
    </div>
  );
};

export default EyeConsultationForm;
