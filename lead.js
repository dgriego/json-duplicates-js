class Lead {
  constructor(lead) {
    this.id = lead._id;
    this.email = lead.email;
    this.firstName = lead.firstName;
    this.lastName = lead.lastName;
    this.address = lead.address;
    this.entryDate = lead.entryDate;
    this.previousValues = {};
  }

  hasDuplicateEmail(lead) {
    return this.email === lead.email;
  }

  hasDuplicateId(lead) {
    return this.id === lead.id;
  }

  compareAndStoreChangesAgainst(lead) {
    const keys = Object.keys(lead).splice(0, 6);

    keys.forEach(key => {
      if (this[key] != lead[key]) {
        this.previousValues[key] = {
          from: lead[key],
          to: this[key]
        };
      }
    });
  }

  toObject() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      Address: this.address,
      entryDate: this.entryDate
    };
  }

  updatedLeadStr() {
    let updatedLeadStr = '\nLEAD:\n';
    updatedLeadStr += JSON.stringify(this.toObject(), null, ' ');

    return updatedLeadStr;
  }

  fieldChangesStr() {
    let fieldChangesStr = '\nFIELD CHANGES:\n';
    const keys = Object.keys(this.previousValues);

    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];

      if (!this.previousValues[key]) {
        continue;
      }

      const oldVal = this.previousValues[key].from;
      const newVal = this.previousValues[key].to;

      fieldChangesStr += `- ${key} field changed from "${oldVal}" to  "${newVal}".\n`;
    }

    return fieldChangesStr;
  }
}

module.exports = Lead;
