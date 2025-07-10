import { Builder, By } from "selenium-webdriver";
import { createJiraIssue } from "./jira.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testE2E() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    console.log("\n=== 🟡 DÉMARRAGE DU TEST E2E ===\n");

    console.log("🌐 Accès à l’application...");
    await driver.get("http://localhost:3000");
    await sleep(1000);

    // === 1. AJOUT UTILISATEUR ===
    console.log("\n--- ➕ AJOUT UTILISATEUR ---");

    const usernameInput = await driver.findElement(By.name("username"));
    const emailInput = await driver.findElement(By.name("email"));
    const addUserBtn = await driver.findElement(By.id("addUserBtn"));

    console.log("📥 Remplissage du formulaire...");
    await usernameInput.sendKeys("Alice");
    await sleep(500);
    await emailInput.sendKeys("alice@example.com");
    await sleep(500);

    console.log('🖱️ Clic sur le bouton "Ajouter"...');
    await addUserBtn.click();
    await sleep(1000);

    console.log('🔎 Recherche de "Alice"...');
    await driver.wait(async () => {
      const rows = await driver.findElements(By.css("#usersTable tbody tr"));
      return rows.length > 0;
    }, 5000);

    let aliceRow;
    const rowsAfterAdd = await driver.findElements(
      By.css("#usersTable tbody tr")
    );
    for (const row of rowsAfterAdd) {
      const text = await row.getText();
      if (text.includes("Alice") && text.includes("alice@example.com")) {
        aliceRow = row;
        break;
      }
    }

    if (!aliceRow) {
      console.error('❌ Échec : utilisateur "Alice" non trouvé.');
      throw new Error('Utilisateur "Alice" non trouvé après ajout');
    }

    console.log('✅ Utilisateur "Alice" ajouté avec succès.');

    // === 2. MODIFICATION UTILISATEUR ===
    console.log("\n--- ✏️ MODIFICATION UTILISATEUR ---");

    console.log('🔧 Clic sur le bouton "Éditer"...');
    const editButton = await aliceRow.findElement(
      By.xpath(".//button[contains(text(), 'Éditer')]")
    );
    await editButton.click();
    await sleep(500);

    console.log("💬 Remplissage du prompt (nouveau nom)...");
    const usernamePrompt = await driver.switchTo().alert();
    await usernamePrompt.sendKeys("Alice Modifiée");
    await usernamePrompt.accept();
    await sleep(500);

    console.log("💬 Remplissage du prompt (nouvel email)...");
    const emailPrompt = await driver.switchTo().alert();
    await emailPrompt.sendKeys("alice.mod@example.com");
    await emailPrompt.accept();
    await sleep(1000);

    console.log("🔎 Vérification de la modification...");
    const rowsAfterEdit = await driver.findElements(
      By.css("#usersTable tbody tr")
    );
    let foundModified = false;
    let modifiedRow;
    for (const row of rowsAfterEdit) {
      const text = await row.getText();
      if (
        text.includes("Alice Modifiée") &&
        text.includes("alice.mod@example.com")
      ) {
        foundModified = true;
        modifiedRow = row;
        break;
      }
    }

    if (!foundModified) {
      console.error("❌ Échec : modification non détectée.");
      throw new Error("Modification non reflétée dans le tableau");
    }

    console.log("✅ Utilisateur modifié avec succès.");

    // === Vérification du surlignage jaune ===
    console.log("💡 Vérification du surlignage jaune...");
    const classAttr = await modifiedRow.getAttribute("class");
    if (classAttr && classAttr.includes("highlight")) {
      console.log("✅ Ligne modifiée est surlignée en jaune.");
    } else {
      console.error("❌ Ligne modifiée NON surlignée.");
      throw new Error("Surlignage jaune manquant après modification");
    }

    // === 3. SUPPRESSION UTILISATEUR ===
    console.log("\n--- 🗑️ SUPPRESSION UTILISATEUR ---");

    console.log('🖱️ Clic sur "Supprimer"...');
    const deleteButton = await modifiedRow.findElement(
      By.xpath(".//button[contains(text(), 'Supprimer')]")
    );
    await deleteButton.click();
    await sleep(1000);

    console.log("🔎 Vérification de la suppression...");
    const rowsAfterDelete = await driver.findElements(
      By.css("#usersTable tbody tr")
    );
    let stillExists = false;
    for (const row of rowsAfterDelete) {
      const text = await row.getText();
      if (
        text.includes("Alice Modifiée") ||
        text.includes("alice.mod@example.com")
      ) {
        stillExists = true;
        break;
      }
    }

    if (stillExists) {
      console.error(
        "❌ Échec : utilisateur toujours présent après suppression."
      );
      throw new Error("Utilisateur non supprimé correctement");
    }

    console.log("✅ Utilisateur supprimé avec succès.");

    console.log("\n=== ✅ TEST E2E TERMINÉ AVEC SUCCÈS ===\n");
  } catch (err) {
    console.error("❌ Erreur durant le test E2E :", err.message);

    await createJiraIssue(
      "Erreur lors du test E2E",
      `Le test E2E a échoué avec l’erreur suivante :\n${err.stack}`
    );
  } finally {
    console.log("🧹 Fermeture du navigateur...");
    await sleep(1000);
    await driver.quit();
  }
}

testE2E();
