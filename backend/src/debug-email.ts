/**
 * Script de debug pour tester la configuration email
 */

import * as dotenv from "dotenv";
import nodemailer from "nodemailer";

// Charger les variables d'environnement
dotenv.config();

async function debugEmailConfig() {
  console.log("=== DEBUG CONFIGURATION EMAIL ===");
  console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
  console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "***configuré***" : "NON CONFIGURÉ");
  
  console.log("\n=== TEST DE CONNEXION SMTP ===");
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: true,
    logger: true
  });

  try {
    console.log("Test de connexion SMTP...");
    await transporter.verify();
    console.log("✅ Connexion SMTP réussie !");
    
    console.log("\n=== TEST D'ENVOI D'EMAIL ===");
    const result = await transporter.sendMail({
      from: `"My Event Test" <${process.env.EMAIL_USER}>`,
      to: "print0cherif@gmail.com",
      subject: "Test de configuration - My Event",
      html: `
        <h2>Test de configuration email réussi !</h2>
        <p>Si vous recevez cet email, la configuration SMTP est fonctionnelle.</p>
        <p>Date: ${new Date().toLocaleString("fr-FR")}</p>
      `
    });
    
    console.log("✅ Email envoyé avec succès !");
    console.log("Message ID:", result.messageId);
    
  } catch (error) {
    console.error("❌ Erreur de connexion SMTP:", error);
  }
}

debugEmailConfig();
