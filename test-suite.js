/**
 * Test Suite
 * Comprehensive tests for Person, TransformedPerson, DataModel, and FusekiConnector
 * 
 * @module test-suite
 * @version 1.0.0
 */

import { Person } from './person.js';
import { TransformedPerson } from './transformed-person.js';
import { DataModel } from './data-model.js';
import { FusekiConnector, createLocalConnector } from './fuseki-connector.js';
import {
  samplePersonData,
  sampleTransformedData,
  sampleTurtle,
  sampleJsonLd,
  invalidData,
  referenceDate,
  expectedAges,
  testConfig
} from './test-data.js';

/**
 * Simple test framework
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🧪 Starting Test Suite\n');
    console.log('='.repeat(60));

    for (const { name, fn } of this.tests) {
      try {
        await fn();
        this.results.passed++;
        console.log(`✅ ${name}`);
      } catch (error) {
        this.results.failed++;
        this.results.errors.push({ test: name, error: error.message });
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}`);
      }
    }

    console.log('='.repeat(60));
    console.log(`\n📊 Test Results:`);
    console.log(`   Passed: ${this.results.passed}`);
    console.log(`   Failed: ${this.results.failed}`);
    console.log(`   Total:  ${this.tests.length}`);
    
    if (this.results.failed > 0) {
      console.log(`\n❌ ${this.results.failed} test(s) failed`);
      return false;
    } else {
      console.log(`\n✅ All tests passed!`);
      return true;
    }
  }
}

/**
 * Assertion helpers
 */
const assert = {
  equals(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
    }
  },
  
  deepEquals(actual, expected, message = '') {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new Error(`${message}\n  Expected: ${expectedStr}\n  Actual: ${actualStr}`);
    }
  },
  
  true(value, message = '') {
    if (value !== true) {
      throw new Error(`${message}\n  Expected: true\n  Actual: ${value}`);
    }
  },
  
  false(value, message = '') {
    if (value !== false) {
      throw new Error(`${message}\n  Expected: false\n  Actual: ${value}`);
    }
  },
  
  throws(fn, message = '') {
    let threw = false;
    try {
      fn();
    } catch (error) {
      threw = true;
    }
    if (!threw) {
      throw new Error(`${message}\n  Expected function to throw an error`);
    }
  },
  
  async asyncThrows(fn, message = '') {
    let threw = false;
    try {
      await fn();
    } catch (error) {
      threw = true;
    }
    if (!threw) {
      throw new Error(`${message}\n  Expected async function to throw an error`);
    }
  },
  
  notNull(value, message = '') {
    if (value === null || value === undefined) {
      throw new Error(`${message}\n  Expected value to not be null/undefined`);
    }
  },
  
  isNull(value, message = '') {
    if (value !== null) {
      throw new Error(`${message}\n  Expected: null\n  Actual: ${value}`);
    }
  }
};

/**
 * Create test suite
 */
const runner = new TestRunner();

// ====================
// Person Class Tests
// ====================

runner.test('Person: Create with valid data', () => {
  const person = new Person(samplePersonData.janeDoe);
  assert.equals(person.firstName, 'Jane');
  assert.equals(person.lastName, 'Doe');
  assert.equals(person.birthDateISO, '2000-01-01');
});

runner.test('Person: Generate URI if not provided', () => {
  const person = new Person({
    firstName: 'Test',
    lastName: 'User',
    birthDate: '1990-01-01'
  });
  assert.equals(person.uri, 'http://example.com/ex#TestUser');
});

runner.test('Person: Get full name', () => {
  const person = new Person(samplePersonData.janeDoe);
  assert.equals(person.fullName, 'Jane Doe');
});

runner.test('Person: Calculate age correctly', () => {
  const person = new Person(samplePersonData.janeDoe);
  const age = person.getAge(referenceDate);
  assert.equals(age, expectedAges.janeDoe, 'Age calculation for Jane Doe');
});

runner.test('Person: Calculate age for all test persons', () => {
  Object.keys(samplePersonData).forEach(key => {
    const person = new Person(samplePersonData[key]);
    const age = person.getAge(referenceDate);
    assert.equals(age, expectedAges[key], `Age calculation for ${key}`);
  });
});

runner.test('Person: Throw error for missing firstName', () => {
  assert.throws(() => new Person(invalidData.missingFirstName));
});

runner.test('Person: Throw error for missing lastName', () => {
  assert.throws(() => new Person(invalidData.missingLastName));
});

runner.test('Person: Throw error for missing birthDate', () => {
  assert.throws(() => new Person(invalidData.missingBirthDate));
});

runner.test('Person: Throw error for future birthDate', () => {
  assert.throws(() => new Person(invalidData.futureBirthDate));
});

runner.test('Person: Throw error for empty firstName', () => {
  assert.throws(() => new Person(invalidData.emptyFirstName));
});

runner.test('Person: Set firstName', () => {
  const person = new Person(samplePersonData.janeDoe);
  person.firstName = 'Janet';
  assert.equals(person.firstName, 'Janet');
  assert.equals(person.fullName, 'Janet Doe');
});

runner.test('Person: Set lastName', () => {
  const person = new Person(samplePersonData.janeDoe);
  person.lastName = 'Smith';
  assert.equals(person.lastName, 'Smith');
  assert.equals(person.fullName, 'Jane Smith');
});

runner.test('Person: Validate returns valid for correct data', () => {
  const person = new Person(samplePersonData.janeDoe);
  const result = person.validate();
  assert.true(result.valid);
  assert.equals(result.errors.length, 0);
});

runner.test('Person: Export to Turtle', () => {
  const person = new Person(samplePersonData.janeDoe);
  const turtle = person.toTurtle(true);
  assert.true(turtle.includes('ex:JaneDoe a ex:Person'));
  assert.true(turtle.includes('ex:firstName "Jane"'));
});

runner.test('Person: Export to JSON', () => {
  const person = new Person(samplePersonData.janeDoe);
  const json = person.toJSON();
  assert.equals(json.firstName, 'Jane');
  assert.equals(json.lastName, 'Doe');
  assert.equals(json.fullName, 'Jane Doe');
});

runner.test('Person: Export to JSON-LD', () => {
  const person = new Person(samplePersonData.janeDoe);
  const jsonLd = person.toJsonLd();
  assert.equals(jsonLd['@type'], 'ex:Person');
  assert.equals(jsonLd.firstName, 'Jane');
});

runner.test('Person: Import from JSON', () => {
  const person = Person.fromJSON(samplePersonData.janeDoe);
  assert.equals(person.firstName, 'Jane');
  assert.equals(person.lastName, 'Doe');
});

runner.test('Person: Import from Turtle', () => {
  const person = Person.fromTurtle(sampleTurtle.person);
  assert.equals(person.firstName, 'Jane');
  assert.equals(person.lastName, 'Doe');
  assert.equals(person.birthDateISO, '2000-01-01');
});

runner.test('Person: Import from JSON-LD', () => {
  const person = Person.fromJsonLd(sampleJsonLd.person);
  assert.equals(person.firstName, 'Jane');
  assert.equals(person.lastName, 'Doe');
});

// ====================
// TransformedPerson Class Tests
// ====================

runner.test('TransformedPerson: Create with valid data', () => {
  const person = new TransformedPerson(sampleTransformedData.janeDoe);
  assert.equals(person.firstName, 'Jane');
  assert.equals(person.lastName, 'Doe');
  assert.equals(person.fullName, 'Jane Doe');
  assert.equals(person.age, 26);
});

runner.test('TransformedPerson: Generate URI if not provided', () => {
  const person = new TransformedPerson({
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User',
    age: 30
  });
  assert.equals(person.uri, 'http://example.com/ns/Person#TestUser');
});

runner.test('TransformedPerson: Throw error for mismatched fullName', () => {
  assert.throws(() => new TransformedPerson(invalidData.mismatchedFullName));
});

runner.test('TransformedPerson: Throw error for invalid age', () => {
  assert.throws(() => new TransformedPerson(invalidData.invalidAge));
});

runner.test('TransformedPerson: Throw error for age out of range', () => {
  assert.throws(() => new TransformedPerson(invalidData.ageOutOfRange));
});

runner.test('TransformedPerson: Set firstName updates fullName', () => {
  const person = new TransformedPerson(sampleTransformedData.janeDoe);
  person.firstName = 'Janet';
  assert.equals(person.firstName, 'Janet');
  assert.equals(person.fullName, 'Janet Doe');
});

runner.test('TransformedPerson: Set lastName updates fullName', () => {
  const person = new TransformedPerson(sampleTransformedData.janeDoe);
  person.lastName = 'Smith';
  assert.equals(person.lastName, 'Smith');
  assert.equals(person.fullName, 'Jane Smith');
});

runner.test('TransformedPerson: Validate returns valid for correct data', () => {
  const person = new TransformedPerson(sampleTransformedData.janeDoe);
  const result = person.validate();
  assert.true(result.valid);
  assert.equals(result.errors.length, 0);
});

runner.test('TransformedPerson: Transform from Person', () => {
  const person = new Person(samplePersonData.janeDoe);
  const transformed = TransformedPerson.fromPerson(person, referenceDate);
  assert.equals(transformed.firstName, 'Jane');
  assert.equals(transformed.lastName, 'Doe');
  assert.equals(transformed.fullName, 'Jane Doe');
  assert.equals(transformed.age, 26);
});

runner.test('TransformedPerson: Export to Turtle', () => {
  const person = new TransformedPerson(sampleTransformedData.janeDoe);
  const turtle = person.toTurtle(true);
  assert.true(turtle.includes('Person:JaneDoe a Class:Person'));
  assert.true(turtle.includes('Person:fullName "Jane Doe"'));
  assert.true(turtle.includes('Person:age 26'));
});

runner.test('TransformedPerson: Export to JSON', () => {
  const person = new TransformedPerson(sampleTransformedData.janeDoe);
  const json = person.toJSON();
  assert.equals(json.firstName, 'Jane');
  assert.equals(json.fullName, 'Jane Doe');
  assert.equals(json.age, 26);
});

runner.test('TransformedPerson: Import from JSON', () => {
  const person = TransformedPerson.fromJSON(sampleTransformedData.janeDoe);
  assert.equals(person.firstName, 'Jane');
  assert.equals(person.fullName, 'Jane Doe');
});

runner.test('TransformedPerson: Import from Turtle', () => {
  const person = TransformedPerson.fromTurtle(sampleTurtle.transformedPerson);
  assert.equals(person.firstName, 'Jane');
  assert.equals(person.fullName, 'Jane Doe');
  assert.equals(person.age, 26);
});

// ====================
// DataModel Class Tests
// ====================

runner.test('DataModel: Classes are pre-registered', () => {
  const classes = DataModel.getRegisteredClasses();
  assert.true(classes.includes('Person'));
  assert.true(classes.includes('TransformedPerson'));
});

runner.test('DataModel: Create Person instance', () => {
  DataModel.clearInstances('Person');
  const person = DataModel.create('Person', samplePersonData.janeDoe);
  assert.equals(person.firstName, 'Jane');
  
  const instances = DataModel.getInstances('Person');
  assert.equals(instances.length, 1);
});

runner.test('DataModel: Transform Person to TransformedPerson', () => {
  DataModel.clearAll();
  const person = DataModel.create('Person', samplePersonData.janeDoe);
  const transformed = DataModel.transform(person, 'TransformedPerson', { referenceDate });
  
  assert.equals(transformed.fullName, 'Jane Doe');
  assert.equals(transformed.age, 26);
});

runner.test('DataModel: Get instances', () => {
  DataModel.clearAll();
  DataModel.create('Person', samplePersonData.janeDoe);
  DataModel.create('Person', samplePersonData.johnSmith);
  
  const instances = DataModel.getInstances('Person');
  assert.equals(instances.length, 2);
});

runner.test('DataModel: Find instances', () => {
  DataModel.clearAll();
  DataModel.create('Person', samplePersonData.janeDoe);
  DataModel.create('Person', samplePersonData.johnSmith);
  
  const janes = DataModel.find('Person', p => p.firstName === 'Jane');
  assert.equals(janes.length, 1);
  assert.equals(janes[0].lastName, 'Doe');
});

runner.test('DataModel: Find one instance', () => {
  DataModel.clearAll();
  DataModel.create('Person', samplePersonData.janeDoe);
  
  const jane = DataModel.findOne('Person', p => p.firstName === 'Jane');
  assert.notNull(jane);
  assert.equals(jane.lastName, 'Doe');
});

runner.test('DataModel: Find by URI', () => {
  DataModel.clearAll();
  DataModel.create('Person', samplePersonData.janeDoe);
  
  const person = DataModel.findByUri('Person', samplePersonData.janeDoe.uri);
  assert.notNull(person);
  assert.equals(person.firstName, 'Jane');
});

runner.test('DataModel: Validate instance', () => {
  DataModel.clearAll();
  const person = DataModel.create('Person', samplePersonData.janeDoe);
  
  const result = DataModel.validateInstance('Person', person);
  assert.true(result.valid);
});

runner.test('DataModel: Export to JSON', () => {
  DataModel.clearAll();
  DataModel.create('Person', samplePersonData.janeDoe);
  DataModel.create('Person', samplePersonData.johnSmith);
  
  const json = DataModel.exportToJSON('Person');
  assert.equals(json.class, 'Person');
  assert.equals(json.instances.length, 2);
});

runner.test('DataModel: Export to Turtle', () => {
  DataModel.clearAll();
  DataModel.create('Person', samplePersonData.janeDoe);
  
  const turtle = DataModel.exportToTurtle('Person');
  assert.true(turtle.includes('ex:JaneDoe a ex:Person'));
});

runner.test('DataModel: Import from JSON', () => {
  DataModel.clearAll();
  const data = [samplePersonData.janeDoe, samplePersonData.johnSmith];
  
  const instances = DataModel.importFromJSON('Person', data);
  assert.equals(instances.length, 2);
  assert.equals(DataModel.getInstances('Person').length, 2);
});

runner.test('DataModel: Get statistics', () => {
  DataModel.clearAll();
  DataModel.create('Person', samplePersonData.janeDoe);
  DataModel.create('Person', samplePersonData.johnSmith);
  
  const stats = DataModel.getStatistics();
  assert.equals(stats.totalClasses, 2);
  assert.equals(stats.classes.Person.count, 2);
});

runner.test('DataModel: Clear instances', () => {
  DataModel.clearAll();
  DataModel.create('Person', samplePersonData.janeDoe);
  DataModel.clearInstances('Person');
  
  const instances = DataModel.getInstances('Person');
  assert.equals(instances.length, 0);
});

// ====================
// FusekiConnector Tests
// ====================

runner.test('FusekiConnector: Create instance', () => {
  const connector = new FusekiConnector({
    baseUrl: 'http://localhost:3030',
    dataset: 'test'
  });
  assert.equals(connector.queryEndpoint, 'http://localhost:3030/test/query');
  assert.equals(connector.updateEndpoint, 'http://localhost:3030/test/update');
});

runner.test('FusekiConnector: Create local connector', () => {
  const connector = createLocalConnector('test');
  assert.equals(connector.queryEndpoint, 'http://localhost:3030/test/query');
});

runner.test('FusekiConnector: Get GSP endpoint', () => {
  const connector = createLocalConnector('test');
  const endpoint = connector.getGspEndpoint('http://example.com/graph');
  assert.true(endpoint.includes('graph=http%3A%2F%2Fexample.com%2Fgraph'));
});

runner.test('FusekiConnector: Throw error for missing baseUrl', () => {
  assert.throws(() => new FusekiConnector({ dataset: 'test' }));
});

runner.test('FusekiConnector: Throw error for missing dataset', () => {
  assert.throws(() => new FusekiConnector({ baseUrl: 'http://localhost:3030' }));
});

// Note: The following tests require a running Fuseki server
// They are commented out but can be enabled for integration testing

/*
runner.test('FusekiConnector: Ping server', async () => {
  const connector = createLocalConnector('test');
  const isAlive = await connector.ping();
  assert.true(isAlive, 'Server should be accessible');
});

runner.test('FusekiConnector: Insert and retrieve', async () => {
  const connector = createLocalConnector('test');
  await connector.clear();
  
  const person = new Person(samplePersonData.janeDoe);
  await connector.save(person);
  
  const retrieved = await connector.getPerson(person.uri);
  assert.notNull(retrieved);
  assert.equals(retrieved.firstName, 'Jane');
});

runner.test('FusekiConnector: SPARQL query', async () => {
  const connector = createLocalConnector('test');
  const query = `SELECT * WHERE { ?s ?p ?o } LIMIT 10`;
  const results = await connector.query(query);
  assert.notNull(results);
});
*/

// ====================
// Integration Tests
// ====================

runner.test('Integration: Full transformation workflow', () => {
  DataModel.clearAll();
  
  // Create person
  const person = DataModel.create('Person', samplePersonData.janeDoe);
  assert.equals(person.firstName, 'Jane');
  
  // Transform
  const transformed = DataModel.transform(person, 'TransformedPerson', { referenceDate });
  assert.equals(transformed.fullName, 'Jane Doe');
  assert.equals(transformed.age, 26);
  
  // Validate
  const validation = DataModel.validateInstance('TransformedPerson', transformed);
  assert.true(validation.valid);
});

runner.test('Integration: Batch processing', () => {
  DataModel.clearAll();
  
  // Create multiple people
  Object.values(samplePersonData).forEach(data => {
    DataModel.create('Person', data);
  });
  
  // Transform all
  const people = DataModel.getInstances('Person');
  people.forEach(person => {
    DataModel.transform(person, 'TransformedPerson', { referenceDate });
  });
  
  // Check results
  const transformed = DataModel.getInstances('TransformedPerson');
  assert.equals(transformed.length, 5);
  
  // Validate all
  const validations = DataModel.validateAll('TransformedPerson');
  validations.forEach(({ validation }) => {
    assert.true(validation.valid);
  });
});

runner.test('Integration: Export and import workflow', () => {
  DataModel.clearAll();
  
  // Create and export
  DataModel.create('Person', samplePersonData.janeDoe);
  DataModel.create('Person', samplePersonData.johnSmith);
  const exported = DataModel.exportToJSON('Person');
  
  // Clear and import
  DataModel.clearInstances('Person');
  DataModel.importFromJSON('Person', exported.instances);
  
  // Verify
  const instances = DataModel.getInstances('Person');
  assert.equals(instances.length, 2);
});

/**
 * Run all tests
 */
export async function runTests() {
  return await runner.run();
}

/**
 * Run tests if this is the main module
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
