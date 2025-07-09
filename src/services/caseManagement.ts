/**
 * Manages legal cases, including saving notes and documents.
 */
export class CaseManagement {
  private cases: Record<string, { notes: string[]; documents: File[] }> = {};

  /**
   * Adds a new case.
   * @param caseId - The unique ID of the case.
   */
  addCase(caseId: string): void {
    if (!this.cases[caseId]) {
      this.cases[caseId] = { notes: [], documents: [] };
    }
  }

  /**
   * Adds a note to a case.
   * @param caseId - The unique ID of the case.
   * @param note - The note to add.
   */
  addNote(caseId: string, note: string): void {
    this.cases[caseId]?.notes.push(note);
  }

  /**
   * Adds a document to a case.
   * @param caseId - The unique ID of the case.
   * @param document - The document to add.
   */
  addDocument(caseId: string, document: File): void {
    this.cases[caseId]?.documents.push(document);
  }

  /**
   * Retrieves case details.
   * @param caseId - The unique ID of the case.
   * @returns Case details.
   */
  getCase(caseId: string): { notes: string[]; documents: File[] } | undefined {
    return this.cases[caseId];
  }
}
