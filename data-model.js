/**
 * DataModel Class
 * Global manager for SHACL-based data models
 * Provides registry and management for otherwise unbound SHACL classes
 * 
 * @class DataModel
 * @version 1.0.0
 */

import { Person } from './person.js';
import { TransformedPerson } from './transformed-person.js';

export class DataModel {
  // Private static registry
  static #registry = new Map();
  static #instances = new Map();
  static #transformers = new Map();
  static #validators = new Map();

  /**
   * Registers a class with the DataModel
   * 
   * @param {string} name - Name of the class
   * @param {Function} classConstructor - Class constructor
   * @param {Object} options - Registration options
   * @param {string} options.rdfType - RDF type URI
   * @param {string} options.namespace - Namespace prefix
   * @param {Function} [options.transformer] - Transformation function
   * @param {Function} [options.validator] - Validation function
   */
  static registerClass(name, classConstructor, options = {}) {
    if (this.#registry.has(name)) {
      throw new Error(`Class "${name}" is already registered`);
    }

    this.#registry.set(name, {
      constructor: classConstructor,
      rdfType: options.rdfType,
      namespace: options.namespace,
      instances: []
    });

    this.#instances.set(name, []);

    if (options.transformer) {
      this.#transformers.set(name, options.transformer);
    }

    if (options.validator) {
      this.#validators.set(name, options.validator);
    }
  }

  /**
   * Gets a registered class
   * 
   * @param {string} name - Name of the class
   * @returns {Function} Class constructor
   */
  static getClass(name) {
    const entry = this.#registry.get(name);
    if (!entry) {
      throw new Error(`Class "${name}" is not registered`);
    }
    return entry.constructor;
  }

  /**
   * Creates an instance of a registered class
   * 
   * @param {string} className - Name of the registered class
   * @param {Object} data - Data for the instance
   * @returns {Object} New instance
   */
  static create(className, data) {
    const ClassConstructor = this.getClass(className);
    const instance = new ClassConstructor(data);
    
    // Track the instance
    const instances = this.#instances.get(className);
    instances.push(instance);
    
    return instance;
  }

  /**
   * Gets all instances of a registered class
   * 
   * @param {string} className - Name of the registered class
   * @returns {Array} Array of instances
   */
  static getInstances(className) {
    if (!this.#instances.has(className)) {
      throw new Error(`Class "${className}" is not registered`);
    }
    return [...this.#instances.get(className)];
  }

  /**
   * Transforms an instance from one class to another
   * 
   * @param {Object} instance - Source instance
   * @param {string} targetClassName - Target class name
   * @param {Object} [options={}] - Transformation options
   * @returns {Object} Transformed instance
   */
  static transform(instance, targetClassName, options = {}) {
    const transformer = this.#transformers.get(targetClassName);
    
    if (!transformer) {
      throw new Error(`No transformer registered for "${targetClassName}"`);
    }

    const transformed = transformer(instance, options);
    
    // Track the transformed instance
    const instances = this.#instances.get(targetClassName);
    if (instances) {
      instances.push(transformed);
    }
    
    return transformed;
  }

  /**
   * Validates an instance against its registered validator
   * 
   * @param {string} className - Name of the class
   * @param {Object} instance - Instance to validate
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  static validateInstance(className, instance) {
    const validator = this.#validators.get(className);
    
    if (!validator) {
      // Use built-in validate method if available
      if (typeof instance.validate === 'function') {
        return instance.validate();
      }
      return { valid: true, errors: [] };
    }

    return validator(instance);
  }

  /**
   * Validates all instances of a class
   * 
   * @param {string} className - Name of the class
   * @returns {Array} Array of validation results
   */
  static validateAll(className) {
    const instances = this.getInstances(className);
    return instances.map(instance => ({
      instance,
      validation: this.validateInstance(className, instance)
    }));
  }

  /**
   * Clears all instances of a class
   * 
   * @param {string} className - Name of the class
   */
  static clearInstances(className) {
    if (this.#instances.has(className)) {
      this.#instances.set(className, []);
    }
  }

  /**
   * Clears all instances of all classes
   */
  static clearAll() {
    for (const className of this.#instances.keys()) {
      this.#instances.set(className, []);
    }
  }

  /**
   * Gets all registered class names
   * 
   * @returns {Array<string>} Array of class names
   */
  static getRegisteredClasses() {
    return Array.from(this.#registry.keys());
  }

  /**
   * Gets metadata for a registered class
   * 
   * @param {string} className - Name of the class
   * @returns {Object} Class metadata
   */
  static getClassMetadata(className) {
    const entry = this.#registry.get(className);
    if (!entry) {
      throw new Error(`Class "${className}" is not registered`);
    }

    return {
      name: className,
      rdfType: entry.rdfType,
      namespace: entry.namespace,
      instanceCount: this.#instances.get(className)?.length || 0,
      hasTransformer: this.#transformers.has(className),
      hasValidator: this.#validators.has(className)
    };
  }

  /**
   * Exports all instances to JSON
   * 
   * @param {string} [className] - Optional class name to export only that class
   * @returns {Object} JSON representation of instances
   */
  static exportToJSON(className) {
    if (className) {
      const instances = this.getInstances(className);
      return {
        class: className,
        instances: instances.map(inst => inst.toJSON ? inst.toJSON() : inst)
      };
    }

    const result = {};
    for (const [name, instances] of this.#instances.entries()) {
      result[name] = instances.map(inst => inst.toJSON ? inst.toJSON() : inst);
    }
    return result;
  }

  /**
   * Exports all instances to Turtle RDF
   * 
   * @param {string} [className] - Optional class name to export only that class
   * @returns {string} Turtle RDF representation
   */
  static exportToTurtle(className) {
    if (className) {
      const instances = this.getInstances(className);
      return instances
        .map((inst, index) => inst.toTurtle ? inst.toTurtle(index === 0) : '')
        .filter(Boolean)
        .join('\n\n');
    }

    const parts = [];
    let isFirst = true;
    
    for (const [name, instances] of this.#instances.entries()) {
      for (const inst of instances) {
        if (inst.toTurtle) {
          parts.push(inst.toTurtle(isFirst));
          isFirst = false;
        }
      }
    }
    
    return parts.join('\n\n');
  }

  /**
   * Imports instances from JSON
   * 
   * @param {string} className - Name of the class
   * @param {Array} data - Array of instance data
   * @returns {Array} Created instances
   */
  static importFromJSON(className, data) {
    const ClassConstructor = this.getClass(className);
    const instances = [];

    for (const item of data) {
      const instance = ClassConstructor.fromJSON ? 
        ClassConstructor.fromJSON(item) : 
        new ClassConstructor(item);
      instances.push(instance);
      
      // Track the instance
      const tracked = this.#instances.get(className);
      tracked.push(instance);
    }

    return instances;
  }

  /**
   * Finds instances matching a predicate function
   * 
   * @param {string} className - Name of the class
   * @param {Function} predicate - Function to test each instance
   * @returns {Array} Matching instances
   */
  static find(className, predicate) {
    const instances = this.getInstances(className);
    return instances.filter(predicate);
  }

  /**
   * Finds a single instance matching a predicate function
   * 
   * @param {string} className - Name of the class
   * @param {Function} predicate - Function to test each instance
   * @returns {Object|null} First matching instance or null
   */
  static findOne(className, predicate) {
    const instances = this.getInstances(className);
    return instances.find(predicate) || null;
  }

  /**
   * Finds an instance by URI
   * 
   * @param {string} className - Name of the class
   * @param {string} uri - URI to search for
   * @returns {Object|null} Matching instance or null
   */
  static findByUri(className, uri) {
    return this.findOne(className, inst => inst.uri === uri);
  }

  /**
   * Gets statistics about the data model
   * 
   * @returns {Object} Statistics object
   */
  static getStatistics() {
    const stats = {
      totalClasses: this.#registry.size,
      totalInstances: 0,
      classes: {}
    };

    for (const [name, instances] of this.#instances.entries()) {
      stats.totalInstances += instances.length;
      stats.classes[name] = {
        count: instances.length,
        metadata: this.getClassMetadata(name)
      };
    }

    return stats;
  }

  /**
   * Initializes the DataModel with default classes
   */
  static initialize() {
    // Register Person class
    this.registerClass('Person', Person, {
      rdfType: 'http://example.com/ex#Person',
      namespace: 'ex'
    });

    // Register TransformedPerson class with transformer
    this.registerClass('TransformedPerson', TransformedPerson, {
      rdfType: 'http://example.com/ns/Class#Person',
      namespace: 'Person',
      transformer: (person, options = {}) => {
        return TransformedPerson.fromPerson(person, options.referenceDate);
      }
    });
  }
}

// Auto-initialize with default classes
DataModel.initialize();
