const fs = require('fs');
const Lead = require('./lead.js');

class LeadCollection {
  constructor() {
    this.all = [];
    this.valid = [];
    this.duplicates_by_id_count = 0;
    this.duplicates_by_email_count = 0;
  }

  static parseJsonFromLeadsFile(file) {
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data).leads;
  }

  initializeLeadsAsLeadObjects(leads) {
    leads.forEach(lead => {
      this.all.push(new Lead(lead));
    });
  }
}

module.exports = LeadCollection;
