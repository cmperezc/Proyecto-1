import React, { useState, useRef } from 'react';
import './TextClassifier.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';

function TextClassifier() {
  const [inputText, setInputText] = useState('');
  const [classification, setClassification] = useState('');
  const [description, setDescription] = useState('');
  const [showResult, setShowResult] = useState(false);
  const fileInputRef = useRef(null);

  const handleTextToExcel = () => {
    // Convert the input text to an Excel file
    const excelFile = textToExcel(inputText);

    // Send the Excel file to the API
    sendToApi(excelFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Send the selected file to the API
      sendToApi(selectedFile);
    }
  };

  const sendToApi = async (file) => {
    try {
      const formdata = new FormData();
      formdata.append('file', file);

      const requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow',
      };

      const response = await fetch('http://localhost:8000/predict', requestOptions);

      if (response.ok) {
        const data = await response.json();
        handleResponse(data);
        
      } else {
        // Handle errors here
        console.error('Error:', response);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleResponse = async (data) => {
    if (data.error) {
      console.error('Error:', data.error);
    } else if (data.predictions && data.predictions.length > 1) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Predictions');
      
      worksheet.columns = [
        { header: 'Class', key: 'Class' },
      ];

      data.predictions.forEach((prediction) => {
        worksheet.addRow({ Class: prediction });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      saveAs(blob, 'predictions.xlsx');
    } else if (data.predictions && data.predictions.length === 1) {
      setClassification(data.category);

        const categoryMappings = {
          1: 'Clase 1',
          2: 'Clase 2',
          3: 'Clase 3',
          4: 'Clase 4',
          5: 'Clase 5',
        };

        setDescription(getCategoryInfo(categoryMappings[data.predictions[0]]));
        setShowResult(true);
    }
  };

  const textToExcel = (text) => {
    // Split the input text into an array of rows
    const rows = text.split('\n').map((row) => [row]);

    // Add the header row as the first element
    rows.unshift(['Review', 'Class']);

    // Create a new workbook and add the rows to a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Convert the workbook to an ArrayBuffer
    const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create a Blob from the ArrayBuffer
    const blob = new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Create a File from the Blob
    return new File([blob], 'text.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  };

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'Clase 1':
        return {
          title: 'Clase 1 - calificacion critica',
          description: 'se necesita accion urgente para mejorar con los clientes.',
          icon: 'https://static.vecteezy.com/system/resources/previews/007/225/334/non_2x/sad-face-emoji-isolated-on-white-background-vector.jpg', // Reemplaza con el nombre del archivo de icono
        };
        case 'Clase 2':
        return {
          title: 'Clase 2 - Calificacion mala',
          description: 'se quiere una acción para mejorar la calificación.',
          icon: 'https://th.bing.com/th/id/R.be9f1e62367f955cf9455dccc1b20494?rik=Ic%2bhV8Mp1LJQoA&riu=http%3a%2f%2frlv.zcache.es%2fcara_sonriente_triste_amarilla_etiqueta_redonda-r548f81d93e7f4585b35e2fdd541b9025_v9waf_8byvr_512.jpg&ehk=vQp1HYOg90iXUT2upxe5RRwWOdPOeoW7sqJTxCzUjPw%3d&risl=&pid=ImgRaw&r=0', // Reemplaza con el nombre del archivo de icono
        };
      case 'Clase 3':
        return {
          title: 'Clase 3 - calificacion aceptable',
          description: 'calificación aceptable, pero se debe mejorar.',
          icon: 'https://media.istockphoto.com/vectors/serious-emoji-emoticon-face-vector-id1258962037?k=20&m=1258962037&s=170667a&w=0&h=LqCyqHGcIQU6FGJj3zaUu98TTyFvZJ4dFuHO2pJ1KnE=', // Reemplaza con el nombre del archivo de icono
        };
      case 'Clase 4':
        return {
          title: 'Clase 4 - Buena calificacion',
          description: 'Una buena calificación no requiere acción inmediata.',
          icon: 'https://cdn.pixabay.com/photo/2016/09/01/08/24/smiley-1635449_1280.png', // Reemplaza con el nombre del archivo de icono
        };
      case 'Clase 5':
        return {
          title: 'Clase 5 - Muy Buena calificacion',
          description: 'excelente calificación debe seguir asi.',
          icon: 'https://th.bing.com/th/id/R.ed1d41932615fc06a93bd9c5a04e3c38?rik=EWV1ym8bzPY%2fjg&pid=ImgRaw&r=0', // Reemplaza con el nombre del archivo de icono
        };
      default:
        return {
          title: 'Categoría no encontrada',
          description: 'No se encontró información para esta categoría.',
          icon: 'https://www.iconpacks.net/icons/2/free-sad-face-icon-2691-thumb.png', // Reemplaza con el nombre del archivo de icono predeterminado
        };
    }
  };

  return (
    <div className="text-classifier">
      <h1 className="titulo">Clasificador de Textos turis Alpes</h1>
      <h2 className='subtitulo'>Grupo 1</h2>
      <div className="input-container">
        <div className="input-group">
          <textarea
            className="input"
            id="text-input"
            placeholder="Inserta tu texto aquí"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button className="button--submit" onClick={handleTextToExcel}>
            Clasificar
          </button>
          <input
            id="file-input"
            ref={fileInputRef}
            accept=".xlsx"
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input" className="button--submit2">
            Seleccionar Archivo
          </label>
        </div>
      </div>
      {showResult && (
        <div className="result">
          <h2 className="subtitulo">Resultado de la Clasificación:</h2>
          <div className="card mb-3">
            <div className="row">
              <div className="col-3">
                <img
                  src={description.icon}
                  className="card-img-bottom imgODS" // Agrega la clase imgODS
                  alt="Icono del ODS"
                />
              </div>
              <div className="col-9">
                <div className="card-body">
                  <h5 className="card-title">{description.title}</h5>
                  <p className="card-text">{description.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TextClassifier;