import React, { useState } from "react";
import "./RefractionForm.css";

export default function RefractionForm({ onSave, onClose, initialData }) {
  const [formData, setFormData] = useState(
    initialData || {
      right: {
        autorefraction: "",
        retinoscopy: "",
        sphere: "",
        cylinder: "",
        axis: "",
        nearRefraction: "",
        cycloplegicRefraction: "",
        finalRx: "",
      },
      left: {
        autorefraction: "",
        retinoscopy: "",
        sphere: "",
        cylinder: "",
        axis: "",
        nearRefraction: "",
        cycloplegicRefraction: "",
        finalRx: "",
      },
      duochrome: "",
      binocularBalance: "",
      nearAddition: "",
      cycloplegicAgent: "",
      cycloplegicTime: "",
      interpupillaryDistance: "",
      prescriptionType: "",
      remarks: "",
    }
  );

  const handleChange = (eye, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [eye]: { ...prev[eye], [field]: value },
    }));
  };

  const handleGeneralChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="refraction-modal-backdrop">
      <div className="refraction-modal">
        <h2>Refraction Test</h2>
        <form onSubmit={handleSubmit}>
          <div className="refraction-grid">
            <div>
              <h3>Right Eye (OD)</h3>
              {Object.keys(formData.right).map((key) => (
                <div className="input-group" key={`right-${key}`}>
                  <label>{key.replace(/([A-Z])/g, " $1")}</label>
                  <input
                    type="text"
                    value={formData.right[key]}
                    onChange={(e) =>
                      handleChange("right", key, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div>
              <h3>Left Eye (OS)</h3>
              {Object.keys(formData.left).map((key) => (
                <div className="input-group" key={`left-${key}`}>
                  <label>{key.replace(/([A-Z])/g, " $1")}</label>
                  <input
                    type="text"
                    value={formData.left[key]}
                    onChange={(e) => handleChange("left", key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="refraction-extra">
            <div className="input-group">
              <label>Duochrome Result</label>
              <div className="radio-group">
                {["Red clearer", "Green clearer", "Equal"].map((val) => (
                  <label key={val}>
                    <input
                      type="radio"
                      name="duochrome"
                      value={val}
                      checked={formData.duochrome === val}
                      onChange={(e) =>
                        handleGeneralChange("duochrome", e.target.value)
                      }
                    />
                    {val}
                  </label>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Binocular Balance</label>
              <select
                value={formData.binocularBalance}
                onChange={(e) =>
                  handleGeneralChange("binocularBalance", e.target.value)
                }
              >
                <option value="">Select</option>
                <option value="Balanced">Balanced</option>
                <option value="Not Balanced">Not Balanced</option>
              </select>
            </div>

            <div className="input-group">
              <label>Near Addition</label>
              <input
                type="text"
                value={formData.nearAddition}
                onChange={(e) =>
                  handleGeneralChange("nearAddition", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Cycloplegic Agent</label>
              <select
                value={formData.cycloplegicAgent}
                onChange={(e) =>
                  handleGeneralChange("cycloplegicAgent", e.target.value)
                }
              >
                <option value="">Select</option>
                <option value="Cyclopentolate">Cyclopentolate</option>
                <option value="Atropine">Atropine</option>
                <option value="Tropicamide">Tropicamide</option>
              </select>
            </div>

            <div className="input-group">
              <label>Cycloplegic Time</label>
              <input
                type="text"
                value={formData.cycloplegicTime}
                onChange={(e) =>
                  handleGeneralChange("cycloplegicTime", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Interpupillary Distance (mm)</label>
              <input
                type="number"
                value={formData.interpupillaryDistance}
                onChange={(e) =>
                  handleGeneralChange("interpupillaryDistance", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Prescription Type</label>
              <select
                value={formData.prescriptionType}
                onChange={(e) =>
                  handleGeneralChange("prescriptionType", e.target.value)
                }
              >
                <option value="">Select</option>
                <option value="Distance">Distance</option>
                <option value="Near">Near</option>
                <option value="Bifocal">Bifocal</option>
                <option value="Progressive">Progressive</option>
              </select>
            </div>

            <div className="input-group">
              <label>Remarks</label>
              <textarea
                rows={3}
                value={formData.remarks}
                onChange={(e) =>
                  handleGeneralChange("remarks", e.target.value)
                }
              ></textarea>
            </div>
          </div>

          <div className="modal-buttons">
            <button type="submit" className="save-btn">
              Save
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
