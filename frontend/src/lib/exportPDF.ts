/**
 * Export PDF des candidatures IntoWork
 * Utilise jsPDF + autotable pour générer un rapport structuré
 */
import type { ApplicationWithScore } from '@/lib/api/ai-scoring';

// Mapping statut → libellé français
const STATUS_LABELS: Record<string, string> = {
  applied: 'Candidaté',
  pending: 'En attente',
  viewed: 'Vue',
  shortlisted: 'Présélectionné',
  interview: 'Entretien',
  accepted: 'Accepté',
  rejected: 'Refusé',
};

function scoreColor(score: number): [number, number, number] {
  if (score >= 80) return [34, 139, 34];   // vert
  if (score >= 60) return [59, 130, 246];  // bleu
  if (score >= 40) return [234, 179, 8];   // jaune
  return [239, 68, 68];                    // rouge
}

export async function exportCandidaturesPDF(
  applications: ApplicationWithScore[],
  jobId: number,
  jobTitle = 'Offre',
  companyName = 'IntoWork',
) {
  // Import dynamique pour éviter d'alourdir le bundle initial
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── En-tête ──────────────────────────────────────────────────────────────
  doc.setFillColor(107, 155, 95); // vert IntoWork
  doc.rect(0, 0, pageW, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('IntoWork — Rapport de candidatures', 12, 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Offre : ${jobTitle}  |  ${companyName}  |  Généré le ${now}`, 12, 17);

  // ── Métriques résumées ────────────────────────────────────────────────────
  const scored = applications.filter(a => a.ai_score != null);
  const avgScore = scored.length
    ? scored.reduce((s, a) => s + (a.ai_score ?? 0), 0) / scored.length
    : 0;
  const excellent = applications.filter(a => (a.ai_score ?? 0) >= 80).length;
  const interviews = applications.filter(a => a.status === 'interview' || a.status === 'accepted').length;

  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);

  const metrics = [
    { label: 'Total candidatures', value: String(applications.length) },
    { label: 'Analysées par IA', value: `${scored.length}` },
    { label: 'Score moyen', value: scored.length ? `${avgScore.toFixed(1)} / 100` : '—' },
    { label: 'Excellent (≥ 80)', value: String(excellent) },
    { label: 'En entretien / Acceptés', value: String(interviews) },
  ];

  const boxW = (pageW - 24) / metrics.length;
  metrics.forEach((m, i) => {
    const x = 12 + i * boxW;
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, 26, boxW - 3, 16, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(107, 155, 95);
    doc.text(m.value, x + (boxW - 3) / 2, 33, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(m.label, x + (boxW - 3) / 2, 39, { align: 'center' });
  });

  // ── Tableau principal ─────────────────────────────────────────────────────
  const rows = applications.map(a => {
    const score = a.ai_score != null ? a.ai_score.toFixed(1) : '—';
    const status = STATUS_LABELS[a.status] ?? a.status;
    const date = new Date(a.applied_at).toLocaleDateString('fr-FR');
    return [a.candidate_name, a.candidate_email, status, score, date];
  });

  autoTable(doc, {
    startY: 47,
    head: [['Candidat', 'Email', 'Statut', 'Score IA', 'Candidaté le']],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [107, 155, 95], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 252, 248] },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 65 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 35, halign: 'center' },
    },
    didParseCell(data) {
      if (data.column.index === 3 && data.section === 'body') {
        const val = parseFloat(String(data.cell.text[0]));
        if (!isNaN(val)) {
          const [r, g, b] = scoreColor(val);
          data.cell.styles.textColor = [r, g, b];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // ── Pied de page ─────────────────────────────────────────────────────────
  const pageCount = (doc.internal as unknown as { getNumberOfPages(): number }).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `IntoWork Search — Page ${i} / ${pageCount} — Confidentiel`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' },
    );
  }

  doc.save(`intowork-candidatures-offre-${jobId}-${Date.now()}.pdf`);
}
