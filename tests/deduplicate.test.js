const fs = require('fs');
const LeadCollection = require('../leadCollection.js');
const Lead = require('../lead.js');

const deduplicateTestLeads = function() {
  const leadCollection = new LeadCollection();
  leadCollection.initializeLeadsAsLeadObjects(this.leadsFromFile);

  leadCollection.sortedByDateDesc().forEach(lead => {
    let result = leadCollection.storeLeadIfValid(lead);

    if (!result.success) {
      let validLead = result.existingLead;
      validLead.compareAndStoreChangesAgainst(lead);
      leadCollection.updateDuplicateCounts(validLead);
    }
  });

  return leadCollection;
}.bind(this);

beforeAll(() => {
  this.changeLogFixtureFile = 'tests/change_log_fixture.txt';
  this.changeLogFile = 'tests/change_log.txt';
  this.leads_file = 'tests/leads_fixture.json';
  this.leadsFromFile = LeadCollection.parseJsonFromLeadsFile(this.leads_file);
  this.leadA = new Lead(this.leadsFromFile[0]);
  this.leadB = new Lead(this.leadsFromFile[1]);
  this.leadC = new Lead(this.leadsFromFile[2]);
});

test('all leads array should be populated from file', () => {
  const leadCollection = new LeadCollection();
  leadCollection.initializeLeadsAsLeadObjects(this.leadsFromFile);

  expect(this.leadsFromFile.length).toBe(leadCollection.all.length);
});

test('all leads sorted by date', () => {
  const leadCollection = new LeadCollection();
  leadCollection.initializeLeadsAsLeadObjects(this.leadsFromFile);
  const allByDate = leadCollection.sortedByDateDesc();

  expect(allByDate[0].entryDate).toBe(this.leadA.entryDate);
  expect(allByDate[allByDate.length - 1].entryDate).toBe(
    this.leadB.entryDate
  );
});

test('find valid lead', () => {
  const leadCollection = new LeadCollection();
  leadCollection.valid.push(this.leadA);
  const validLead = leadCollection.findValidLead(this.leadA);

  expect(validLead).toEqual(this.leadA);
});

test('find valid lead is null', () => {
  const leadCollection = new LeadCollection();
  const validLead = leadCollection.findValidLead(this.leadA);

  expect(validLead).toBeNull();
});

test('store valid lead is successful', () => {
  const leadCollection = new LeadCollection();
  const result = leadCollection.storeLeadIfValid(this.leadA);

  expect(result.success).toBeTruthy();
  expect(leadCollection.valid.length).toEqual(1);
});

test('store valid lead fails', () => {
  const leadCollection = new LeadCollection();
  leadCollection.valid.push(this.leadA);
  const result = leadCollection.storeLeadIfValid(this.leadA);

  expect(result.success).toBeFalsy();
  expect(result.existingLead).toEqual(this.leadA);
});

test('has duplicate email is true', () => {
  const result = this.leadB.hasDuplicateEmail(this.leadC);

  expect(result).toBeTruthy();
});

test('has duplicate email is false', () => {
  const result = this.leadB.hasDuplicateEmail(this.leadA);

  expect(result).toBeFalsy();
});

test('has duplicate id is true', () => {
  const result = this.leadA.hasDuplicateId(this.leadB);

  expect(result).toBeTruthy();
});

test('has duplicate id is false', () => {
  const result = this.leadA.hasDuplicateId(this.leadC);

  expect(result).toBeFalsy();
});

test('changes stored from previous lead', () => {
  this.leadA.compareAndStoreChangesAgainst(this.leadB);

  expect(this.leadA.previousValues.id).toBeUndefined();
  expect(this.leadA.previousValues.email.from).toEqual(this.leadB.email);
});

test('duplicate counts increase', () => {
  const lead = new Lead(this.leadsFromFile[3]);
  const leadCollection = new LeadCollection();
  lead.compareAndStoreChangesAgainst(lead);
  leadCollection.updateDuplicateCounts(lead);

  expect(leadCollection.duplicatesByIdCount).toEqual(1);
  expect(leadCollection.duplicatesByEmailCount).toEqual(1);
});

test('summary is accurate', () => {
  const leadCollection = deduplicateTestLeads();

  const summary = leadCollection.summary();
  expect(summary.allCount).toEqual(6);
  expect(summary.validCount).toEqual(4);
  expect(summary.duplicatesByEmailCount).toEqual(2);
  expect(summary.duplicatesByIdCount).toEqual(1);
  expect(summary.removedCount).toEqual(2);
});

test('change log is accurate', () => {
  const leadCollection = deduplicateTestLeads();

  leadCollection.updateChangeLog(this.changeLogFile);

  const testChangeLog = fs.readFileSync(this.changeLogFile, 'utf-8');
  const indexOfUpdatedHeader = testChangeLog.indexOf('-- [LEAD UPDATED]');
  const changeLogStr = testChangeLog.slice(
    indexOfUpdatedHeader,
    testChangeLog.length - 1
  );

  const changeLogFixture = fs.readFileSync(
    this.changeLogFixtureFile,
    'utf-8'
  );

  expect(changeLogStr).toEqual(changeLogFixture);

  fs.writeFileSync(this.changeLogFile, '', 'utf-8');
});

test('change valid leads file is accurate', () => {
  const leadCollection = deduplicateTestLeads();

  leadCollection.createValidLeadsFile('./tests/');

  const leadsFixtureJson = fs.readFileSync(this.leads_file, 'utf-8');
  const generatedFile = fs
    .readdirSync('./tests')
    .filter(fn => fn.startsWith('valid-leads-'))[0];
  const generatedFileJson = fs.readFileSync(`./tests/${generatedFile}`, 'utf-8');

  expect(generatedFileJson).toEqual(generatedFileJson);
  fs.unlinkSync(`tests/${generatedFile}`);
});
