// check_gemini_models.mjs
import dotenv from 'dotenv';
dotenv.config(); // Carga tu GEMINI_API_KEY

import { GoogleGenerativeAI } from '@google/generative-ai';

async function listGeminiModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    console.log('--- Modelos disponibles de Google Gemini para tu API Key ---');
    const { models } = await genAI.listModels();
    
    models.forEach(model => {
      console.log(`ID: ${model.name}`);
      console.log(`  Descripción: ${model.description || 'N/A'}`);
      console.log(`  Entrada de texto: ${model.inputTokenLimit}`);
      console.log(`  Salida de texto: ${model.outputTokenLimit}`);
      console.log(`  Tipos de generación soportados: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('----------------------------------------------------');
    });
  } catch (error) {
    console.error('❌ Error al listar modelos de Gemini:', error);
    console.error('Asegúrate de que tu GEMINI_API_KEY es correcta y tiene permisos.');
  }
}

listGeminiModels();