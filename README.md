# Response Parser

With this module, you can create strongly-typed parsers of arbitrary JSON objects.

You define a template and pass in an object from a deserialized JSON string.

The template defines what type each property should be and throws and error showing the path to the problem. If the object has an `id` property, this is included.