
class Lead {
  constructor(lead) {
    this.id = lead._id;
    this.email = lead.email;
    this.firstName = lead.firstName;
    this.lastName = lead.lastName;
    this.address = lead.address;
    this.entryDate = lead.entryDate;
    this.previous_values = {};
  }
}

module.exports = Lead;
