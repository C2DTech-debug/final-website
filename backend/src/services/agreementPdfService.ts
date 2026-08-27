import PDFDocument from "pdfkit";
import { type Response } from "express";
import type { IAgreement } from "../models/Agreement";

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatCurrency(amount: number, currency = "INR"): string {
  const prefix = currency === "INR" ? "Rs. " : `${currency} `;
  return `${prefix}${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function generateAgreementPdf(agreement: IAgreement, res: Response): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 45,
        bufferPages: true,
        info: {
          Title: `Agreement ${agreement.agreementNumber} - C2D Tech`,
          Author: agreement.developer.companyName || "C2D Tech",
          Subject: agreement.agreementDetails.title || "Client Agreement",
        },
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="Agreement-${agreement.agreementNumber}-v${agreement.version}.pdf"`
      );

      doc.pipe(res);

      const PAGE_LEFT = 45;
      const PAGE_WIDTH = 505;
      const primaryColor = "#0f172a"; // Slate 900
      const accentColor = "#2563eb"; // Royal Blue 600
      const darkText = "#1e293b"; // Slate 800
      const mutedText = "#475569"; // Slate 600
      const subtleText = "#64748b"; // Slate 500
      const cardBg = "#f8fafc"; // Slate 50
      const borderColor = "#cbd5e1"; // Slate 300
      const dividerColor = "#e2e8f0"; // Slate 200

      // Helper for clean section headers
      const renderSectionHeader = (numberAndTitle: string) => {
        // Ensure space for header + at least 3 lines of text
        if (doc.y > 680) {
          doc.addPage();
        } else {
          doc.moveDown(0.6);
        }

        const startY = doc.y;
        doc.rect(PAGE_LEFT, startY, 4, 14).fill(accentColor);
        doc
          .font("Helvetica-Bold")
          .fontSize(10.5)
          .fillColor(primaryColor)
          .text(numberAndTitle, PAGE_LEFT + 10, startY + 1, { width: PAGE_WIDTH - 10 });

        doc.y = startY + 18;
        doc.moveTo(PAGE_LEFT, doc.y).lineTo(PAGE_LEFT + PAGE_WIDTH, doc.y).strokeColor(dividerColor).stroke();
        doc.moveDown(0.5);
      };

      // ---------- TOP HEADER BLOCK ----------
      const headerY = doc.y;
      const headerHeight = 66;
      doc.rect(PAGE_LEFT, headerY, PAGE_WIDTH, headerHeight).fill(cardBg);
      doc.rect(PAGE_LEFT, headerY, PAGE_WIDTH, headerHeight).strokeColor(borderColor).stroke();

      const leftColWidth = 320;
      const rightColWidth = 155;
      const rightColX = PAGE_LEFT + PAGE_WIDTH - rightColWidth - 12;

      // Left Header Branding
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor(accentColor)
        .text(agreement.developer.companyName || "C2D Tech (Concept to Deploy)", PAGE_LEFT + 12, headerY + 10, {
          width: leftColWidth,
        });

      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(mutedText)
        .text(
          `${agreement.developer.companyAddress || "Trichy, Tamil Nadu, India"}`,
          PAGE_LEFT + 12,
          headerY + 28,
          { width: leftColWidth, lineGap: 1 }
        )
        .text(
          `Phone: ${agreement.developer.phone} | Email: ${agreement.developer.email}`,
          PAGE_LEFT + 12,
          headerY + 40,
          { width: leftColWidth }
        )
        .text(
          `Website: ${agreement.developer.companyWebsite || "https://c2dtech.com"}`,
          PAGE_LEFT + 12,
          headerY + 52,
          { width: leftColWidth }
        );

      // Right Header Reference Details
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(primaryColor)
        .text(`REF: ${agreement.agreementNumber}`, rightColX, headerY + 10, {
          align: "right",
          width: rightColWidth,
        });

      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(mutedText)
        .text(
          `Version: ${agreement.version} | Status: ${agreement.status.toUpperCase()}`,
          rightColX,
          headerY + 26,
          { align: "right", width: rightColWidth }
        )
        .text(
          `Issued: ${agreement.agreementDetails.agreementDate || new Date().toLocaleDateString("en-IN")}`,
          rightColX,
          headerY + 40,
          { align: "right", width: rightColWidth }
        );

      doc.y = headerY + headerHeight + 12;

      // ---------- AGREEMENT TITLE ----------
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(primaryColor)
        .text(agreement.agreementDetails.title || "SERVICE AGREEMENT", PAGE_LEFT, doc.y, {
          align: "center",
          width: PAGE_WIDTH,
        });

      doc.moveDown(0.8);

      // ---------- PARTIES SUMMARY (2 COLUMNS) ----------
      const partiesY = doc.y;
      const colWidth = (PAGE_WIDTH - 15) / 2;

      // Service Provider Box
      doc.rect(PAGE_LEFT, partiesY, colWidth, 75).fill(cardBg).strokeColor(borderColor).stroke();
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(accentColor)
        .text("SERVICE PROVIDER (DEVELOPER)", PAGE_LEFT + 10, partiesY + 8)
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(primaryColor)
        .text(agreement.developer.name || "Aravindar C", PAGE_LEFT + 10, partiesY + 22)
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(mutedText)
        .text(`Company: ${agreement.developer.companyName || "C2D Tech"}`, PAGE_LEFT + 10, partiesY + 35)
        .text(`Email: ${agreement.developer.email}`, PAGE_LEFT + 10, partiesY + 47)
        .text(`Phone: ${agreement.developer.phone}`, PAGE_LEFT + 10, partiesY + 59);

      // Client Box
      const col2X = PAGE_LEFT + colWidth + 15;
      doc.rect(col2X, partiesY, colWidth, 75).fill(cardBg).strokeColor(borderColor).stroke();
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(accentColor)
        .text("CLIENT / CUSTOMER", col2X + 10, partiesY + 8)
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(primaryColor)
        .text(agreement.client.name, col2X + 10, partiesY + 22)
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(mutedText)
        .text(`Company: ${agreement.client.company || "Individual / Self"}`, col2X + 10, partiesY + 35)
        .text(`Email: ${agreement.client.email}`, col2X + 10, partiesY + 47)
        .text(`Phone: ${agreement.client.phone}`, col2X + 10, partiesY + 59);

      doc.y = partiesY + 85;

      // ---------- 1. PROJECT & FINANCIAL SUMMARY ----------
      renderSectionHeader("1. PROJECT & COMMERCIAL SUMMARY");

      const finY = doc.y;
      doc.rect(PAGE_LEFT, finY, PAGE_WIDTH, 52).fill(cardBg).strokeColor(borderColor).stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(subtleText)
        .text("Project Title:", PAGE_LEFT + 12, finY + 8)
        .text("Total Value:", PAGE_LEFT + 12, finY + 23)
        .text("Advance Payment:", PAGE_LEFT + 12, finY + 36)
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(primaryColor)
        .text(agreement.project.name, PAGE_LEFT + 95, finY + 8, { width: 395 })
        .text(formatCurrency(agreement.project.totalAmount, agreement.project.currency), PAGE_LEFT + 95, finY + 23)
        .text(
          `${agreement.project.advancePercentage}% (${formatCurrency(agreement.project.advanceAmount, agreement.project.currency)})`,
          PAGE_LEFT + 95,
          finY + 36
        )
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(subtleText)
        .text("Final Balance:", PAGE_LEFT + 280, finY + 36)
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(primaryColor)
        .text(
          `${agreement.project.finalPercentage}% (${formatCurrency(agreement.project.finalAmount, agreement.project.currency)})`,
          PAGE_LEFT + 360,
          finY + 36
        );

      doc.y = finY + 62;

      // ---------- 2. SCOPE OF WORK & DELIVERABLES ----------
      if (agreement.project.scope) {
        renderSectionHeader("2. SCOPE OF WORK & DELIVERABLES");
        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor(darkText)
          .text(agreement.project.scope, PAGE_LEFT, doc.y, {
            width: PAGE_WIDTH,
            align: "justify",
            lineGap: 3,
          });
      }

      // ---------- 3. AGREEMENT TERMS & SPECIFICATIONS ----------
      renderSectionHeader("3. AGREEMENT TERMS & SPECIFICATIONS");
      const cleanBody = stripHtml(agreement.agreementDetails.body);
      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(darkText)
        .text(cleanBody, PAGE_LEFT, doc.y, {
          width: PAGE_WIDTH,
          align: "justify",
          lineGap: 3,
        });

      // ---------- 4. GENERAL TERMS & CONDITIONS ----------
      if (agreement.agreementDetails.termsAndConditions) {
        renderSectionHeader("4. GENERAL TERMS & CONDITIONS");
        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor(darkText)
          .text(stripHtml(agreement.agreementDetails.termsAndConditions), PAGE_LEFT, doc.y, {
            width: PAGE_WIDTH,
            align: "justify",
            lineGap: 3,
          });
      }

      // ---------- 5. CANCELLATION & REFUND POLICY ----------
      if (agreement.agreementDetails.cancellationTerms) {
        renderSectionHeader("5. CANCELLATION & REFUND POLICY");
        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor(darkText)
          .text(stripHtml(agreement.agreementDetails.cancellationTerms), PAGE_LEFT, doc.y, {
            width: PAGE_WIDTH,
            align: "justify",
            lineGap: 3,
          });
      }

      // ---------- 6. SUPPORT & MAINTENANCE TERMS ----------
      if (agreement.agreementDetails.supportTerms) {
        renderSectionHeader("6. SUPPORT & MAINTENANCE TERMS");
        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor(darkText)
          .text(stripHtml(agreement.agreementDetails.supportTerms), PAGE_LEFT, doc.y, {
            width: PAGE_WIDTH,
            align: "justify",
            lineGap: 3,
          });
      }


      // ---------- EXECUTION & DIGITAL SIGNATURE RECORD BLOCK ----------
      const isSigned = agreement.status === "signed";
      const hasSigImg = Boolean(agreement.signing?.signatureImage);
      const blockHeight = isSigned ? (hasSigImg ? 135 : 115) : 75;

      if (doc.y + blockHeight > 730) {
        doc.addPage();
      } else {
        doc.moveDown(1);
      }

      const execY = doc.y;

      if (isSigned) {
        // Green signed badge box
        doc.rect(PAGE_LEFT, execY, PAGE_WIDTH, blockHeight).fill("#f0fdf4");
        doc.rect(PAGE_LEFT, execY, PAGE_WIDTH, blockHeight).strokeColor("#86efac").stroke();

        doc
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .fillColor("#15803d")
          .text("[VERIFIED] DOCUMENT DIGITALLY SIGNED & CRYPTOGRAPHICALLY AUTHENTICATED", PAGE_LEFT + 12, execY + 10);

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(mutedText)
          .text(`Signer Name: ${agreement.signing.signerName || agreement.client.name}`, PAGE_LEFT + 12, execY + 28)
          .text(`Signer Email: ${agreement.signing.signerEmail || agreement.client.email}`, PAGE_LEFT + 12, execY + 41)
          .text(`Signer Phone: ${agreement.signing.signerPhone || agreement.client.phone}`, PAGE_LEFT + 12, execY + 54)
          .text(
            `Execution Date: ${
              agreement.signing.signedAt
                ? new Date(agreement.signing.signedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST"
                : "—"
            }`,
            PAGE_LEFT + 12,
            execY + 67
          )
          .text(
            `Signature Algorithm: ${agreement.signing.signatureAlgorithm || "RSA-SHA256 / PKCS#7"}`,
            PAGE_LEFT + 12,
            execY + 80
          );

        if (hasSigImg && agreement.signing.signatureImage) {
          try {
            const rawB64 = agreement.signing.signatureImage.includes("base64,")
              ? agreement.signing.signatureImage.split("base64,")[1]
              : agreement.signing.signatureImage;
            const imgBuffer = Buffer.from(rawB64, "base64");
            doc.image(imgBuffer, PAGE_LEFT + 340, execY + 24, { fit: [145, 40] });
            doc
              .font("Helvetica")
              .fontSize(7)
              .fillColor(mutedText)
              .text("Digital Signature Representation", PAGE_LEFT + 340, execY + 68);
          } catch (e) {
            // fallback
          }
        }

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(mutedText)
          .text(`Signer IP: ${agreement.signing.signerIp || "—"}`, PAGE_LEFT + 220, execY + 28)
          .text(`Provider Ref: ${agreement.signing.providerReference || "—"}`, PAGE_LEFT + 220, execY + 41)
          .text(
            `SHA-256 Digest: ${
              agreement.signing.documentHash ? agreement.signing.documentHash.slice(0, 20) + "..." : "—"
            }`,
            PAGE_LEFT + 220,
            execY + 54
          );

        doc
          .font("Helvetica-Oblique")
          .fontSize(7)
          .fillColor("#166534")
          .text(
            "Cryptographic Notice: This document contains a cryptographically verifiable digital signature record and SHA-256 digest archive.",
            PAGE_LEFT + 12,
            execY + (hasSigImg ? 115 : 98),
            { width: PAGE_WIDTH - 24 }
          );
      } else {
        // Draft unexecuted box
        doc.rect(PAGE_LEFT, execY, PAGE_WIDTH, blockHeight).fill(cardBg);
        doc.rect(PAGE_LEFT, execY, PAGE_WIDTH, blockHeight).strokeColor(borderColor).stroke();

        doc
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .fillColor(primaryColor)
          .text("DOCUMENT STATUS: UNEXECUTED DRAFT (FOR CLIENT REVIEW)", PAGE_LEFT + 12, execY + 10);

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(mutedText)
          .text(
            "This document is an electronic draft issued for client review. Upon digital signature execution via configured DSC or CCA eSign gateway, an immutable cryptographically signed document and SHA-256 digest record will be generated.",
            PAGE_LEFT + 12,
            execY + 28,
            { width: PAGE_WIDTH - 24, lineGap: 2.5 }
          );
      }

      // ---------- PAGE NUMBERS & FOOTER ON ALL PAGES ----------
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor("#94a3b8")
          .text(
            `C2D Tech Agreement Ref: ${agreement.agreementNumber} (v${agreement.version}) | Page ${i + 1} of ${range.count}`,
            PAGE_LEFT,
            doc.page.height - 25,
            { align: "center", width: PAGE_WIDTH }
          );
      }

      doc.end();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
