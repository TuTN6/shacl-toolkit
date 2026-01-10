# Quick Start Guide

## Installation

1. **Install Node.js 18+**
   ```bash
   node --version  # Should be 18.0.0 or higher
   ```

2. **Extract the files**
   ```bash
   # All files should be in the same directory
   ls *.js
   # Should show: person.js, transformed-person.js, data-model.js, 
   #              fuseki-connector.js, test-data.js, test-suite.js, index.js
   ```

3. **No dependencies required!**
   This project uses only Node.js built-in modules. No npm install needed.

## Quick Test

```bash
# Run the test suite
node test-suite.js

# Expected output:
# ✅ All tests passed!
```

## Run Demo

```bash
# Run all examples
node index.js

# This will demonstrate:
# - Creating Person instances
# - Transformation to TransformedPerson
# - DataModel management
# - Validation
# - Import/Export
# - Fuseki connector setup
```

## Basic Usage

### 1. Create a Person

```javascript
import { Person } from './person.js';

const person = new Person({
  firstName: 'Jane',
  lastName: 'Doe',
  birthDate: '2000-01-01'
});

console.log(person.fullName);  // "Jane Doe"
console.log(person.getAge());  // Current age
```

### 2. Transform to Target Format

```javascript
import { TransformedPerson } from './transformed-person.js';

const transformed = TransformedPerson.fromPerson(person);
console.log(transformed.age);       // Calculated age
console.log(transformed.fullName);  // "Jane Doe"
```

### 3. Use DataModel

```javascript
import { DataModel } from './data-model.js';

// Create instances
DataModel.create('Person', {
  firstName: 'John',
  lastName: 'Smith',
  birthDate: '1985-06-15'
});

// Get all instances
const people = DataModel.getInstances('Person');
console.log(people.length);

// Export to Turtle
const turtle = DataModel.exportToTurtle();
console.log(turtle);
```

## Setting Up Fuseki (Optional)

### Download Fuseki

1. Visit https://jena.apache.org/download/
2. Download Apache Jena Fuseki
3. Extract the archive

### Start Fuseki

```bash
# Navigate to Fuseki directory
cd apache-jena-fuseki-x.x.x

# Start with in-memory dataset
./fuseki-server --mem /test

# Fuseki UI will be available at http://localhost:3030
```

### Use Fuseki Connector

```javascript
import { createLocalConnector } from './fuseki-connector.js';
import { Person } from './person.js';

const connector = createLocalConnector('test');

// Check connection
const isAlive = await connector.ping();
console.log('Connected:', isAlive);

// Save a person
const person = new Person({
  firstName: 'Alice',
  lastName: 'Johnson',
  birthDate: '1992-03-22'
});

await connector.save(person);
console.log('Saved to Fuseki!');

// Query back
const retrieved = await connector.getPerson(person.uri);
console.log(retrieved);
```

## File Structure

```
.
├── person.js                    # Person class (source model)
├── transformed-person.js        # TransformedPerson class (target model)
├── data-model.js                # DataModel manager
├── fuseki-connector.js          # Fuseki integration
├── test-data.js                 # Test data samples
├── test-suite.js                # Comprehensive tests
├── index.js                     # Demo and examples
├── person-transformation-shacl.ttl  # SHACL schema
├── package.json                 # Node.js configuration
├── README.md                    # Full documentation
├── QUICKSTART.md               # This file
└── .gitignore                   # Git ignore rules
```

## Common Tasks

### Export to Turtle RDF

```javascript
import { Person } from './person.js';

const person = new Person({
  firstName: 'Test',
  lastName: 'User',
  birthDate: '1990-01-01'
});

console.log(person.toTurtle());
```

### Validate Data

```javascript
import { Person } from './person.js';

const person = new Person({
  firstName: 'Test',
  lastName: 'User',
  birthDate: '1990-01-01'
});

const validation = person.validate();
console.log('Valid:', validation.valid);
console.log('Errors:', validation.errors);
```

### Batch Operations

```javascript
import { DataModel } from './data-model.js';

// Create multiple
const peopleData = [
  { firstName: 'Alice', lastName: 'Johnson', birthDate: '1992-03-22' },
  { firstName: 'Bob', lastName: 'Williams', birthDate: '1978-11-30' }
];

peopleData.forEach(data => DataModel.create('Person', data));

// Transform all
DataModel.getInstances('Person').forEach(person => {
  DataModel.transform(person, 'TransformedPerson');
});

// Export all
const json = DataModel.exportToJSON();
console.log(JSON.stringify(json, null, 2));
```

## Troubleshooting

### "Cannot use import statement outside a module"

Make sure package.json has `"type": "module"` or rename files to .mjs

### "fetch is not defined"

You need Node.js 18+ which includes fetch by default.

### "Cannot connect to Fuseki"

1. Check Fuseki is running: `curl http://localhost:3030/$/ping`
2. Check dataset exists: `curl http://localhost:3030/$/datasets`
3. Verify firewall settings

### Tests failing

```bash
# Run with verbose output
node test-suite.js 2>&1 | more
```

## Next Steps

1. Read the full [README.md](README.md) for complete documentation
2. Review the [SHACL schema](person-transformation-shacl.ttl)
3. Explore [index.js](index.js) for more examples
4. Check [test-suite.js](test-suite.js) for usage patterns

## Getting Help

- Check README.md for detailed API documentation
- Review test-suite.js for example usage
- Run index.js to see working examples

## Example Output

When you run `node index.js`, you'll see:

```
============================================================
  Person/TransformedPerson Demo
  SHACL-based RDF Data Management
============================================================

📝 Example 1: Basic Person Usage
============================================================
Created Person: Person { Jane Doe, born 2000-01-01, age 26 }
Full Name: Jane Doe
Age: 26
URI: http://example.com/ex#JaneDoe

--- Turtle RDF ---
@prefix ex: <http://example.com/ex#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:JaneDoe a ex:Person ;
    ex:firstName "Jane" ;
    ex:lastName "Doe" ;
    ex:birthDate "2000-01-01"^^xsd:date .

[... more examples ...]

🎉 Workflow complete!
```

---

**Ready to start!** Run `node index.js` or `node test-suite.js`
