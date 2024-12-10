import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddRepairRequestPage.css';

function AddRepairRequestPage() {
  const [symptoms, setSymptoms] = useState('');
  const [depositDate] = useState(new Date().toISOString().split('T')[0]); // Date de dépôt par défaut
  const [returnDate, setReturnDate] = useState('');
  const [etat, setEtat] = useState('En cours'); // État par défaut
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [numTel, setNumTel] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [clientId, setClientId] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const deviceData = location.state || {};

  useEffect(() => {
    if (deviceData) {
      setNom(deviceData.nom || '');
      setAdresse(deviceData.adresse || '');
      setNumTel(deviceData.numTel || '');
      setBrand(deviceData.brand || '');
      setModel(deviceData.model || '');
      setSerialNumber(deviceData.serialNumber || '');
      setClientId(deviceData.clientId || null);
      setDeviceId(deviceData.deviceId || null);
    }
  }, [deviceData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des champs obligatoires
    if (!symptoms || !returnDate || !clientId || !deviceId) {
      setError('Veuillez remplir tous les champs obligatoires.');
      setSuccess('');
      return;
    }

    // Validation des dates
    if (new Date(returnDate) < new Date(depositDate)) {
      setError('La date prévue doit être postérieure ou égale à la date de dépôt.');
      setSuccess('');
      return;
    }

    const requestData = {
      dateDepotAppareil: depositDate,
      datePrevueRep: returnDate,
      symptomesPanne: symptoms,
      etat, // État sélectionné ou par défaut
      client: {
        id: clientId,
        nom,
        adresse,
        numTel,
      },
      appareil: {
        id: deviceId,
        marque: brand,
        modele: model,
        numSerie: serialNumber,
      },
    };

    try {
      const response = await axios.post('http://localhost:8090/api/demandes-reparation', requestData);

      if (response.status === 201) {
        setSuccess('Demande de réparation enregistrée avec succès.');
        setError('');
        navigate('/repair-sheet', { state: response.data });
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(`Erreur : ${err.response.data}`);
      } else {
        setError('Erreur lors de l’enregistrement de la demande. Vérifiez vos données.');
      }
      setSuccess('');
      console.error(err);
    }
  };

  return (
    <div className="repair-request-container">
      <h2>Ajouter une Demande de Réparation</h2>
      <form onSubmit={handleSubmit}>
        {/* Coordonnées du client */}
        <fieldset>
          <legend>Coordonnées du Client</legend>
          <label>Nom</label>
          <input type="text" value={nom} disabled />

          <label>Adresse</label>
          <textarea value={adresse} disabled></textarea>

          <label>Téléphone</label>
          <input type="tel" value={numTel} disabled />
        </fieldset>

        {/* Descriptif de l'appareil */}
        <fieldset>
          <legend>Descriptif de l'Appareil</legend>
          <label>Marque</label>
          <input type="text" value={brand} disabled />

          <label>Modèle</label>
          <input type="text" value={model} disabled />

          <label>Numéro de Série</label>
          <input type="text" value={serialNumber} disabled />
        </fieldset>

      

        {/* Symptômes de panne */}
        <fieldset>
          <legend>Symptômes de la Panne</legend>
          <label>Décrivez les symptômes *</label>
          <textarea
            placeholder="Décrivez les symptômes de la panne"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            required
          ></textarea>
        </fieldset>

        {/* Dates */}
        <fieldset>
          <legend>Dates</legend>
          <label>Date de Dépôt</label>
          <input type="date" value={depositDate} disabled />

          <label>Date prévue de remise *</label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
          />
        </fieldset>
          {/* État */}
          <fieldset>
          <legend>État de l'Appareil</legend>
          <label>État actuel *</label>
          <select value={etat} onChange={(e) => setEtat(e.target.value)} required>
            <option value="En cours">En cours</option>
            <option value="Réparé">Réparé</option>
            <option value="Non réparable">Non réparable</option>
          </select>
        </fieldset>

        {/* Messages d'erreur et de succès */}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {/* Bouton de soumission */}
        <button type="submit">Ajouter la Demande</button>
      </form>
    </div>
  );
}

export default AddRepairRequestPage;
