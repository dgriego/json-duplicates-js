const fs = require('fs');
const chalk = require('chalk');
const Lead = require('./lead.js');

class LeadCollection {
  constructor() {
    this.all = [];
    this.valid = [];
    this.duplicatesByIdCount = 0;
    this.duplicatesByEmailCount = 0;
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

  sortedByDateDesc() {
    return this.all.sort((leadA, leadB) => {
      const dateA = new Date(leadA.entryDate);
      const dateB = new Date(leadB.entryDate);
      return dateB - dateA;
    });
  }

  findValidLead(lead) {
    let match = null;

    this.valid.forEach((valid_lead, index) => {
      const id_match = (valid_lead.id === lead.id);
      const email_match = (valid_lead.email === lead.email);

      if (id_match || email_match) {
        match = valid_lead
      }
    });

    return match;
  }

  storeLeadIfValid(lead) {
    const existingLead = this.findValidLead(lead);
    const result = { success: true };

    if (existingLead) {
      result.success = false;
      result.existingLead = existingLead;
    } else {
      this.valid.push(lead);
    }

    return result;
  }

  updateDuplicateCounts(lead) {
    if (!lead.previousValues.id) {
      this.duplicatesByIdCount += 1;
    }

    if (!lead.previousValues.email) {
      this.duplicatesByEmailCount += 1;
    }
  }

  summary() {
    return {
      allCount: this.all.length,
      validCount: this.valid.length,
      duplicatesByEmailCount: this.duplicatesByEmailCount,
      duplicatesByIdCount: this.duplicatesByIdCount,
      removedCount: this.all.length - this.valid.length
    };
  }

  createValidLeadsFile(dir) {
    dir = dir || './';
    const date = new Date().toISOString();
    const fileName = `valid-leads-${date}.json`;
    const validLeads = this.valid.map(lead => lead.toObject());

    fs.writeFileSync(dir + fileName, JSON.stringify(validLeads, null, ' '));

    return fileName;
  }

  updateChangeLog(file) {
    file = file || 'change_log.txt';

    fs.appendFileSync(file, this.entryHeader());

    this.valid.forEach(lead => {
      if (Object.keys(lead.previousValues).length > 0) {
        fs.appendFileSync(file, '\n-- [LEAD UPDATED] --\n');

        if (!lead.previousValues.email) {
          fs.appendFileSync(file,
            `DUPLICATE EMAIL FOUND: ${lead.email}\n`
          )
        }

        if (!lead.previousValues.id) {
          fs.appendFileSync(file,
            `DUPLICATE ID FOUND: ${lead.id}\n`
          )
        }

        fs.appendFileSync(file, lead.updatedLeadStr());
        fs.appendFileSync(file, lead.fieldChangesStr());
      }
    });
  }

  outputChangeLogFileInfo() {
    console.log(
      chalk.blue.bold('See change log for more details:'),
      chalk.bold('change_log.txt')
    );
  }

  outputValidLeadsFilePath(fileName) {
    console.log(
      chalk.blue.bold('Valid leads file has been generated:'),
      chalk.bold(fileName)
    )
  }

  outputSummaryToCli() {
    console.log(this.summaryMsgArr(true).join(''))
  }

  summaryMsgArr(with_colors) {
    with_colors = with_colors || false;
    const summary = this.summary();
    const summaryHeader = '[SUMMARY]\n';
    const lineDashed = '-----------------------------------------------';

    return [
      '\n',
      with_colors ? chalk.bold.yellow(summaryHeader) : summaryHeader,
      with_colors ? chalk.bold.yellow(lineDashed) : lineDashed,
      '\n',
      `Total potential leads: ${this.summary().allCount}\n`,
      `Total valid leads: ${summary.validCount}\n`,
      `Duplicate leads by email: ${summary.duplicatesByEmailCount}\n`,
      `Duplicate leads by id: ${summary.duplicatesByIdCount}\n`,
      `Leads removed: ${summary.removedCount}\n`,
      with_colors ? chalk.bold.yellow(lineDashed) : lineDashed,
      '\n'
    ]
  }

  entryHeader() {
    const date = new Date().toISOString();
    let entryHeader =
`----------------------------------------------
[LOG_ENTRY: ${date}]
----------------------------------------------\n`;

    return entryHeader;
  }
}

module.exports = LeadCollection;
