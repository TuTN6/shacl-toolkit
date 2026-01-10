/**
 * Person Class - Source Model
 * Represents a Person entity from the source RDF schema (ex: namespace)
 * Corresponds to ex:Person in the SHACL schema
 * 
 * @class Person
 * @version 1.0.0
 */

export class Person {
  // Private fields
  #uri;
  #firstName;
  #lastName;
  #birthDate;

  /**
   * Creates a new Person instance
   * 
   * @param {Object} config - Configuration object
   * @param {string} [config.uri] - URI for the person (auto-generated if not provided)
   * @param {string} config.firstName - First name
   * @param {string} config.lastName - Last name
   * @param {Date|string} config.birthDate - Birth date (Date object or ISO string)
   * @throws {Error} If required fields are missing or invalid
   */
  constructor({ uri, firstName, lastName, birthDate }) {
    // Validate required fields
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      throw new Error('firstName is required and must be a non-empty string');
    }
    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      throw new Error('lastName is required and must be a non-empty string');
    }
    if (!birthDate) {
      throw new Error('birthDate is required');
    }

    // Set URI (generate if not provided)
    this.#uri = uri || this.#generateUri(firstName, lastName);

    // Set properties
    this.#firstName = firstName.trim();
    this.#lastName = lastName.trim();
    
    // Convert birthDate to Date object if string
    if (typeof birthDate === 'string') {
      this.#birthDate = new Date(birthDate);
    } else if (birthDate instanceof Date) {
      this.#birthDate = birthDate;
    } else {
      throw new Error('birthDate must be a Date object or ISO string');
    }

    // Validate birthDate is in the past
    if (this.#birthDate > new Date()) {
      throw new Error('birthDate must be in the past');
    }
  }

  /**
   * Generates a URI for the person based on their name
   * @private
   * @param {string} firstName - First name
   * @param {string} lastName - Last name
   * @returns {string} Generated URI
   */
  #generateUri(firstName, lastName) {
    const localName = `${firstName}${lastName}`.replace(/\s+/g, '');
    return `http://example.com/ex#${localName}`;
  }

  // Getters
  
  /**
   * Gets the person's URI
   * @returns {string} Person URI
   */
  get uri() {
    return this.#uri;
  }

  /**
   * Gets the local name from the URI
   * @returns {string} Local name (e.g., "JaneDoe" from "http://example.com/ex#JaneDoe")
   */
  get localName() {
    return this.#uri.split('#')[1] || this.#uri.split('/').pop();
  }

  /**
   * Gets the first name
   * @returns {string} First name
   */
  get firstName() {
    return this.#firstName;
  }

  /**
   * Gets the last name
   * @returns {string} Last name
   */
  get lastName() {
    return this.#lastName;
  }

  /**
   * Gets the birth date
   * @returns {Date} Birth date
   */
  get birthDate() {
    return this.#birthDate;
  }

  /**
   * Gets the birth date as an ISO date string (YYYY-MM-DD)
   * @returns {string} Birth date in ISO format
   */
  get birthDateISO() {
    return this.#birthDate.toISOString().split('T')[0];
  }

  /**
   * Gets the full name (derived property)
   * @returns {string} Full name
   */
  get fullName() {
    return `${this.#firstName} ${this.#lastName}`;
  }

  /**
   * Calculates the person's age
   * @param {Date} [referenceDate=new Date()] - Reference date for age calculation
   * @returns {number} Age in years
   */
  getAge(referenceDate = new Date()) {
    const birthYear = this.#birthDate.getFullYear();
    const birthMonth = this.#birthDate.getMonth();
    const birthDay = this.#birthDate.getDate();

    const refYear = referenceDate.getFullYear();
    const refMonth = referenceDate.getMonth();
    const refDay = referenceDate.getDate();

    let age = refYear - birthYear;

    // Adjust if birthday hasn't occurred this year
    if (refMonth < birthMonth || (refMonth === birthMonth && refDay < birthDay)) {
      age--;
    }

    return age;
  }

  // Setters

  /**
   * Sets the first name
   * @param {string} value - New first name
   * @throws {Error} If value is not a non-empty string
   */
  set firstName(value) {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('firstName must be a non-empty string');
    }
    this.#firstName = value.trim();
  }

  /**
   * Sets the last name
   * @param {string} value - New last name
   * @throws {Error} If value is not a non-empty string
   */
  set lastName(value) {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('lastName must be a non-empty string');
    }
    this.#lastName = value.trim();
  }

  /**
   * Sets the birth date
   * @param {Date|string} value - New birth date
   * @throws {Error} If value is invalid or in the future
   */
  set birthDate(value) {
    let date;
    if (typeof value === 'string') {
      date = new Date(value);
    } else if (value instanceof Date) {
      date = value;
    } else {
      throw new Error('birthDate must be a Date object or ISO string');
    }

    if (date > new Date()) {
      throw new Error('birthDate must be in the past');
    }

    this.#birthDate = date;
  }

  /**
   * Validates the person data against SHACL constraints
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    // Check firstName
    if (!this.#firstName || this.#firstName.length === 0) {
      errors.push('firstName is required and must be non-empty');
    }

    // Check lastName
    if (!this.#lastName || this.#lastName.length === 0) {
      errors.push('lastName is required and must be non-empty');
    }

    // Check birthDate
    if (!this.#birthDate) {
      errors.push('birthDate is required');
    } else if (this.#birthDate > new Date()) {
      errors.push('birthDate must be in the past');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Converts the person to Turtle RDF format
   * @param {boolean} [includePrefix=true] - Include prefix declarations
   * @returns {string} Turtle RDF representation
   */
  toTurtle(includePrefix = true) {
    const prefix = includePrefix 
      ? `@prefix ex: <http://example.com/ex#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

`
      : '';

    return `${prefix}ex:${this.localName} a ex:Person ;
    ex:firstName "${this.#firstName}" ;
    ex:lastName "${this.#lastName}" ;
    ex:birthDate "${this.birthDateISO}"^^xsd:date .`;
  }

  /**
   * Converts the person to JSON-LD format
   * @returns {Object} JSON-LD representation
   */
  toJsonLd() {
    return {
      '@context': {
        ex: 'http://example.com/ex#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        firstName: 'ex:firstName',
        lastName: 'ex:lastName',
        birthDate: { '@id': 'ex:birthDate', '@type': 'xsd:date' }
      },
      '@id': this.#uri,
      '@type': 'ex:Person',
      firstName: this.#firstName,
      lastName: this.#lastName,
      birthDate: this.birthDateISO
    };
  }

  /**
   * Converts the person to a plain JavaScript object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      uri: this.#uri,
      localName: this.localName,
      firstName: this.#firstName,
      lastName: this.#lastName,
      birthDate: this.birthDateISO,
      fullName: this.fullName,
      age: this.getAge()
    };
  }

  /**
   * Creates a Person instance from a plain JavaScript object
   * @param {Object} obj - Object with person properties
   * @returns {Person} New Person instance
   */
  static fromJSON(obj) {
    return new Person({
      uri: obj.uri,
      firstName: obj.firstName,
      lastName: obj.lastName,
      birthDate: obj.birthDate
    });
  }

  /**
   * Creates a Person instance from Turtle RDF string
   * @param {string} turtle - Turtle RDF string
   * @returns {Person} New Person instance
   * @throws {Error} If parsing fails
   */
  static fromTurtle(turtle) {
    // Simple parser for the specific format
    const uriMatch = turtle.match(/ex:(\w+)\s+a\s+ex:Person/);
    const firstNameMatch = turtle.match(/ex:firstName\s+"([^"]+)"/);
    const lastNameMatch = turtle.match(/ex:lastName\s+"([^"]+)"/);
    const birthDateMatch = turtle.match(/ex:birthDate\s+"([^"]+)"\^\^xsd:date/);

    if (!uriMatch || !firstNameMatch || !lastNameMatch || !birthDateMatch) {
      throw new Error('Invalid Turtle format');
    }

    return new Person({
      uri: `http://example.com/ex#${uriMatch[1]}`,
      firstName: firstNameMatch[1],
      lastName: lastNameMatch[1],
      birthDate: birthDateMatch[1]
    });
  }

  /**
   * Creates a Person instance from JSON-LD
   * @param {Object} jsonLd - JSON-LD object
   * @returns {Person} New Person instance
   */
  static fromJsonLd(jsonLd) {
    return new Person({
      uri: jsonLd['@id'],
      firstName: jsonLd.firstName,
      lastName: jsonLd.lastName,
      birthDate: jsonLd.birthDate
    });
  }

  /**
   * String representation
   * @returns {string} String representation of the person
   */
  toString() {
    return `Person { ${this.fullName}, born ${this.birthDateISO}, age ${this.getAge()} }`;
  }
}
