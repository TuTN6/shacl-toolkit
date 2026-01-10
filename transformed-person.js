/**
 * TransformedPerson Class - Target Model
 * Represents a transformed Person entity in the target RDF schema (Person:/Class: namespaces)
 * Corresponds to Class:Person in the SHACL schema
 * 
 * @class TransformedPerson
 * @version 1.0.0
 */

export class TransformedPerson {
  // Private fields
  #uri;
  #firstName;
  #lastName;
  #fullName;
  #age;

  /**
   * Creates a new TransformedPerson instance
   * 
   * @param {Object} config - Configuration object
   * @param {string} [config.uri] - URI for the person in Person: namespace
   * @param {string} config.firstName - First name
   * @param {string} config.lastName - Last name
   * @param {string} config.fullName - Full name
   * @param {number} config.age - Age in years
   * @throws {Error} If required fields are missing or invalid
   */
  constructor({ uri, firstName, lastName, fullName, age }) {
    // Validate required fields
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      throw new Error('firstName is required and must be a non-empty string');
    }
    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      throw new Error('lastName is required and must be a non-empty string');
    }
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      throw new Error('fullName is required and must be a non-empty string');
    }
    if (typeof age !== 'number' || age < 0 || age > 150) {
      throw new Error('age must be a number between 0 and 150');
    }

    // Set URI (generate if not provided)
    this.#uri = uri || this.#generateUri(firstName, lastName);

    // Set properties
    this.#firstName = firstName.trim();
    this.#lastName = lastName.trim();
    this.#fullName = fullName.trim();
    this.#age = age;

    // Validate fullName consistency
    if (this.#fullName !== `${this.#firstName} ${this.#lastName}`) {
      throw new Error(`fullName "${this.#fullName}" must match "firstName lastName" ("${this.#firstName} ${this.#lastName}")`);
    }
  }

  /**
   * Generates a URI for the transformed person based on their name
   * @private
   * @param {string} firstName - First name
   * @param {string} lastName - Last name
   * @returns {string} Generated URI in Person: namespace
   */
  #generateUri(firstName, lastName) {
    const localName = `${firstName}${lastName}`.replace(/\s+/g, '');
    return `http://example.com/ns/Person#${localName}`;
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
   * @returns {string} Local name
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
   * Gets the full name
   * @returns {string} Full name
   */
  get fullName() {
    return this.#fullName;
  }

  /**
   * Gets the age
   * @returns {number} Age in years
   */
  get age() {
    return this.#age;
  }

  // Setters

  /**
   * Sets the first name
   * Updates fullName automatically
   * @param {string} value - New first name
   * @throws {Error} If value is not a non-empty string
   */
  set firstName(value) {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('firstName must be a non-empty string');
    }
    this.#firstName = value.trim();
    this.#fullName = `${this.#firstName} ${this.#lastName}`;
  }

  /**
   * Sets the last name
   * Updates fullName automatically
   * @param {string} value - New last name
   * @throws {Error} If value is not a non-empty string
   */
  set lastName(value) {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('lastName must be a non-empty string');
    }
    this.#lastName = value.trim();
    this.#fullName = `${this.#firstName} ${this.#lastName}`;
  }

  /**
   * Sets the full name
   * Must match firstName + lastName pattern
   * @param {string} value - New full name
   * @throws {Error} If value doesn't match pattern or firstName/lastName
   */
  set fullName(value) {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('fullName must be a non-empty string');
    }
    
    const trimmed = value.trim();
    const expected = `${this.#firstName} ${this.#lastName}`;
    
    if (trimmed !== expected) {
      throw new Error(`fullName "${trimmed}" must match "firstName lastName" ("${expected}")`);
    }
    
    this.#fullName = trimmed;
  }

  /**
   * Sets the age
   * @param {number} value - New age
   * @throws {Error} If value is not between 0 and 150
   */
  set age(value) {
    if (typeof value !== 'number' || value < 0 || value > 150) {
      throw new Error('age must be a number between 0 and 150');
    }
    this.#age = value;
  }

  /**
   * Validates the transformed person data against SHACL constraints
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

    // Check fullName
    if (!this.#fullName || this.#fullName.length < 3) {
      errors.push('fullName is required and must be at least 3 characters');
    }

    // Check fullName pattern
    const namePattern = /^[A-Za-z]+ [A-Za-z]+$/;
    if (!namePattern.test(this.#fullName)) {
      errors.push('fullName must be in format "FirstName LastName"');
    }

    // Check fullName consistency
    if (this.#fullName !== `${this.#firstName} ${this.#lastName}`) {
      errors.push(`fullName "${this.#fullName}" must match "firstName lastName"`);
    }

    // Check age
    if (typeof this.#age !== 'number' || this.#age < 0 || this.#age > 150) {
      errors.push('age must be a number between 0 and 150');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Converts the transformed person to Turtle RDF format
   * @param {boolean} [includePrefix=true] - Include prefix declarations
   * @returns {string} Turtle RDF representation
   */
  toTurtle(includePrefix = true) {
    const prefix = includePrefix 
      ? `@prefix Person: <http://example.com/ns/Person#> .
@prefix Class: <http://example.com/ns/Class#> .
@prefix ex: <http://example.com/ex#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

`
      : '';

    return `${prefix}Person:${this.localName} a Class:Person ;
    ex:firstName "${this.#firstName}" ;
    ex:lastName "${this.#lastName}" ;
    Person:fullName "${this.#fullName}" ;
    Person:age ${this.#age} .`;
  }

  /**
   * Converts the transformed person to JSON-LD format
   * @returns {Object} JSON-LD representation
   */
  toJsonLd() {
    return {
      '@context': {
        Person: 'http://example.com/ns/Person#',
        Class: 'http://example.com/ns/Class#',
        ex: 'http://example.com/ex#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        firstName: 'ex:firstName',
        lastName: 'ex:lastName',
        fullName: 'Person:fullName',
        age: { '@id': 'Person:age', '@type': 'xsd:integer' }
      },
      '@id': this.#uri,
      '@type': 'Class:Person',
      firstName: this.#firstName,
      lastName: this.#lastName,
      fullName: this.#fullName,
      age: this.#age
    };
  }

  /**
   * Converts the transformed person to a plain JavaScript object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      uri: this.#uri,
      localName: this.localName,
      firstName: this.#firstName,
      lastName: this.#lastName,
      fullName: this.#fullName,
      age: this.#age
    };
  }

  /**
   * Creates a TransformedPerson instance from a Person instance
   * @param {Person} person - Source Person instance
   * @param {Date} [referenceDate=new Date()] - Reference date for age calculation
   * @returns {TransformedPerson} New TransformedPerson instance
   */
  static fromPerson(person, referenceDate = new Date()) {
    // Transform URI from ex: to Person: namespace
    const transformedUri = person.uri.replace(
      'http://example.com/ex#',
      'http://example.com/ns/Person#'
    );

    return new TransformedPerson({
      uri: transformedUri,
      firstName: person.firstName,
      lastName: person.lastName,
      fullName: person.fullName,
      age: person.getAge(referenceDate)
    });
  }

  /**
   * Creates a TransformedPerson instance from a plain JavaScript object
   * @param {Object} obj - Object with person properties
   * @returns {TransformedPerson} New TransformedPerson instance
   */
  static fromJSON(obj) {
    return new TransformedPerson({
      uri: obj.uri,
      firstName: obj.firstName,
      lastName: obj.lastName,
      fullName: obj.fullName,
      age: obj.age
    });
  }

  /**
   * Creates a TransformedPerson instance from Turtle RDF string
   * @param {string} turtle - Turtle RDF string
   * @returns {TransformedPerson} New TransformedPerson instance
   * @throws {Error} If parsing fails
   */
  static fromTurtle(turtle) {
    // Simple parser for the specific format
    const uriMatch = turtle.match(/Person:(\w+)\s+a\s+Class:Person/);
    const firstNameMatch = turtle.match(/ex:firstName\s+"([^"]+)"/);
    const lastNameMatch = turtle.match(/ex:lastName\s+"([^"]+)"/);
    const fullNameMatch = turtle.match(/Person:fullName\s+"([^"]+)"/);
    const ageMatch = turtle.match(/Person:age\s+(\d+)/);

    if (!uriMatch || !firstNameMatch || !lastNameMatch || !fullNameMatch || !ageMatch) {
      throw new Error('Invalid Turtle format');
    }

    return new TransformedPerson({
      uri: `http://example.com/ns/Person#${uriMatch[1]}`,
      firstName: firstNameMatch[1],
      lastName: lastNameMatch[1],
      fullName: fullNameMatch[1],
      age: parseInt(ageMatch[1], 10)
    });
  }

  /**
   * Creates a TransformedPerson instance from JSON-LD
   * @param {Object} jsonLd - JSON-LD object
   * @returns {TransformedPerson} New TransformedPerson instance
   */
  static fromJsonLd(jsonLd) {
    return new TransformedPerson({
      uri: jsonLd['@id'],
      firstName: jsonLd.firstName,
      lastName: jsonLd.lastName,
      fullName: jsonLd.fullName,
      age: jsonLd.age
    });
  }

  /**
   * String representation
   * @returns {string} String representation of the person
   */
  toString() {
    return `TransformedPerson { ${this.#fullName}, age ${this.#age} }`;
  }
}
