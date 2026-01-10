/**
 * Main Entry Point
 * Demonstrates usage of the Person/TransformedPerson classes with DataModel and FusekiConnector
 * 
 * @module index
 * @version 1.0.0
 */

import { Person } from './person.js';
import { TransformedPerson } from './transformed-person.js';
import { DataModel } from './data-model.js';
import { FusekiConnector, createLocalConnector } from './fuseki-connector.js';

/**
 * Example 1: Basic Person Usage
 */
function example1_basicPerson() {
  console.log('\n📝 Example 1: Basic Person Usage');
  console.log('='.repeat(60));
  
  // Create a person
  const person = new Person({
    firstName: 'Jane',
    lastName: 'Doe',
    birthDate: '2000-01-01'
  });
  
  console.log('Created Person:', person.toString());
  console.log('Full Name:', person.fullName);
  console.log('Age:', person.getAge());
  console.log('URI:', person.uri);
  
  // Export to different formats
  console.log('\n--- Turtle RDF ---');
  console.log(person.toTurtle());
  
  console.log('\n--- JSON ---');
  console.log(JSON.stringify(person.toJSON(), null, 2));
}

/**
 * Example 2: Transformation
 */
function example2_transformation() {
  console.log('\n🔄 Example 2: Person Transformation');
  console.log('='.repeat(60));
  
  // Create source person
  const person = new Person({
    firstName: 'John',
    lastName: 'Smith',
    birthDate: '1985-06-15'
  });
  
  console.log('Source Person:', person.toString());
  
  // Transform to target format
  const referenceDate = new Date('2026-01-10');
  const transformed = TransformedPerson.fromPerson(person, referenceDate);
  
  console.log('Transformed Person:', transformed.toString());
  console.log('\n--- Transformed Turtle RDF ---');
  console.log(transformed.toTurtle());
}

/**
 * Example 3: DataModel Management
 */
function example3_dataModel() {
  console.log('\n🗄️  Example 3: DataModel Management');
  console.log('='.repeat(60));
  
  // Clear existing data
  DataModel.clearAll();
  
  // Create multiple people
  const people = [
    { firstName: 'Alice', lastName: 'Johnson', birthDate: '1992-03-22' },
    { firstName: 'Bob', lastName: 'Williams', birthDate: '1978-11-30' },
    { firstName: 'Carol', lastName: 'Brown', birthDate: '2005-07-04' }
  ];
  
  people.forEach(data => {
    DataModel.create('Person', data);
  });
  
  console.log('Created', DataModel.getInstances('Person').length, 'people');
  
  // Find specific person
  const alice = DataModel.findOne('Person', p => p.firstName === 'Alice');
  console.log('Found:', alice.toString());
  
  // Transform all
  const referenceDate = new Date('2026-01-10');
  DataModel.getInstances('Person').forEach(person => {
    DataModel.transform(person, 'TransformedPerson', { referenceDate });
  });
  
  console.log('Transformed', DataModel.getInstances('TransformedPerson').length, 'people');
  
  // Get statistics
  const stats = DataModel.getStatistics();
  console.log('\n--- Statistics ---');
  console.log(JSON.stringify(stats, null, 2));
}

/**
 * Example 4: Validation
 */
function example4_validation() {
  console.log('\n✅ Example 4: Validation');
  console.log('='.repeat(60));
  
  // Valid person
  const validPerson = new Person({
    firstName: 'Valid',
    lastName: 'Person',
    birthDate: '1990-01-01'
  });
  
  const validation1 = validPerson.validate();
  console.log('Valid Person:', validation1.valid ? '✅ PASS' : '❌ FAIL');
  
  // Try to create invalid person
  try {
    const invalidPerson = new Person({
      firstName: 'Invalid',
      lastName: 'Person',
      birthDate: '2030-01-01' // Future date
    });
  } catch (error) {
    console.log('Invalid Person caught:', '✅', error.message);
  }
  
  // Transformed person validation
  const transformed = new TransformedPerson({
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'Jane Doe',
    age: 26
  });
  
  const validation2 = transformed.validate();
  console.log('Transformed Person:', validation2.valid ? '✅ PASS' : '❌ FAIL');
}

/**
 * Example 5: Import/Export
 */
function example5_importExport() {
  console.log('\n💾 Example 5: Import/Export');
  console.log('='.repeat(60));
  
  DataModel.clearAll();
  
  // Create people
  DataModel.create('Person', {
    firstName: 'Export',
    lastName: 'Test',
    birthDate: '1995-05-15'
  });
  
  // Export to JSON
  const exported = DataModel.exportToJSON('Person');
  console.log('--- Exported JSON ---');
  console.log(JSON.stringify(exported, null, 2));
  
  // Export to Turtle
  const turtle = DataModel.exportToTurtle('Person');
  console.log('\n--- Exported Turtle ---');
  console.log(turtle);
  
  // Clear and re-import
  DataModel.clearInstances('Person');
  console.log('\nCleared instances:', DataModel.getInstances('Person').length);
  
  DataModel.importFromJSON('Person', exported.instances);
  console.log('Re-imported instances:', DataModel.getInstances('Person').length);
}

/**
 * Example 6: Fuseki Connector Setup
 */
function example6_fusekiSetup() {
  console.log('\n🔌 Example 6: Fuseki Connector');
  console.log('='.repeat(60));
  
  // Create connector
  const connector = createLocalConnector('test');
  console.log('Created connector:', connector.toString());
  console.log('Query endpoint:', connector.queryEndpoint);
  console.log('Update endpoint:', connector.updateEndpoint);
  
  // Generate SPARQL queries
  console.log('\n--- Sample SPARQL Query ---');
  console.log(`
PREFIX ex: <http://example.com/ex#>
SELECT ?person ?firstName ?lastName
WHERE {
  ?person a ex:Person ;
          ex:firstName ?firstName ;
          ex:lastName ?lastName .
}
  `.trim());
}

/**
 * Example 7: Fuseki Operations (requires running server)
 */
async function example7_fusekiOperations() {
  console.log('\n🚀 Example 7: Fuseki Operations');
  console.log('='.repeat(60));
  console.log('⚠️  This example requires a running Fuseki server');
  console.log('   Start Fuseki with: fuseki-server --mem /test\n');
  
  const connector = createLocalConnector('test');
  
  try {
    // Test connection
    const isAlive = await connector.ping();
    if (!isAlive) {
      console.log('❌ Fuseki server not accessible');
      return;
    }
    console.log('✅ Connected to Fuseki server');
    
    // Clear existing data
    await connector.clear();
    console.log('✅ Cleared existing data');
    
    // Create and save a person
    const person = new Person({
      firstName: 'Fuseki',
      lastName: 'Test',
      birthDate: '1988-08-08'
    });
    
    await connector.save(person);
    console.log('✅ Saved person to Fuseki');
    
    // Query back
    const retrieved = await connector.getPerson(person.uri);
    if (retrieved) {
      console.log('✅ Retrieved person:', retrieved.firstName, retrieved.lastName);
    }
    
    // Find all people
    const uris = await connector.findByType('http://example.com/ex#Person');
    console.log('✅ Found', uris.length, 'person(s) in triple store');
    
    // Get stats
    const stats = await connector.getStats();
    console.log('✅ Server statistics available');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('   Make sure Fuseki is running on http://localhost:3030');
  }
}

/**
 * Example 8: Complete Workflow
 */
async function example8_completeWorkflow() {
  console.log('\n🎯 Example 8: Complete Workflow');
  console.log('='.repeat(60));
  
  // 1. Clear data model
  DataModel.clearAll();
  
  // 2. Create source people
  const sourceData = [
    { firstName: 'Alice', lastName: 'Johnson', birthDate: '1992-03-22' },
    { firstName: 'Bob', lastName: 'Williams', birthDate: '1978-11-30' }
  ];
  
  sourceData.forEach(data => {
    DataModel.create('Person', data);
  });
  console.log('✅ Created', DataModel.getInstances('Person').length, 'source people');
  
  // 3. Transform all
  const referenceDate = new Date('2026-01-10');
  DataModel.getInstances('Person').forEach(person => {
    DataModel.transform(person, 'TransformedPerson', { referenceDate });
  });
  console.log('✅ Transformed', DataModel.getInstances('TransformedPerson').length, 'people');
  
  // 4. Validate all
  const validations = DataModel.validateAll('TransformedPerson');
  const allValid = validations.every(v => v.validation.valid);
  console.log('✅ Validation:', allValid ? 'All passed' : 'Some failed');
  
  // 5. Export
  const exported = DataModel.exportToJSON();
  console.log('✅ Exported', Object.keys(exported).length, 'class types');
  
  // 6. Try Fuseki operations (if available)
  try {
    const connector = createLocalConnector('test');
    const isAlive = await connector.ping();
    
    if (isAlive) {
      await connector.clear();
      const people = DataModel.getInstances('Person');
      await connector.saveAll(people);
      console.log('✅ Saved all to Fuseki');
    }
  } catch (error) {
    console.log('⚠️  Fuseki operations skipped (server not available)');
  }
  
  console.log('\n🎉 Workflow complete!');
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  Person/TransformedPerson Demo');
  console.log('  SHACL-based RDF Data Management');
  console.log('='.repeat(60));
  
  // Run examples
  example1_basicPerson();
  example2_transformation();
  example3_dataModel();
  example4_validation();
  example5_importExport();
  example6_fusekiSetup();
  await example7_fusekiOperations();
  await example8_completeWorkflow();
  
  console.log('\n' + '='.repeat(60));
  console.log('  Demo Complete');
  console.log('='.repeat(60) + '\n');
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Export for use as module
export {
  example1_basicPerson,
  example2_transformation,
  example3_dataModel,
  example4_validation,
  example5_importExport,
  example6_fusekiSetup,
  example7_fusekiOperations,
  example8_completeWorkflow
};
