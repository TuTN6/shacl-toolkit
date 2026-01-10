Given a source Turtle RDF file of:

```
prefix ex: <http://example.com/ex#>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>

ex:JaneDoe a ex:Person ;
   ex:firstName "Jane" ;
   ex:lastName "Doe" ;
   ex:birthDate "2000-01-01"^^xsd:date ;
   
```

and a target Turtle RDF file of:

```
prefix Person: <http://example.com/ns/Person#>
prefix Class: <http://example.com/ns/Class#>
prefix ex: <http://example.com/ex#>
prefix xsd: <http://example.com/ex#>

Person:JaneDoe a Class:Person ;
   ex:firstName "Jane" ;
   ex:lastName "Doe" ;
   Person:fullName "Jane Doe" ;
   Person:age 26 ;
   .
```

Generate a SHACL 1.2 file using https://www.w3.org/TR/shacl12-core/ including node expressions. Include sh:codeIdentifier, sh:name and sh:description resources, and be as comprehensive as possible.
