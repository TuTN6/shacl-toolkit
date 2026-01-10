/**
 * Test Data
 * Sample data for testing Person and TransformedPerson classes
 * 
 * @module test-data
 * @version 1.0.0
 */

/**
 * Sample person data in various formats
 */
export const samplePersonData = {
  janeDoe: {
    uri: 'http://example.com/ex#JaneDoe',
    firstName: 'Jane',
    lastName: 'Doe',
    birthDate: '2000-01-01'
  },
  
  johnSmith: {
    uri: 'http://example.com/ex#JohnSmith',
    firstName: 'John',
    lastName: 'Smith',
    birthDate: '1985-06-15'
  },
  
  aliceJohnson: {
    uri: 'http://example.com/ex#AliceJohnson',
    firstName: 'Alice',
    lastName: 'Johnson',
    birthDate: '1992-03-22'
  },
  
  bobWilliams: {
    uri: 'http://example.com/ex#BobWilliams',
    firstName: 'Bob',
    lastName: 'Williams',
    birthDate: '1978-11-30'
  },
  
  carolBrown: {
    uri: 'http://example.com/ex#CarolBrown',
    firstName: 'Carol',
    lastName: 'Brown',
    birthDate: '2005-07-04'
  }
};

/**
 * Sample transformed person data
 */
export const sampleTransformedData = {
  janeDoe: {
    uri: 'http://example.com/ns/Person#JaneDoe',
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'Jane Doe',
    age: 26
  },
  
  johnSmith: {
    uri: 'http://example.com/ns/Person#JohnSmith',
    firstName: 'John',
    lastName: 'Smith',
    fullName: 'John Smith',
    age: 40
  },
  
  aliceJohnson: {
    uri: 'http://example.com/ns/Person#AliceJohnson',
    firstName: 'Alice',
    lastName: 'Johnson',
    fullName: 'Alice Johnson',
    age: 33
  }
};

/**
 * Sample Turtle RDF data
 */
export const sampleTurtle = {
  person: `@prefix ex: <http://example.com/ex#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:JaneDoe a ex:Person ;
    ex:firstName "Jane" ;
    ex:lastName "Doe" ;
    ex:birthDate "2000-01-01"^^xsd:date .`,

  transformedPerson: `@prefix Person: <http://example.com/ns/Person#> .
@prefix Class: <http://example.com/ns/Class#> .
@prefix ex: <http://example.com/ex#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

Person:JaneDoe a Class:Person ;
    ex:firstName "Jane" ;
    ex:lastName "Doe" ;
    Person:fullName "Jane Doe" ;
    Person:age 26 .`,

  multiplePeople: `@prefix ex: <http://example.com/ex#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:JaneDoe a ex:Person ;
    ex:firstName "Jane" ;
    ex:lastName "Doe" ;
    ex:birthDate "2000-01-01"^^xsd:date .

ex:JohnSmith a ex:Person ;
    ex:firstName "John" ;
    ex:lastName "Smith" ;
    ex:birthDate "1985-06-15"^^xsd:date .`
};

/**
 * Sample JSON-LD data
 */
export const sampleJsonLd = {
  person: {
    '@context': {
      ex: 'http://example.com/ex#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      firstName: 'ex:firstName',
      lastName: 'ex:lastName',
      birthDate: { '@id': 'ex:birthDate', '@type': 'xsd:date' }
    },
    '@id': 'http://example.com/ex#JaneDoe',
    '@type': 'ex:Person',
    firstName: 'Jane',
    lastName: 'Doe',
    birthDate: '2000-01-01'
  },

  transformedPerson: {
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
    '@id': 'http://example.com/ns/Person#JaneDoe',
    '@type': 'Class:Person',
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'Jane Doe',
    age: 26
  }
};

/**
 * Invalid test data for error handling
 */
export const invalidData = {
  missingFirstName: {
    lastName: 'Doe',
    birthDate: '2000-01-01'
  },
  
  missingLastName: {
    firstName: 'Jane',
    birthDate: '2000-01-01'
  },
  
  missingBirthDate: {
    firstName: 'Jane',
    lastName: 'Doe'
  },
  
  futureBirthDate: {
    firstName: 'Jane',
    lastName: 'Doe',
    birthDate: '2030-01-01'
  },
  
  emptyFirstName: {
    firstName: '',
    lastName: 'Doe',
    birthDate: '2000-01-01'
  },
  
  invalidBirthDate: {
    firstName: 'Jane',
    lastName: 'Doe',
    birthDate: 'not-a-date'
  },
  
  invalidAge: {
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'Jane Doe',
    age: -5
  },
  
  ageOutOfRange: {
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'Jane Doe',
    age: 200
  },
  
  mismatchedFullName: {
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'John Smith',
    age: 26
  }
};

/**
 * SPARQL query examples
 */
export const sampleQueries = {
  selectAllPeople: `
    PREFIX ex: <http://example.com/ex#>
    SELECT ?person ?firstName ?lastName ?birthDate
    WHERE {
      ?person a ex:Person ;
              ex:firstName ?firstName ;
              ex:lastName ?lastName ;
              ex:birthDate ?birthDate .
    }
  `,
  
  selectAllTransformedPeople: `
    PREFIX Person: <http://example.com/ns/Person#>
    PREFIX Class: <http://example.com/ns/Class#>
    PREFIX ex: <http://example.com/ex#>
    SELECT ?person ?firstName ?lastName ?fullName ?age
    WHERE {
      ?person a Class:Person ;
              ex:firstName ?firstName ;
              ex:lastName ?lastName ;
              Person:fullName ?fullName ;
              Person:age ?age .
    }
  `,
  
  constructPerson: `
    PREFIX ex: <http://example.com/ex#>
    CONSTRUCT {
      ?person a ex:Person ;
              ex:firstName ?firstName ;
              ex:lastName ?lastName ;
              ex:birthDate ?birthDate .
    }
    WHERE {
      ?person a ex:Person ;
              ex:firstName ?firstName ;
              ex:lastName ?lastName ;
              ex:birthDate ?birthDate .
    }
  `,
  
  askPersonExists: `
    PREFIX ex: <http://example.com/ex#>
    ASK {
      ex:JaneDoe a ex:Person .
    }
  `,
  
  insertPerson: `
    PREFIX ex: <http://example.com/ex#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {
      ex:JaneDoe a ex:Person ;
                  ex:firstName "Jane" ;
                  ex:lastName "Doe" ;
                  ex:birthDate "2000-01-01"^^xsd:date .
    }
  `,
  
  deletePerson: `
    PREFIX ex: <http://example.com/ex#>
    DELETE WHERE {
      ex:JaneDoe ?p ?o .
    }
  `,
  
  updatePersonName: `
    PREFIX ex: <http://example.com/ex#>
    DELETE {
      ex:JaneDoe ex:firstName ?oldFirstName .
    }
    INSERT {
      ex:JaneDoe ex:firstName "Janet" .
    }
    WHERE {
      ex:JaneDoe ex:firstName ?oldFirstName .
    }
  `
};

/**
 * Reference date for age calculations in tests
 * Using 2026-01-10 to match the SHACL file
 */
export const referenceDate = new Date('2026-01-10');

/**
 * Expected age calculations for sample data
 */
export const expectedAges = {
  janeDoe: 26,      // Born 2000-01-01, calculated on 2026-01-10
  johnSmith: 40,    // Born 1985-06-15, calculated on 2026-01-10
  aliceJohnson: 33, // Born 1992-03-22, calculated on 2026-01-10
  bobWilliams: 47,  // Born 1978-11-30, calculated on 2026-01-10
  carolBrown: 20    // Born 2005-07-04, calculated on 2026-01-10
};

/**
 * Test configuration
 */
export const testConfig = {
  fuseki: {
    baseUrl: 'http://localhost:3030',
    dataset: 'test',
    testDataset: 'test-suite'
  },
  referenceDate: '2026-01-10',
  timeout: 5000
};
