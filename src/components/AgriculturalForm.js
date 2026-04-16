import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AgriculturalForm.css';

/**
 * AgriculturalForm Component
 * Collects agricultural input data and farm information
 */
const AgriculturalForm = ({ onDataSubmitted }) => {
  const [formData, setFormData] = useState({
    batch_id: '',
    crop_type: 'vegetables',
    pesticide_used: '',
    pesticide_quantity: null,
    days_since_pesticide: 0,
    fertilizer_used: '',
    fertilizer_quantity: null,
    irrigation_source: 'groundwater',
    farm_location: '',
    days_since_harvest: 0,
    farm_area: null,
    temperature: 20,
    humidity: 50,
    rainfall: 0,
    soil_moisture: null,
    wind_speed: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [cropTypes, setCropTypes] = useState([]);
  const [irrigationSources, setIrrigationSources] = useState([]);
  const [expandedSection, setExpandedSection] = useState('basic');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  /**
   * Fetch metadata on mount
   */
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/metadata`);
        setCropTypes(response.data.crop_types);
        setIrrigationSources(response.data.irrigation_sources);
      } catch (err) {
        console.error('Error fetching metadata:', err);
        // Fallbacks
        setCropTypes(['grain', 'vegetables', 'fruits', 'legumes', 'herbs', 'spices', 'nuts', 'root_crops', 'leafy_greens', 'other']);
        setIrrigationSources(['river', 'groundwater', 'rain', 'pumped', 'well', 'canal']);
      }
    };

    fetchMetadata();
  }, [API_BASE_URL]);

  /**
   * Generate batch ID if not provided
   */
  useEffect(() => {
    if (!formData.batch_id) {
      const generatedId = `BATCH-${Date.now().toString(36).toUpperCase()}`;
      setFormData(prev => ({ ...prev, batch_id: generatedId }));
    }
  }, [formData.batch_id]);

  /**
   * Handle input change
   */
  const handleInputChange = (event) => {
    const { name, value, type } = event.target;
    let processedValue = value;

    if (type === 'number') {
      processedValue = value === '' ? null : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  /**
   * Regenerate batch ID
   */
  const regenerateBatchId = () => {
    const generatedId = `BATCH-${Date.now().toString(36).toUpperCase()}`;
    setFormData(prev => ({ ...prev, batch_id: generatedId }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate required fields
    if (!formData.crop_type || !formData.irrigation_source) {
      setError('Crop type and irrigation source are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/agricultural-input`,
        formData
      );

      const result = response.data;
      setSuccess(`Agricultural data recorded for batch: ${result.batch_id}`);
      
      if (onDataSubmitted) {
        onDataSubmitted(result);
      }

      // Clear form after success
      setTimeout(() => {
        setFormData({
          batch_id: `BATCH-${Date.now().toString(36).toUpperCase()}`,
          crop_type: 'vegetables',
          pesticide_used: '',
          pesticide_quantity: null,
          days_since_pesticide: 0,
          fertilizer_used: '',
          fertilizer_quantity: null,
          irrigation_source: 'groundwater',
          farm_location: '',
          days_since_harvest: 0,
          farm_area: null,
          temperature: 20,
          humidity: 50,
          rainfall: 0,
          soil_moisture: null,
          wind_speed: null,
        });
        setSuccess(null);
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit data';
      setError(errorMessage);
      console.error('Agricultural input error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render section header with toggle
   */
  const renderSectionHeader = (sectionId, title, icon) => (
    <div
      className="section-header"
      onClick={() => setExpandedSection(expandedSection === sectionId ? null : sectionId)}
      style={{ cursor: 'pointer' }}
    >
      <span className="section-icon">{icon}</span>
      <span className="section-title">{title}</span>
      <span className="toggle-arrow">
        {expandedSection === sectionId ? '▼' : '▶'}
      </span>
    </div>
  );

  return (
    <div className="agricultural-form-container">
      <div className="form-card">
        <h2>🌾 Agricultural Input Data</h2>
        <p className="form-subtitle">
          Provide agricultural and environmental information for comprehensive contamination risk assessment
        </p>

        <form onSubmit={handleSubmit} className="agricultural-form">
          {/* Batch ID Section */}
          <div className={`form-section ${expandedSection === 'batch' ? 'expanded' : ''}`}>
            {renderSectionHeader('batch', 'Batch Information', '📦')}
            {expandedSection === 'batch' && (
              <div className="section-content">
                <div className="form-group">
                  <label htmlFor="batch-id">Batch ID</label>
                  <div className="batch-id-group">
                    <input
                      id="batch-id"
                      type="text"
                      name="batch_id"
                      value={formData.batch_id}
                      onChange={handleInputChange}
                      className="form-input"
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={regenerateBatchId}
                      className="btn-secondary"
                    >
                      Generate New
                    </button>
                  </div>
                  <small>Unique identifier for tracking this batch through supply chain</small>
                </div>
              </div>
            )}
          </div>

          {/* Basic Crop Info */}
          <div className={`form-section ${expandedSection === 'basic' ? 'expanded' : ''}`}>
            {renderSectionHeader('basic', 'Crop Information', '🌱')}
            {expandedSection === 'basic' && (
              <div className="section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="crop-type">Crop Type *</label>
                    <select
                      id="crop-type"
                      name="crop_type"
                      value={formData.crop_type}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      {cropTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="farm-area">
                      Farm Area (hectares)
                      {formData.farm_area !== null && (
                        <span className="input-value">{formData.farm_area}</span>
                      )}
                    </label>
                    <input
                      id="farm-area"
                      type="number"
                      name="farm_area"
                      value={formData.farm_area || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 5.5"
                      className="form-input"
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="farm-location">Farm Location</label>
                    <input
                      id="farm-location"
                      type="text"
                      name="farm_location"
                      value={formData.farm_location}
                      onChange={handleInputChange}
                      placeholder="e.g., Valley Region, State"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="days-since-harvest">
                      Days Since Harvest *
                      <span className="input-value">{formData.days_since_harvest}</span>
                    </label>
                    <input
                      id="days-since-harvest"
                      type="range"
                      name="days_since_harvest"
                      min="0"
                      max="60"
                      step="1"
                      value={formData.days_since_harvest}
                      onChange={handleInputChange}
                      className="form-range"
                    />
                    <small>0 = just harvested, 60 = 2 months old</small>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pesticide & Fertilizer */}
          <div className={`form-section ${expandedSection === 'chemicals' ? 'expanded' : ''}`}>
            {renderSectionHeader('chemicals', 'Chemical Inputs', '⚗️')}
            {expandedSection === 'chemicals' && (
              <div className="section-content">
                <div className="subsection">
                  <h4 className="subsection-title">Pesticides</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="pesticide-used">Pesticide Name</label>
                      <input
                        id="pesticide-used"
                        type="text"
                        name="pesticide_used"
                        value={formData.pesticide_used}
                        onChange={handleInputChange}
                        placeholder="e.g., Glyphosate, Imidacloprid"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pesticide-qty">
                        Quantity (kg/ha)
                        {formData.pesticide_quantity !== null && (
                          <span className="input-value">{formData.pesticide_quantity}</span>
                        )}
                      </label>
                      <input
                        id="pesticide-qty"
                        type="number"
                        name="pesticide_quantity"
                        value={formData.pesticide_quantity || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., 2.5"
                        className="form-input"
                        step="0.1"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="days-pesticide">
                        Days Since Application
                        <span className="input-value">{formData.days_since_pesticide}</span>
                      </label>
                      <input
                        id="days-pesticide"
                        type="range"
                        name="days_since_pesticide"
                        min="0"
                        max="60"
                        step="1"
                        value={formData.days_since_pesticide}
                        onChange={handleInputChange}
                        className="form-range"
                      />
                      <small>0 = applied today, 28+ = pre-harvest interval met</small>
                    </div>
                  </div>
                </div>

                <div className="subsection">
                  <h4 className="subsection-title">Fertilizers</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fertilizer-used">Fertilizer Type</label>
                      <input
                        id="fertilizer-used"
                        type="text"
                        name="fertilizer_used"
                        value={formData.fertilizer_used}
                        onChange={handleInputChange}
                        placeholder="e.g., NPK 10-10-10, Compost"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="fertilizer-qty">
                        Quantity (kg/ha)
                        {formData.fertilizer_quantity !== null && (
                          <span className="input-value">{formData.fertilizer_quantity}</span>
                        )}
                      </label>
                      <input
                        id="fertilizer-qty"
                        type="number"
                        name="fertilizer_quantity"
                        value={formData.fertilizer_quantity || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., 100"
                        className="form-input"
                        step="0.1"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Water & Environment */}
          <div className={`form-section ${expandedSection === 'environment' ? 'expanded' : ''}`}>
            {renderSectionHeader('environment', 'Environmental Data', '🌤️')}
            {expandedSection === 'environment' && (
              <div className="section-content">
                <div className="subsection">
                  <h4 className="subsection-title">Water Source</h4>
                  <div className="form-group">
                    <label htmlFor="irrigation">Irrigation Source *</label>
                    <select
                      id="irrigation"
                      name="irrigation_source"
                      value={formData.irrigation_source}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      {irrigationSources.map((source) => (
                        <option key={source} value={source}>
                          {source.charAt(0).toUpperCase() + source.slice(1)}
                        </option>
                      ))}
                    </select>
                    <small>⚠️ River/canal water increases contamination risk</small>
                  </div>
                </div>

                <div className="subsection">
                  <h4 className="subsection-title">Weather Conditions</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="temperature">
                        Temperature (°C)
                        <span className="input-value">{formData.temperature}</span>
                      </label>
                      <input
                        id="temperature"
                        type="range"
                        name="temperature"
                        min="-20"
                        max="50"
                        step="0.5"
                        value={formData.temperature}
                        onChange={handleInputChange}
                        className="form-range"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="humidity">
                        Humidity (%)
                        <span className="input-value">{formData.humidity}</span>
                      </label>
                      <input
                        id="humidity"
                        type="range"
                        name="humidity"
                        min="0"
                        max="100"
                        step="1"
                        value={formData.humidity}
                        onChange={handleInputChange}
                        className="form-range"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="rainfall">
                        Recent Rainfall (mm)
                        {formData.rainfall !== null && (
                          <span className="input-value">{formData.rainfall}</span>
                        )}
                      </label>
                      <input
                        id="rainfall"
                        type="number"
                        name="rainfall"
                        value={formData.rainfall || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., 15"
                        className="form-input"
                        step="0.1"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="soil-moisture">
                        Soil Moisture (%)
                        {formData.soil_moisture !== null && (
                          <span className="input-value">{formData.soil_moisture}</span>
                        )}
                      </label>
                      <input
                        id="soil-moisture"
                        type="number"
                        name="soil_moisture"
                        value={formData.soil_moisture || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., 60"
                        className="form-input"
                        step="0.5"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="wind-speed">
                        Wind Speed (km/h)
                        {formData.wind_speed !== null && (
                          <span className="input-value">{formData.wind_speed}</span>
                        )}
                      </label>
                      <input
                        id="wind-speed"
                        type="number"
                        name="wind_speed"
                        value={formData.wind_speed || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., 15"
                        className="form-input"
                        step="0.1"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="alert alert-error">
              <span>❌ {error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>✓ {success}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? '⏳ Submitting...' : '✓ Record Agricultural Data'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgriculturalForm;
